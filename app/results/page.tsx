"use client";

import DashboardLayout from "@/app/dashboard-layout";
import { VariantTable } from "@/app/components/VariantTable";
import { useAuth } from "@/hooks/useAuth";
import { useRealtimeData } from "@/hooks/useRealtime";
import { buildReport } from "@/services/variants.service";

export default function ResultsPage() {
    const { user } = useAuth();
    const { variants } = useRealtimeData(user?.uid);

    const handleExport = () => {
        if (variants.length === 0) return;
        
        // Grab patient info from the first variant if available
        const first = variants[0];
        const report = buildReport(variants, first.patientId || "ANON", first.drug || "ALL");
        
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pharmaguard_report_${report.patientId}_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-primary">Analytics</h2>
                    <p className="text-on-surface-variant mt-2 text-sm">
                        Processed pharmacogenomics variants with AI-powered insights.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleExport}
                        disabled={variants.length === 0}
                        className="px-4 py-2 bg-surface-container-high rounded text-xs font-bold tracking-widest uppercase text-on-surface hover:bg-surface-bright transition-colors disabled:opacity-40 flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">download</span>
                        EXPORT REPORT
                    </button>
                    <button className="px-4 py-2 bg-secondary text-on-secondary-container rounded text-xs font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(70,250,156,0.2)] flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">podcasting</span>
                        LIVE FEED
                    </button>
                </div>
            </div>

            {/* Summary row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: "Total Data", value: variants.length, color: "text-primary", icon: "biotech" },
                    { label: "Critical", value: variants.filter(v => v.risk === 'Toxic').length, color: "text-error", icon: "priority_high" },
                    { label: "Adjust Dosage", value: variants.filter(v => v.risk === 'Adjust Dosage').length, color: "text-tertiary", icon: "tune" },
                    { label: "Safe", value: variants.filter(v => v.risk === 'Safe').length, color: "text-secondary", icon: "verified" },
                ].map(s => (
                    <div key={s.label} className="p-4 bg-surface-container-low rounded-lg flex items-center justify-between border border-outline-variant/10">
                        <div className="min-w-0">
                            <p className="text-[0.625rem] md:text-[0.6875rem] uppercase tracking-widest text-on-surface-variant font-bold truncate">{s.label}</p>
                            <p className={`text-xl md:text-2xl font-bold mt-1 ${s.color}`}>{s.value.toLocaleString()}</p>
                        </div>
                        <span className={`material-symbols-outlined ${s.color} opacity-40 hidden sm:block`} style={{ fontSize: '24px' }}>{s.icon}</span>
                    </div>
                ))}
            </div>

            {/* Variant Table */}
            <div className="bg-surface-container-lowest rounded-lg overflow-hidden border border-outline-variant/10">
                <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Performance Insights</h3>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                        {variants.length} Records
                    </span>
                </div>
                <VariantTable variants={variants} />
            </div>
        </DashboardLayout>
    );
}
