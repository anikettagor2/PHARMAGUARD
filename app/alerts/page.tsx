"use client";

import DashboardLayout from "@/app/dashboard-layout";
import { useAuth } from "@/hooks/useAuth";
import { useRealtimeData } from "@/hooks/useRealtime";
import { useRouter } from "next/navigation";
import { markAlertAsRead } from "@/services/variants.service";

export default function AlertsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { alerts, variants } = useRealtimeData(user?.uid);

    // Critical = Toxic or Ineffective (Limited to top 3 and auto-vanish is handled via component state if needed, but here we cap it)
    const criticalVariants = variants
        .filter(v => v.risk === 'Toxic' || v.risk === 'Ineffective')
        .slice(0, 3);
    
    // Interventions = Adjust Dosage
    const interventionVariants = variants
        .filter(v => v.risk === 'Adjust Dosage')
        .slice(0, 3);

    const handleDismiss = async (alertId: string) => {
        try {
            await markAlertAsRead(alertId);
        } catch (error) {
            console.error("Dismissal failed:", error);
        }
    };

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-primary">Priority Alerts</h2>
                    <p className="text-on-surface-variant mt-2 text-sm">
                        Real-time clinical interventions and genomic risk monitoring.
                    </p>
                </div>
                <div className="flex gap-2">
                    <span className={`px-4 py-2 rounded text-xs font-bold tracking-widest uppercase ${
                        criticalVariants.length > 0 
                            ? 'bg-error/10 text-error border border-error/20' 
                            : 'bg-secondary/10 text-secondary border border-secondary/20'
                    }`}>
                        {criticalVariants.length > 0 ? `${criticalVariants.length} CRITICAL` : 'ALL CLEAR'}
                    </span>
                    {interventionVariants.length > 0 && (
                        <span className="px-4 py-2 rounded text-xs font-bold tracking-widest uppercase bg-tertiary/10 text-tertiary border border-tertiary/20">
                            {interventionVariants.length} INTERVENTIONS
                        </span>
                    )}
                </div>
            </div>

            {/* Critical Findings */}
            <div className="bg-surface-container-lowest rounded-lg overflow-hidden border border-outline-variant/10 mb-8 border-l-4 border-l-error">
                <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-error/[0.02]">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-error">Critical Findings</h3>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Immediate Review Required</p>
                </div>

                {criticalVariants.length === 0 ? (
                    <div className="p-12 text-center">
                        <span className="material-symbols-outlined text-secondary opacity-60 mb-3" style={{ fontSize: '48px' }}>
                            verified_user
                        </span>
                        <p className="text-primary font-bold mt-3">No Critical Risks Found</p>
                        <p className="text-on-surface-variant text-sm mt-1">All processed variants are below the toxicity threshold.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-outline-variant/10">
                        {criticalVariants.map((v, index) => (
                            <div key={v.id || `critical-${index}`} className="p-6 flex items-center justify-between group hover:bg-error/[0.02] transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center text-error shrink-0">
                                        <span className="material-symbols-outlined">priority_high</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-primary">{v.gene} — {v.risk === 'Toxic' ? 'Toxicity Warning' : 'Likely Ineffective'}</p>
                                        <p className="text-xs text-on-surface-variant max-w-xl line-clamp-1">{v.recommendation}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Severity</p>
                                        <p className="text-xs text-error font-bold uppercase">{v.risk}</p>
                                    </div>
                                    <button 
                                        onClick={() => router.push("/results")}
                                        className="px-4 py-2 border border-outline-variant rounded text-xs font-bold text-primary hover:bg-primary hover:text-surface-container-lowest transition-all"
                                    >
                                        DETAILS
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Dosage Adjustments / Interventions */}
            <div className="bg-surface-container-low rounded-lg overflow-hidden border border-outline-variant/10 mb-8">
                <div className="p-6 border-b border-outline-variant/10">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Intervention Queue</h3>
                </div>

                {interventionVariants.length === 0 ? (
                    <div className="p-12 text-center">
                        <span className="material-symbols-outlined text-on-surface-variant opacity-40 mb-3" style={{ fontSize: '48px' }}>
                            tune
                        </span>
                        <p className="text-on-surface-variant text-sm mt-2">No pending dosage modifications.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-outline-variant/10">
                        {interventionVariants.map((v, index) => (
                            <div key={v.id || `intervention-${index}`} className="p-6 flex items-center justify-between group hover:bg-tertiary/[0.02] transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center text-tertiary shrink-0">
                                        <span className="material-symbols-outlined">tune</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-primary">{v.gene} — Dosing Recommendation</p>
                                        <p className="text-xs text-on-surface-variant max-w-xl line-clamp-1">{v.recommendation}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Action</p>
                                        <p className="text-xs text-tertiary font-bold uppercase">ADJUST DOSAGE</p>
                                    </div>
                                    <button 
                                        onClick={() => router.push("/results")}
                                        className="px-4 py-2 border border-outline-variant rounded text-xs font-bold text-primary hover:bg-primary hover:text-surface-container-lowest transition-all"
                                    >
                                        VIEW
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* System Alerts */}
            {alerts.length > 0 && (
                <div className="bg-surface-container-low rounded-lg overflow-hidden border border-outline-variant/10">
                    <div className="p-6 border-b border-outline-variant/10">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-primary">System Notification History</h3>
                    </div>
                    <div className="divide-y divide-outline-variant/10">
                        {alerts.map((alert, index) => (
                            <div key={alert.id || `alert-${index}`} className={`p-6 flex items-center justify-between group transition-colors ${alert.read ? 'bg-surface-container-high/30 opacity-60' : 'hover:bg-surface-container-high'}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${alert.read ? 'bg-surface-variant text-on-surface-variant' : 'bg-primary/10 text-primary'}`}>
                                        <span className="material-symbols-outlined">{alert.read ? 'notifications_paused' : 'notifications'}</span>
                                    </div>
                                    <div>
                                        <p className={`text-sm font-bold ${alert.read ? 'text-on-surface-variant' : 'text-primary'}`}>{alert.message}</p>
                                        <p className="text-[10px] text-on-surface-variant font-medium mt-1">
                                            {new Date(alert.createdAt).toLocaleString()} • {alert.patientId || 'Genomic Analytics'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Status</p>
                                        <p className={`text-xs font-bold ${alert.read ? 'text-on-surface-variant' : 'text-error'}`}>
                                            {alert.read ? 'ARCHIVED' : 'NEW'}
                                        </p>
                                    </div>
                                    {!alert.read && (
                                        <button 
                                            onClick={() => alert.id && handleDismiss(alert.id)}
                                            className="px-4 py-2 text-on-surface-variant border border-outline-variant rounded text-[10px] font-black uppercase tracking-widest hover:text-primary hover:border-primary transition-all"
                                        >
                                            DISMISS
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
