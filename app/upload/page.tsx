"use client";

import DashboardLayout from "@/app/dashboard-layout";
import { UploadDropzone } from "@/app/components/UploadDropzone";
import { useRouter } from "next/navigation";
import { processAndSaveVariants } from "@/services/variants.service";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

type PipelineState = "idle" | "processing" | "success" | "error";

const COMMON_DRUGS = [
  "Clopidogrel", "Warfarin", "Simvastatin", "Codeine", "Tamoxifen",
  "Azathioprine", "5-Fluorouracil", "Capecitabine", "Omeprazole",
  "Tricyclic Antidepressants", "SSRIs", "Phenytoin", "Other"
];

export default function UploadPage() {
  const router   = useRouter();
  const { user } = useAuth();

  const [state, setState]   = useState<PipelineState>("idle");
  const [errorMsg, setError] = useState("");
  const [warnMsg, setWarn]   = useState("");
  const [drug, setDrug]      = useState("");
  const [customDrug, setCustomDrug] = useState("");
  const [patientId, setPatientId]   = useState("");
  const [processedCount, setProcessedCount] = useState(0);
  const [fileType, setFileType] = useState<"json" | "vcf" | "">("");

  const effectiveDrug = drug === "Other" ? customDrug : drug;

  const handleUploadComplete = async (
    _url: string,
    jsonData: any[],
    detectedFileType: "json" | "vcf"
  ) => {
    if (!user) return;
    setFileType(detectedFileType);
    setState("processing");
    setError("");

    try {
      const result = await processAndSaveVariants(
        user.uid,
        jsonData,
        effectiveDrug,
        patientId
      );
      setProcessedCount(result.processed);
      setState("success");
      setTimeout(() => router.push("/results"), 2000);
    } catch (error: any) {
      console.error("Processing failed", error);
      setError(error.message || "Failed to process variants. See console for details.");
      setState("error");
    }
  };

  const handleError = (msg: string) => {
    setError(msg);
    setState("error");
  };

  const handleWarning = (msg: string) => {
    setWarn(msg);
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Monitoring</h2>
          <p className="text-on-surface-variant mt-2 text-sm">
            Upload genomic data and run the pharmacogenomics analysis pipeline.
          </p>
        </div>
        <span className="px-4 py-2 bg-secondary/10 text-secondary rounded text-xs font-bold tracking-widest uppercase border border-secondary/20">
          VCF / JSON
        </span>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">

        {/* ── Patient & Drug context panel ──────────────────────────────── */}
        <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/10">
          <div className="p-5 border-b border-outline-variant/10">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Clinical Context</h3>
            <p className="text-xs text-on-surface-variant mt-1">Required for structured report generation and CPIC matching.</p>
          </div>
          <div className="p-6 grid sm:grid-cols-2 gap-5">
            {/* Patient ID */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block">
                Patient ID (optional)
              </label>
              <div className="flex items-center gap-2 bg-surface-container rounded border border-outline-variant/20 px-3 py-2.5">
                <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: "16px" }}>badge</span>
                <input
                  type="text"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  placeholder="e.g. PT-20240001"
                  className="bg-transparent outline-none text-sm text-primary placeholder:text-on-surface-variant/50 w-full"
                />
              </div>
            </div>

            {/* Drug selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block">
                Drug of Interest (optional)
              </label>
              <div className="flex items-center gap-2 bg-surface-container rounded border border-outline-variant/20 px-3 py-2.5">
                <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: "16px" }}>medication</span>
                <select
                  value={drug}
                  onChange={(e) => setDrug(e.target.value)}
                  className="bg-transparent outline-none text-sm text-primary w-full cursor-pointer appearance-none"
                >
                  <option value="" className="bg-surface-container text-primary">Select drug...</option>
                  {COMMON_DRUGS.map((d) => (
                    <option key={d} value={d} className="bg-surface-container text-primary">{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Custom drug input */}
            {drug === "Other" && (
              <div className="sm:col-span-2 space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block">
                  Specify Drug
                </label>
                <div className="flex items-center gap-2 bg-surface-container rounded border border-outline-variant/20 px-3 py-2.5">
                  <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: "16px" }}>edit</span>
                  <input
                    type="text"
                    value={customDrug}
                    onChange={(e) => setCustomDrug(e.target.value)}
                    placeholder="Enter drug name..."
                    className="bg-transparent outline-none text-sm text-primary placeholder:text-on-surface-variant/50 w-full"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Upload panel ───────────────────────────────────────────────── */}
        <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/10">
          <div className="p-5 border-b border-outline-variant/10 flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Genomic Data Ingestion</h3>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">STEP 2 OF 2</span>
          </div>
          <div className="p-6 space-y-4">
            <UploadDropzone
              onUploadComplete={handleUploadComplete}
              onError={handleError}
              onWarning={handleWarning}
            />

            {/* Warning */}
            {warnMsg && (
              <div className="p-4 bg-tertiary/10 rounded-lg flex items-start gap-3 border border-tertiary/20">
                <span className="material-symbols-outlined text-tertiary shrink-0">warning</span>
                <p className="text-sm text-on-surface-variant">{warnMsg}</p>
              </div>
            )}

            {/* Processing */}
            {state === "processing" && (
              <div className="p-4 bg-secondary/10 rounded-lg flex items-center gap-4 border border-secondary/20">
                <span className="material-symbols-outlined text-secondary animate-spin">autorenew</span>
                <div>
                  <p className="text-sm font-bold text-primary">Running Pharmacogenomics Pipeline...</p>
                  <p className="text-xs text-on-surface-variant">
                    {fileType === "vcf" ? "Parsing VCF" : "Parsing JSON"} → Gene detection → CPIC risk scoring → Firestore
                  </p>
                </div>
              </div>
            )}

            {/* Success */}
            {state === "success" && (
              <div className="p-4 bg-secondary/10 rounded-lg flex items-center gap-4 border border-secondary/20">
                <span className="material-symbols-outlined text-secondary">check_circle</span>
                <div>
                  <p className="text-sm font-bold text-primary">Analysis Complete — {processedCount.toLocaleString()} variants processed</p>
                  <p className="text-xs text-on-surface-variant">Redirecting to Analytics dashboard...</p>
                </div>
              </div>
            )}

            {/* Error */}
            {state === "error" && (
              <div className="p-4 bg-error/10 rounded-lg flex items-start gap-4 border border-error/20">
                <span className="material-symbols-outlined text-error shrink-0">error</span>
                <div>
                  <p className="text-sm font-bold text-error">Processing Failed</p>
                  <p className="text-xs text-on-surface-variant mt-1">{errorMsg}</p>
                  <button
                    onClick={() => { setState("idle"); setError(""); }}
                    className="mt-2 text-xs font-bold text-secondary hover:underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Pipeline steps ─────────────────────────────────────────────── */}
        <div className="bg-surface-container-low rounded-lg overflow-hidden">
          <div className="p-5 border-b border-outline-variant/10">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Pipeline Overview</h3>
          </div>
          <div className="divide-y divide-outline-variant/10">
            {[
              { step: "01", icon: "upload_file",   label: "File Ingestion",       desc: "Accepts VCF text files and JSON variant arrays (max 10 MB / 5,000 variants)", color: "text-secondary", bg: "bg-secondary/10" },
              { step: "02", icon: "data_object",   label: "Variant Extraction",   desc: "Parses CHROM, POS, REF, ALT, INFO fields. Detects GENEINFO and star alleles", color: "text-tertiary",  bg: "bg-tertiary/10"  },
              { step: "03", icon: "biotech",        label: "Gene Identification",  desc: "Flags CYP2D6, CYP2C19, CYP2C9, SLCO1B1, TPMT, DPYD as priority CPIC genes",   color: "text-secondary", bg: "bg-secondary/10" },
              { step: "04", icon: "analytics",      label: "CPIC Risk Scoring",   desc: "Classifies each variant as Safe / Adjust Dosage / Toxic / Ineffective / Unknown", color: "text-tertiary", bg: "bg-tertiary/10" },
              { step: "05", icon: "psychology",     label: "AI Explanation",      desc: "Gemini generates clinical reasoning for high-risk variants only (Toxic/Adjust Dosage)", color: "text-secondary", bg: "bg-secondary/10" },
              { step: "06", icon: "cloud_upload",   label: "Firestore Storage",   desc: "Results stored in real-time. Alerts auto-generated for critical findings",    color: "text-tertiary",  bg: "bg-tertiary/10"  },
            ].map((s) => (
              <div key={s.step} className="p-5 flex items-center gap-4 hover:bg-surface-container-high transition-colors">
                <span className="text-[10px] font-bold text-on-surface-variant w-5 shrink-0">{s.step}</span>
                <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center ${s.color} shrink-0`}>
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>{s.icon}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-primary">{s.label}</p>
                  <p className="text-xs text-on-surface-variant leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
