import { RiskLevel, SeverityLevel } from "@/types";

// ─── Priority genes per CPIC guidelines ─────────────────────────────────────
export const CPIC_GENES = new Set([
  "CYP2D6", "CYP2C19", "CYP2C9", "SLCO1B1", "TPMT", "DPYD",
  "CYP3A4", "CYP3A5", "UGT1A1", "VKORC1", "G6PD", "NUDT15"
]);

interface RiskResult {
  risk: RiskLevel;
  score: number;
  severity: SeverityLevel;
}

/**
 * Full CPIC-based risk engine.
 * Combines ClinVar significance + gene identity + allele impact.
 */
export function computeRisk(
  significance: string,
  gene: string = "",
  info: string = ""
): RiskResult {
  const sig = significance.toLowerCase().trim();
  const g = gene.toUpperCase();
  const isCpicGene = CPIC_GENES.has(g);

  // ── Parse functional allele info (star alleles, function annotation) ────
  const infoLower = info.toLowerCase();
  const hasNoFunction   = infoLower.includes("no function") || infoLower.includes("non-functional");
  const hasDecrFunction = infoLower.includes("decreased function") || infoLower.includes("reduced function");
  const hasPoorMet      = infoLower.includes("poor metabolizer") || infoLower.includes("pm)");
  const hasUltraMet     = infoLower.includes("ultrarapid") || infoLower.includes("um)");
  const hasStarAllele   = /\*[0-9]+/.test(info);

  // ── ClinVar significance → risk ──────────────────────────────────────────
  if (sig.includes("pathogenic") && !sig.includes("likely")) {
    // Full pathogenic — always toxic
    return { risk: "Toxic", score: clamp(0.88 + genePenalty(isCpicGene, 0.1)), severity: "Critical" };
  }

  if (sig.includes("likely_pathogenic") || sig.includes("likely pathogenic")) {
    // Likely pathogenic — CPIC genes → Toxic, others → Adjust Dosage
    return isCpicGene
      ? { risk: "Toxic", score: 0.8, severity: "High" }
      : { risk: "Adjust Dosage", score: 0.72, severity: "High" };
  }

  if (sig.includes("drug response") || hasUltraMet) {
    // Ultrarapid metabolizers → Ineffective (drug may be cleared too fast)
    return { risk: "Ineffective", score: 0.65, severity: "Medium" };
  }

  if (sig.includes("uncertain") || sig.includes("conflict") || hasDecrFunction) {
    // Decreased function or uncertain — warranting dosage adjustment
    if (isCpicGene) return { risk: "Adjust Dosage", score: 0.60, severity: "Medium" };
    return { risk: "Adjust Dosage", score: 0.50, severity: "Medium" };
  }

  if (hasPoorMet || hasNoFunction) {
    // Poor/no function metabolizers — toxic accumulation risk
    return { risk: "Toxic", score: 0.78, severity: "High" };
  }

  if (sig.includes("likely_benign") || sig.includes("likely benign")) {
    return { risk: "Safe", score: 0.22, severity: "Low" };
  }

  if (sig.includes("benign")) {
    return { risk: "Safe", score: 0.1, severity: "Low" };
  }

  // Star allele with CPIC gene but unknown significance → monitor
  if (hasStarAllele && isCpicGene) {
    return { risk: "Adjust Dosage", score: 0.45, severity: "Medium" };
  }

  return { risk: "Unknown", score: 0.3, severity: "Unknown" };
}

function genePenalty(isCpic: boolean, boost: number) {
  return isCpic ? boost : 0;
}

function clamp(n: number) {
  return Math.min(1, Math.max(0, parseFloat(n.toFixed(2))));
}
