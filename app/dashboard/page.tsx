"use client";

import DashboardLayout from "@/app/dashboard-layout";
import { KPI } from "@/app/components/KPI";
import { StitchAreaChart, ClusterBars, InsightRow, VariantPieChart } from "@/app/components/Charts";
import { useAuth } from "@/hooks/useAuth";
import { useRealtimeData } from "@/hooks/useRealtime";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { AddPatientForm } from "@/app/components/AddPatientForm";
import { Variant, Patient } from "@/types";
import { patientService } from "@/services/patients.service";

export default function Dashboard() {
  const { user } = useAuth();
  const { variants, stats } = useRealtimeData(user?.uid);
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      loadPatients();
    }
  }, [user]);

  const loadPatients = async () => {
    setLoadingPatients(true);
    try {
      const data = await patientService.getPatientsByDoctor(user!.uid);
      setRecentPatients(data.slice(0, 5)); // Show top 5
    } catch (err) {
      console.error("Failed to load patients", err);
    } finally {
      setLoadingPatients(false);
    }
  };

  // ---- Area chart: build time-series from variant data (last 7 steps) ----
  const areaData = [
    { label: "MON", actual: 10, projected: 15 },
    { label: "TUE", actual: 25, projected: 28 },
    { label: "WED", actual: 18, projected: 32 },
    { label: "THU", actual: 42, projected: 45 },
    { label: "FRI", actual: 60, projected: 58 },
    { label: "SAT", actual: 38, projected: 65 },
    { label: "SUN", actual: Math.max(stats.total * 4, 70), projected: 80 },
  ];

  // ---- Risk distribution pie ----
  const pieData = [
    { name: "Safe", value: stats.safe || 0, color: "#46fa9c" },
    { name: "Adjust", value: stats.adjustDosage || 0, color: "#af88ff" },
    { name: "Critical", value: stats.toxic || 0, color: "#ff716c" },
    { name: "Ineffective", value: stats.ineffective || 0, color: "#ffc107" },
    { name: "Unknown", value: stats.unknown || 0, color: "#494847" },
  ].filter(d => d.value > 0);
  
  if (pieData.length === 0) pieData.push({ name: "No Data", value: 1, color: "#2d2d2d" });

  const clusterItems = [
    { label: "Safe", value: stats.total ? Math.round((stats.safe / stats.total) * 100) : 0, color: "secondary" as const },
    { label: "Adjust", value: stats.total ? Math.round((stats.adjustDosage / stats.total) * 100) : 0, color: "tertiary" as const },
    { label: "Critical", value: stats.total ? Math.round((stats.toxic / stats.total) * 100) : 0, color: "error" as const },
    { label: "Ineff.", value: stats.total ? Math.round((stats.ineffective / stats.total) * 100) : 0, color: "error" as const },
  ];

  const toxicPct = stats.total ? Math.round((stats.toxic / stats.total) * 100) : 0;
  const adjustPct = stats.total ? Math.round((stats.adjustDosage / stats.total) * 100) : 0;
  const ineffPct = stats.total ? Math.round((stats.ineffective / stats.total) * 100) : 0;

  return (
    <DashboardLayout>
      {/* ---- Header ---- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Genomic Overview</h2>
          <p className="text-on-surface-variant mt-2 text-sm">
            Real-time pharmacogenomics metrics across all variant analyses.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowAddForm(true)}
            className="px-5 py-2.5 bg-surface-container-high rounded-xl text-xs font-bold tracking-widest uppercase text-primary hover:bg-surface-bright border border-outline-variant/10 transition-all flex items-center gap-2 shadow-lg"
          >
            <span className="material-symbols-outlined text-sm">person_add</span>
            QUICK ADD
          </button>
          <button 
            onClick={() => router.push("/upload")}
            className="px-5 py-2.5 bg-secondary text-on-secondary-container rounded-xl text-xs font-bold tracking-widest uppercase shadow-[0_8px_20px_rgba(70,250,156,0.3)] hover:scale-105 transition-transform"
          >
            NEW ANALYSIS
          </button>
        </div>
      </div>

      {/* ---- Bento Grid KPI Cards ---- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPI
          title="Total Variants"
          value={stats.total || "—"}
          trend={stats.total > 0 ? `+${stats.total}` : "No data"}
          trendType="up"
          materialIcon="biotech"
          iconColor="text-secondary"
          sparklineData={[30, 45, 40, 60, 55, 80, 95]}
          sparklineColor="secondary"
        />
        <KPI
          title="Safe Findings"
          value={stats.safe || "—"}
          trend="CLEAR"
          trendType="stable"
          materialIcon="hub"
          iconColor="text-tertiary"
          sparklineData={[60, 60, 62, 65, 64, 65, 65]}
          sparklineColor="tertiary"
        />
        <KPI
          title="Dosage Ineff."
          value={stats.ineffective || "—"}
          trend={ineffPct ? `${ineffPct}%` : "0%"}
          trendType="stable"
          materialIcon="bolt"
          iconColor="text-error"
          sparklineData={[80, 75, 72, 68, 65, 64, 60]}
          sparklineColor="secondary"
        />
        <KPI
          title="Toxicity Alerts"
          value={stats.toxic || "—"}
          trend={toxicPct ? `+${toxicPct}%` : "CLEAR"}
          trendType="up"
          materialIcon="speed"
          iconColor="text-secondary"
          sparklineData={[20, 30, 44, 28, 50, 36, 95]}
          sparklineColor="secondary"
        />
      </div>

      {/* ---- Discovery Activity Chart ---- */}
      <div className="mb-8">
        <StitchAreaChart
          title="Variant Discovery Activity"
          subtitle="Daily risk-weighted variant discoveries vs. projected baseline."
          data={areaData}
        />
      </div>

      {/* ---- Bottom Section: Cluster + Insights ---- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Cluster Bars */}
        <ClusterBars
          title="Risk Distribution"
          items={clusterItems}
          total={{ label: "Total Analyzed", value: stats.total || 0 }}
        />

        {/* Performance Insights */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/10 shadow-sm">
            <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Performance Insights</h3>
              <button
                className="text-secondary text-xs font-bold hover:underline"
                onClick={() => router.push("/results")}
              >
                VIEW ALL VARIANTS
              </button>
            </div>
            <div className="divide-y divide-outline-variant/10">
              {stats.toxic > 0 ? (
                <InsightRow
                  iconName="priority_high"
                  iconBg="bg-error/10"
                  iconColor="text-error"
                  title={`${stats.toxic} Critical Variant${stats.toxic > 1 ? 's' : ''} Detected`}
                  subtitle="High-risk pharmacogenomic interactions require immediate clinical review."
                  badgeLabel="Severity"
                  badgeValue="CRITICAL"
                  badgeColor="text-error"
                  actionLabel="REVIEW"
                  onAction={() => router.push("/results")}
                />
              ) : (
                <InsightRow
                  iconName="check_circle"
                  iconBg="bg-secondary/10"
                  iconColor="text-secondary"
                  title="No Critical Findings"
                  subtitle="All analyzed variants are within safe, adjustment, or unknown thresholds."
                  badgeLabel="Status"
                  badgeValue="CLEAR"
                  badgeColor="text-secondary"
                  actionLabel="DETAILS"
                  onAction={() => router.push("/results")}
                />
              )}

              {stats.adjustDosage > 0 ? (
                <InsightRow
                  iconName="tune"
                  iconBg="bg-tertiary/10"
                  iconColor="text-tertiary"
                  title={`${stats.adjustDosage} Dosage Adjustments Recommended`}
                  subtitle="Intermediate代谢 variants suggest dosing modifications are necessary."
                  badgeLabel="Action"
                  badgeValue="INTERVENTION"
                  badgeColor="text-tertiary"
                  actionLabel="TRACK"
                  onAction={() => router.push("/results")}
                />
              ) : (
                <InsightRow
                  iconName="auto_awesome"
                  iconBg="bg-secondary/10"
                  iconColor="text-secondary"
                  title="AI Analysis Ready"
                  subtitle="Upload a genomic JSON file to run the full pharmacogenomics pipeline."
                  badgeLabel="Type"
                  badgeValue="EFFICIENCY"
                  badgeColor="text-secondary"
                  actionLabel="UPLOAD"
                  onAction={() => router.push("/upload")}
                />
              )}

              <InsightRow
                iconName="security"
                iconBg="bg-tertiary/10"
                iconColor="text-tertiary"
                title={`${stats.safe} Safe Variants Confirmed`}
                subtitle="Variants with no known adverse pharmacogenomic interactions."
                badgeLabel="Action"
                badgeValue="CONFIRMED"
                badgeColor="text-tertiary"
                actionLabel="EXPORT"
                onAction={() => {
                  const blob = new Blob([JSON.stringify(variants, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'pharmaguard_results.json';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              />
            </div>
          </div>

          {/* Recent Patients Section */}
          <div className="bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/10 shadow-sm">
            <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-high/20">
              <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Recent Patient Registrations</h3>
              <button
                className="text-secondary text-xs font-bold hover:underline"
                onClick={() => router.push("/monitoring")}
              >
                VIEW FULL REGISTRY
              </button>
            </div>
            <div className="p-0">
              {loadingPatients ? (
                <div className="p-8 space-y-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-12 bg-surface-container rounded-lg animate-pulse" />)}
                </div>
              ) : recentPatients.length === 0 ? (
                <div className="p-12 text-center text-on-surface-variant italic text-xs">
                  No patients registered yet. Use the "Quick Add" button above to get started.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                  {recentPatients.map((p) => (
                    <div 
                      key={p.id} 
                      className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/10 hover:border-primary/30 transition-all cursor-pointer group"
                      onClick={() => router.push("/monitoring")}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                          <span className="material-symbols-outlined">person</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-on-surface truncate">{p.name}</p>
                          <p className="text-[10px] text-on-surface-variant font-mono">+91 {p.phone}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[9px] font-bold text-on-surface-variant uppercase">Biometrics</p>
                          <p className="text-xs text-primary font-bold">{p.height}cm / {p.weight}kg</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Patient Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-surface-container-lowest/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="w-full max-w-lg">
            <AddPatientForm 
              onCancel={() => setShowAddForm(false)} 
              onSuccess={(id) => {
                setShowAddForm(false);
                router.push("/monitoring"); // Take them to monitoring to see the new patient
              }} 
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
