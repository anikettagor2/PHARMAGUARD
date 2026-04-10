import { CPIC_GENES } from "@/utils/risk";

export function parseInfo(infoStr: string): { CLNSIG: string; CLNDN: string; MC: string } {
  if (!infoStr) {
    return { CLNSIG: "Unknown", CLNDN: "Unknown", MC: "Unknown" };
  }

  const infoObj: Record<string, string> = {};
  infoStr.split(";").forEach((part) => {
    const eq = part.indexOf("=");
    if (eq > -1) {
      const key = part.slice(0, eq).trim();
      const val = part.slice(eq + 1).trim();
      if (key) infoObj[key] = val;
    }
  });

  let clnsig = infoObj["CLNSIG"] || "Unknown";

  // If multiple significances, pick worst-case
  if (clnsig.includes("|") || clnsig.includes(",")) {
    const ORDER = [
      "pathogenic",
      "likely_pathogenic",
      "drug_response",
      "uncertain_significance",
      "conflicting",
      "likely_benign",
      "benign",
    ];
    const sigs = clnsig.split(/[|,]/).map((s) => s.trim().toLowerCase());
    let resolved = sigs[0];
    for (const priority of ORDER) {
      if (sigs.some((s) => s.includes(priority))) {
        resolved = priority;
        break;
      }
    }
    clnsig = resolved;
  }

  return {
    CLNSIG: clnsig,
    CLNDN: infoObj["CLNDN"]?.replace(/_/g, " ") || "Unknown",
    MC: infoObj["MC"] || "Unknown",
  };
}

export function normalizeMutation(ref: string, alt: string): string {
  if (!ref && !alt) return "Unknown";
  const r = String(ref || "").trim();
  const a = String(alt || "").trim();
  if (r === a) return `${r}= (synonymous)`;
  return `${r}>${a}`;
}

// ─── VCF TEXT FILE PARSER ────────────────────────────────────────────────────
export interface VcfRecord {
  CHROM: string;
  POS: string;
  ID: string;
  REF: string;
  ALT: string;
  QUAL: string;
  FILTER: string;
  INFO: string;
  gene: string;
}

/**
 * Parses a VCF text file (the actual .vcf format) into an array of records
 * compatible with the variant processing pipeline.
 */
export function parseVcfText(text: string): VcfRecord[] {
  const lines = text.split("\n");
  const records: VcfRecord[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    // Skip header and meta lines
    if (!line || line.startsWith("#")) continue;

    const cols = line.split("\t");
    if (cols.length < 8) continue;

    const [CHROM, POS, ID, REF, ALT, QUAL, FILTER, INFO] = cols;

    // Extract GENEINFO or GENE from INFO field
    let gene = "Unknown";
    const geneInfoMatch = INFO.match(/GENEINFO=([^;|]+)/i);
    const geneMatch     = INFO.match(/GENE=([^;|]+)/i);
    const geneNameMatch = INFO.match(/CLNVC[^;]*;([A-Z0-9]+)\|/i);

    if (geneInfoMatch) {
      // GENEINFO=GENE:12345 — take just the gene name
      gene = geneInfoMatch[1].split(":")[0].trim();
    } else if (geneMatch) {
      gene = geneMatch[1].trim();
    } else {
      // Attempt to infer from CLNDN (contains gene names often)
      const clndnMatch = INFO.match(/CLNDN=([^;]+)/i);
      if (clndnMatch) {
        const knownGenes = Array.from(CPIC_GENES);
        const found = knownGenes.find((g) =>
          clndnMatch[1].toUpperCase().includes(g)
        );
        gene = found || "Unknown";
      }
    }

    // Handle multi-allelic — split into individual records
    const alts = ALT.split(",");
    for (const alt of alts) {
      records.push({ CHROM, POS, ID, REF, ALT: alt.trim(), QUAL, FILTER, INFO, gene });
    }
  }

  return records;
}
