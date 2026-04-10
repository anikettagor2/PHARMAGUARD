import { collection, writeBatch, doc, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Variant, Alert, PharmacogenomicReport, RiskLevel } from "@/types";
import { parseInfo, normalizeMutation } from "@/utils/parseInfo";
import { computeRisk, CPIC_GENES } from "@/utils/risk";
import { getRecommendation } from "@/utils/recommend";
import { GENE_DRUGS } from "@/utils/drugData";

const HIGH_RISK_LEVELS: Set<RiskLevel> = new Set(["Toxic", "Adjust Dosage"]);

/**
 * Main pipeline entry point.
 * Maps raw records (JSON or VCF) → Variant objects → Firestore.
 */
export async function processAndSaveVariants(
  userId: string,
  rawData: any[],
  drug: string = "",
  patientId: string = ""
): Promise<{ processed: number; toxic: number; adjustDosage: number }> {
  if (!rawData || rawData.length === 0) return { processed: 0, toxic: 0, adjustDosage: 0 };

  const variants: Variant[] = rawData.map((r) => {
    const gene      = String(r.gene || r.GENE || r.GENEINFO?.split(":")?.[0] || "Unknown").trim().toUpperCase();
    const pos       = String(r.POS || r.pos || "");
    const ref       = String(r.REF || r.ref || "");
    const alt       = String(r.ALT || r.alt || "");
    const infoStr   = String(r.INFO || r.info || "");
    const chrom     = String(r.CHROM || r.chrom || r.chromosome || "");

    const parsedInfo = parseInfo(infoStr);
    const mutation   = normalizeMutation(ref, alt);
    const { risk, score, severity } = computeRisk(parsedInfo.CLNSIG, gene, infoStr);
    const recommendation = getRecommendation(risk, gene);
    const isCpicGene     = CPIC_GENES.has(gene);

    return {
      userId,
      gene,
      mutation,
      pos,
      ref,
      alt,
      chromosome: chrom,
      info: infoStr,
      significance: parsedInfo.CLNSIG,
      risk,
      score,
      severity,
      genePriority: isCpicGene,
      cpicGene: isCpicGene,
      recommendation,
      drugSuggestions: GENE_DRUGS[gene]?.drugs.map(d => d.name).join(", ") || "",
      explanation: GENE_DRUGS[gene]?.drugs[0]?.explanation || "",
      duration: GENE_DRUGS[gene]?.drugs[0]?.duration || "As per clinical need",
      effectOnBody: GENE_DRUGS[gene]?.drugs[0]?.effectOnBody || undefined,
      drug: drug || "",
      patientId: patientId || "",
      createdAt: Date.now(),
    };
  });

  // ── Batch write to Firestore (max 500 per batch) ─────────────────────────
  let totalToxic = 0;
  let totalAdjust = 0;
  const CHUNK = 400;

  for (let i = 0; i < variants.length; i += CHUNK) {
    const chunk = variants.slice(i, i + CHUNK);
    const batch = writeBatch(db);

    for (const v of chunk) {
      const docRef = doc(collection(db, "variants"));
      v.id = docRef.id;
      batch.set(docRef, v);

      if (v.risk === "Toxic") {
        totalToxic++;
        const alertRef  = doc(collection(db, "alerts"));
        const alertData: Omit<Alert, "id"> = {
          message:   `Toxic variant on ${v.gene} (${v.mutation}): ${v.recommendation.substring(0, 100)}`,
          severity:  "critical",
          variantId: v.id,
          userId:    v.userId!,
          createdAt: Date.now(),
          read:      false,
        };
        batch.set(alertRef, alertData);
      }

      if (v.risk === "Adjust Dosage") {
        totalAdjust++;
        const alertRef  = doc(collection(db, "alerts"));
        const alertData: Omit<Alert, "id"> = {
          message:   `Dose adjustment required for ${v.gene}: ${v.recommendation.substring(0, 100)}`,
          severity:  "warning",
          variantId: v.id,
          userId:    v.userId!,
          createdAt: Date.now(),
          read:      false,
        };
        batch.set(alertRef, alertData);
      }
    }

    await batch.commit();
  }

  return { processed: variants.length, toxic: totalToxic, adjustDosage: totalAdjust };
}

/**
 * Generates a structured pharmacogenomic report from processed variants.
 */
export function buildReport(
  variants: Variant[],
  patientId: string,
  drug: string
): PharmacogenomicReport {
  const riskCounts = {
    toxic:        variants.filter((v) => v.risk === "Toxic").length,
    adjustDosage: variants.filter((v) => v.risk === "Adjust Dosage").length,
    ineffective:  variants.filter((v) => v.risk === "Ineffective").length,
    safe:         variants.filter((v) => v.risk === "Safe").length,
    unknown:      variants.filter((v) => v.risk === "Unknown").length,
  };

  // Overall risk = worst case
  let overall: RiskLevel = "Unknown";
  if (riskCounts.toxic > 0)        overall = "Toxic";
  else if (riskCounts.adjustDosage > 0) overall = "Adjust Dosage";
  else if (riskCounts.ineffective > 0)  overall = "Ineffective";
  else if (riskCounts.safe > 0)         overall = "Safe";

  const profile: PharmacogenomicReport["pharmacogenomicProfile"] = {};
  for (const v of variants) {
    if (!profile[v.gene] || HIGH_RISK_LEVELS.has(v.risk)) {
      profile[v.gene] = {
        gene:        v.gene,
        cpicGene:    v.cpicGene,
        risk:        v.risk,
        mutation:    v.mutation,
        recommendation: v.recommendation,
      };
    }
  }

  const genesIdentified = [...new Set(variants.map((v) => v.gene).filter((g) => g !== "Unknown"))];
  const confidenceAvg =
    variants.length > 0
      ? parseFloat((variants.reduce((s, v) => s + v.score, 0) / variants.length).toFixed(2))
      : 0;

  const recommendations = [
    ...new Set(
      variants
        .filter((v) => HIGH_RISK_LEVELS.has(v.risk) || v.risk === "Ineffective")
        .map((v) => v.recommendation)
    ),
  ].slice(0, 10);

  return {
    patientId:        patientId || "ANON",
    drug:             drug || "Not specified",
    analysisDate:     new Date().toISOString(),
    totalVariants:    variants.length,
    riskAssessment: {
      overall,
      ...riskCounts,
    },
    pharmacogenomicProfile: profile,
    recommendations,
    qualityMetrics: {
      variantsProcessed: variants.length,
      variantsFiltered:  0,
      confidenceAvg,
      genesIdentified,
    },
  };
}

export async function markAlertAsRead(alertId: string): Promise<void> {
  const batch = writeBatch(db);
  const alertRef = doc(db, "alerts", alertId);
  batch.update(alertRef, { read: true });
  await batch.commit();
}

export async function getVariantsByPatient(patientId: string): Promise<Variant[]> {
  const q = query(
    collection(db, "variants"),
    where("patientId", "==", patientId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Variant));
}

export { HIGH_RISK_LEVELS };
