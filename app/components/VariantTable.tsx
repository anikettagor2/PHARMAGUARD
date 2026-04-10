"use client";

import React, { useState } from "react";
import { Variant } from "@/types";
import { explainVariant } from "@/lib/llm";
import { GENE_DRUG_DATA } from "@/lib/drugData";

const riskIconMap: Record<string, string> = {
  Toxic: "priority_high",
  "Adjust Dosage": "tune",
  Ineffective: "block",
  Monitor: "monitor_heart",
  Safe: "verified",
  Unknown: "help",
};

const riskColorMap: Record<string, { bg: string; icon: string; badge: string; badgeText: string }> = {
  Toxic: {
    bg: "bg-error/10",
    icon: "text-error",
    badge: "bg-error/10 text-error",
    badgeText: "CRITICAL",
  },
  "Adjust Dosage": {
    bg: "bg-tertiary/10",
    icon: "text-tertiary",
    badge: "bg-tertiary/10 text-tertiary",
    badgeText: "ADJUST",
  },
  Ineffective: {
    bg: "bg-error/10",
    icon: "text-error",
    badge: "bg-error/10 text-error",
    badgeText: "INEFFECTIVE",
  },
  Monitor: {
    bg: "bg-tertiary/10",
    icon: "text-tertiary",
    badge: "bg-tertiary/10 text-tertiary",
    badgeText: "MONITOR",
  },
  Safe: {
    bg: "bg-secondary/10",
    icon: "text-secondary",
    badge: "bg-secondary/10 text-secondary",
    badgeText: "CLEAR",
  },
  Unknown: {
    bg: "bg-surface-container-high",
    icon: "text-on-surface-variant",
    badge: "bg-surface-container-high text-on-surface-variant",
    badgeText: "UNKNOWN",
  },
};

export function VariantTable({ 
  variants, 
  onSelectVariant, 
  selectedVariantId 
}: { 
  variants: Variant[]; 
  onSelectVariant?: (v: Variant) => void;
  selectedVariantId?: string;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<Record<string, string>>({});
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  const handleRowClick = (v: Variant) => {
    if (onSelectVariant) {
      onSelectVariant(v);
    }
  };

  const handleExpand = async (e: React.MouseEvent, v: Variant) => {
    e.stopPropagation(); // Don't trigger row selection if they just want to expand
    if (expanded === v.id) {
      setExpanded(null);
      return;
    }
    setExpanded(v.id!);
    if (!explanation[v.id!]) {
      setLoadingIds(prev => new Set(prev).add(v.id!));
      try {
        const exp = await explainVariant(v);
        setExplanation(prev => ({ ...prev, [v.id!]: exp }));
      } catch (err) {
        console.error("AI Explanation failed", err);
      } finally {
        setLoadingIds(prev => {
          const next = new Set(prev);
          next.delete(v.id!);
          return next;
        });
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (variants.length === 0) {
    return (
      <div className="p-12 text-center">
        <span className="material-symbols-outlined text-on-surface-variant opacity-40 mb-3" style={{ fontSize: '48px' }}>biotech</span>
        <p className="text-on-surface-variant text-sm mt-2">No variants found. Upload genomic data to begin analysis.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-outline-variant/10">
      {variants.map((v) => {
        const colors = riskColorMap[v.risk] ?? riskColorMap["Safe"];
        const isExpanded = expanded === v.id;
        const isSelected = selectedVariantId === v.id;

        return (
          <React.Fragment key={v.id}>
            <div
              className={`p-6 flex items-center justify-between group transition-all cursor-pointer border-l-4 ${
                isSelected ? 'bg-primary/5 border-primary shadow-inner' : 'hover:bg-surface-container-high border-transparent'
              }`}
              onClick={() => handleRowClick(v)}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center ${colors.icon} shrink-0`}>
                  <span className="material-symbols-outlined">{riskIconMap[v.risk] ?? "help"}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-primary truncate">{v.gene} — <span className="font-mono font-normal">{v.mutation}</span></p>
                  <p className="text-xs text-on-surface-variant truncate">{v.significance.replace(/_/g, ' ')}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right hidden md:block">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Severity</p>
                  <p className={`text-xs font-bold ${colors.icon}`}>{colors.badgeText}</p>
                </div>
                <button 
                  onClick={(e) => handleExpand(e, v)}
                  className={`px-4 py-2 border border-outline-variant rounded text-xs font-bold transition-all ${
                    isExpanded ? 'bg-primary text-surface-container-lowest' : 'text-primary hover:bg-primary/5'
                  }`}
                >
                  {isExpanded ? "COLLAPSE" : "EXPAND"}
                </button>
              </div>
            </div>

            {isExpanded && (
              <div className="bg-surface px-4 sm:px-8 py-6 border-l-2 border-secondary">
                <div className="grid lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2">Clinical Recommendation</h4>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{v.recommendation}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-tertiary uppercase tracking-widest mb-2">AI Explanation</h4>
                    {loadingIds.has(v.id!) ? (
                      <div className="space-y-2 animate-pulse">
                        <div className="h-3 bg-surface-container-high rounded w-3/4" />
                        <div className="h-3 bg-surface-container-high rounded w-1/2" />
                        <div className="h-3 bg-surface-container-high rounded w-5/6" />
                      </div>
                    ) : (
                      <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap">{explanation[v.id!] || "Loading AI insight..."}</p>
                    )}
                  </div>

                  {/* Drug Suggestions Section */}
                  {GENE_DRUG_DATA[v.gene] && (
                    <div className="lg:col-span-2 pt-6 mt-2 border-t border-outline-variant/10">
                      <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">pills</span>
                        Therapeutic Suggestions & Related Drugs
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        {GENE_DRUG_DATA[v.gene].drugs.map((drug, idx) => (
                          <div key={idx} className="bg-surface-container-low rounded-lg p-4 border border-outline-variant/30 hover:border-primary/30 transition-all group">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-xs font-bold text-primary">{drug.name}</span>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                                drug.risk === "High" ? "bg-error/10 text-error" : "bg-tertiary/10 text-tertiary"
                              }`}>
                                {drug.risk.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-[11px] text-on-surface-variant leading-tight mb-2 italic">"{drug.explanation}"</p>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 text-[10px] text-primary/80 font-medium">
                                <span className="material-symbols-outlined text-[14px]">medical_services</span>
                                <span>{drug.recommendation}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-secondary/80 font-medium">
                                <span className="material-symbols-outlined text-[14px]">schedule</span>
                                <span>{drug.typicalDuration || "Duration: Per Physician"}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-[9px] text-on-surface-variant/60 mt-4 flex items-center gap-1 italic">
                        <span className="material-symbols-outlined text-[12px]">info</span>
                        Related metabolic pathway genes: {GENE_DRUG_DATA[v.gene].related_genes.join(", ")}
                      </p>
                    </div>
                  )}

                  {v.score !== undefined && (
                    <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-outline-variant/10">
                      <div>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Risk Score</p>
                        <p className="text-lg font-bold text-primary">{v.score.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">CPIC Gene</p>
                        <p className="text-lg font-bold text-primary">{v.cpicGene ? "YES" : "NO"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Chromosome</p>
                        <p className="text-lg font-bold text-primary font-mono">{v.chromosome || "—"} <span className="text-xs text-on-surface-variant opacity-60">:{v.pos}</span></p>
                      </div>
                      <div className="flex items-end justify-end">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(JSON.stringify(v, null, 2));
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 rounded bg-surface hover:bg-surface-container border border-outline-variant text-[10px] font-bold text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">content_copy</span>
                          COPY RAW
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
