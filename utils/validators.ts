import { parseVcfText } from "@/utils/parseInfo";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_VARIANTS = 5000;

export interface ValidationResult {
  valid: boolean;
  error?: string;
  warning?: string;
  data?: any[];
  fileType?: "json" | "vcf";
  truncated?: boolean;
}

/**
 * Validates and parses a genomic data file.
 * Supports:
 *   - JSON arrays of variant objects
 *   - JSON objects with a `variants` key
 *   - VCF text files (.vcf)
 * Returns parsed data ready for the processing pipeline.
 */
export async function validateAndParseFile(file: File): Promise<ValidationResult> {
  // ── 1. Size check ────────────────────────────────────────────────────────
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)} MB. Maximum allowed is 10 MB.`,
    };
  }

  const text = await readFileAsText(file);
  const ext  = file.name.toLowerCase();

  // ── 2. VCF text format ───────────────────────────────────────────────────
  if (ext.endsWith(".vcf") || text.startsWith("##fileformat=VCF")) {
    const records = parseVcfText(text);

    if (records.length === 0) {
      return { valid: false, error: "VCF file contains no valid data rows." };
    }

    const { data, truncated } = applyLimit(records);
    return {
      valid: true,
      data,
      truncated,
      fileType: "vcf",
      warning: truncated ? `VCF contains ${records.length} variants — only the first ${MAX_VARIANTS} will be processed.` : undefined,
    };
  }

  // ── 3. JSON format ───────────────────────────────────────────────────────
  if (ext.endsWith(".json") || text.trimStart().startsWith("[") || text.trimStart().startsWith("{")) {
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      return { valid: false, error: "File is not valid JSON. Please check the format." };
    }

    let arr: any[] = [];
    if (Array.isArray(parsed)) {
      arr = parsed;
    } else if (parsed && Array.isArray(parsed.variants)) {
      arr = parsed.variants;
    } else if (parsed && Array.isArray(parsed.data)) {
      arr = parsed.data;
    } else {
      return {
        valid: false,
        error: "JSON must be an array of variants or an object with a `variants` array.",
      };
    }

    if (arr.length === 0) {
      return { valid: false, error: "JSON file contains no variant records." };
    }

    // Structural check — require at minimum POS + REF + ALT OR gene
    const sampleSize = Math.min(arr.length, 10);
    const sample = arr.slice(0, sampleSize);
    const hasRequiredFields = sample.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        (item.gene || item.GENE || item.POS || item.pos)
    );

    if (!hasRequiredFields) {
      return {
        valid: false,
        error: "JSON variant objects must have at least a `gene` or `POS` field. Ensure the file matches the expected pharmacogenomics variant schema.",
      };
    }

    const { data, truncated } = applyLimit(arr);
    return {
      valid: true,
      data,
      truncated,
      fileType: "json",
      warning: truncated ? `File contains ${arr.length} variants — only the first ${MAX_VARIANTS} will be processed.` : undefined,
    };
  }

  return {
    valid: false,
    error: "Unsupported file type. Please upload a .json or .vcf file.",
  };
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsText(file);
  });
}

function applyLimit(arr: any[]): { data: any[]; truncated: boolean } {
  if (arr.length > MAX_VARIANTS) {
    return { data: arr.slice(0, MAX_VARIANTS), truncated: true };
  }
  return { data: arr, truncated: false };
}

// Keep legacy function for backward compatibility
export function validateVariantFile(data: any[]): boolean {
  if (!Array.isArray(data)) return false;
  return data.length > 0;
}
