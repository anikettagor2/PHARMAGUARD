"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { validateAndParseFile } from "@/utils/validators";

interface UploadDropzoneProps {
  onUploadComplete: (url: string, fileData: any[], fileType: "json" | "vcf") => void;
  onError: (msg: string) => void;
  onWarning?: (msg: string) => void;
}

export function UploadDropzone({ onUploadComplete, onError, onWarning }: UploadDropzoneProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<"idle" | "validating" | "uploading">("idle");

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (rejectedFiles.length > 0) {
        onError("Unsupported file type. Please upload a .json or .vcf file.");
        return;
      }
      const file = acceptedFiles[0];
      if (!file) return;

      setUploading(true);
      setStage("validating");

      // ── Validate + parse ───────────────────────────────────────────────
      const result = await validateAndParseFile(file);
      if (!result.valid) {
        onError(result.error!);
        setUploading(false);
        setStage("idle");
        return;
      }
      if (result.warning && onWarning) {
        onWarning(result.warning);
      }

      setStage("uploading");

      // ── Upload raw file to Firebase Storage ────────────────────────────
      const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          setProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        },
        (err) => {
          console.error("Storage upload error:", err);
          onError("Upload failed. Please check your connection and try again.");
          setUploading(false);
          setStage("idle");
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setUploading(false);
          setProgress(0);
          setStage("idle");
          onUploadComplete(downloadURL, result.data!, result.fileType!);
        }
      );
    },
    [onUploadComplete, onError, onWarning]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/json": [".json"],
      "text/plain": [".vcf"],
      "text/x-vcard": [".vcf"],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  const stageLabel: Record<string, string> = {
    validating: "Validating file format...",
    uploading:  `Uploading to secure storage... ${Math.round(progress)}%`,
  };

  return (
    <div
      {...getRootProps()}
      className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors duration-300 ${
        uploading
          ? "cursor-not-allowed opacity-75 border-outline-variant"
          : isDragActive
          ? "border-secondary bg-surface-container-high cursor-copy"
          : "border-outline-variant hover:border-secondary hover:bg-surface-container cursor-pointer"
      }`}
    >
      <input {...getInputProps()} />

      {/* Icon */}
      <span
        className={`material-symbols-outlined mb-4 block transition-colors ${
          isDragActive ? "text-secondary" : "text-on-surface-variant"
        }`}
        style={{ fontSize: "48px" }}
      >
        {isDragActive ? "file_download" : "upload_file"}
      </span>

      {uploading ? (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-secondary animate-spin" style={{ fontSize: "16px" }}>
              autorenew
            </span>
            <p className="text-sm font-medium text-on-surface-variant">{stageLabel[stage]}</p>
          </div>
          {stage === "uploading" && (
            <div className="w-full bg-surface-container-lowest rounded-full h-1.5">
              <div
                className="bg-secondary h-1.5 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(70,250,156,0.4)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      ) : (
        <>
          <p className="text-lg font-bold text-primary mb-1">
            {isDragActive ? "Drop file here to analyze" : "Drag & drop genomic data file"}
          </p>
          <p className="text-on-surface-variant text-sm mb-4">
            or click to browse
          </p>
          <div className="flex items-center justify-center gap-3">
            <span className="px-3 py-1 bg-secondary/10 text-secondary rounded text-xs font-bold border border-secondary/20">
              .json
            </span>
            <span className="px-3 py-1 bg-tertiary/10 text-tertiary rounded text-xs font-bold border border-tertiary/20">
              .vcf
            </span>
          </div>
          <p className="text-[10px] text-on-surface-variant mt-3 opacity-60">
            Max file size: 10 MB · Max variants: 5,000
          </p>
        </>
      )}
    </div>
  );
}
