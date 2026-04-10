"use client";

import DashboardLayout from "@/app/dashboard-layout";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Patient, Variant } from "@/types";
import { AddPatientForm } from "@/app/components/AddPatientForm";
import { PatientSearch } from "@/app/components/PatientSearch";
import { PatientList } from "@/app/components/PatientList";
import { UploadDropzone } from "@/app/components/UploadDropzone";
import { VariantTable } from "@/app/components/VariantTable";
import { ExplainableAIModule } from "@/app/components/ExplainableAIModule";
import { StructuredReportView } from "@/app/components/StructuredReportView";
import { processAndSaveVariants, getVariantsByPatient } from "@/services/variants.service";
import { patientService } from "@/services/patients.service";
import { generateClinicalPDF } from "@/utils/reportGenerator";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function MonitoringPage() {
  const { user } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadState, setUploadState] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [isAddingPatient, setIsAddingPatient] = useState(false);

  // New Clinical Data provided by User for Prescription Guidance
  const PRESCRIPTION_DATA = [
    {
      "gene": "DPYD",
      "risk": "High",
      "primary_drug": "Fluorouracil",
      "recommendation": "Avoid",
      "reason": "DPYD mutation reduces drug metabolism leading to severe toxicity",
      "alternative_drug": "Raltitrexed",
      "confidence": "High"
    },
    {
      "gene": "CYP2C19",
      "risk": "High",
      "primary_drug": "Clopidogrel",
      "recommendation": "Avoid",
      "reason": "Loss-of-function variants reduce drug activation",
      "alternative_drug": "Prasugrel or Ticagrelor",
      "confidence": "High"
    },
    {
      "gene": "CYP2C9",
      "risk": "Medium",
      "primary_drug": "Warfarin",
      "recommendation": "Reduce dosage",
      "reason": "Variants affect drug metabolism increasing bleeding risk",
      "alternative_drug": "Use lower dose or monitor INR closely",
      "confidence": "High"
    },
    {
      "gene": "CYP2D6",
      "risk": "High",
      "primary_drug": "Codeine",
      "recommendation": "Avoid",
      "reason": "Poor or ultra-rapid metabolism leads to ineffective or toxic response",
      "alternative_drug": "Morphine or non-opioid analgesics",
      "confidence": "Medium"
    },
    {
      "gene": "SLCO1B1",
      "risk": "Medium",
      "primary_drug": "Simvastatin",
      "recommendation": "Reduce dosage",
      "reason": "Variants increase risk of statin-induced myopathy",
      "alternative_drug": "Use Pravastatin or Rosuvastatin",
      "confidence": "High"
    },
    {
      "gene": "TPMT",
      "risk": "High",
      "primary_drug": "Azathioprine",
      "recommendation": "Avoid or reduce dose",
      "reason": "Low enzyme activity leads to drug toxicity",
      "alternative_drug": "Use reduced dose or alternative immunosuppressant",
      "confidence": "High"
    }
  ];

  // Load patient data when selected
  useEffect(() => {
    if (selectedPatient?.id) {
      loadPatientData(selectedPatient.id);
      setSelectedVariant(null); // Reset selection when switching patients
    }
  }, [selectedPatient]);

  const loadPatientData = async (id: string) => {
    setLoading(true);
    try {
      const data = await getVariantsByPatient(id);
      setVariants(data);
    } catch (err) {
      console.error("Failed to load patient data", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientAdded = async (id: string) => {
    setShowAddForm(false);
    try {
      const newPatient = await patientService.getPatientById(id);
      if (newPatient) {
        setSelectedPatient(newPatient);
        setRefreshKey(prev => prev + 1);
      }
    } catch (err) {
      console.error("Failed to select new patient", err);
    }
  };

  const handleUploadComplete = async (url: string, jsonData: any[]) => {
    if (!selectedPatient?.id || !user) return;
    setUploadState("processing");
    try {
      await processAndSaveVariants(user.uid, jsonData, "", selectedPatient.id);
      setUploadState("success");
      await loadPatientData(selectedPatient.id);
    } catch (err: any) {
      setErrorMessage(err.message || "Analysis failed");
      setUploadState("error");
    }
  };

  const [refreshKey, setRefreshKey] = useState(0);

  const shareOnWhatsApp = async () => {
    if (!selectedPatient || variants.length === 0) return;
    
    // 1. Generate PDF
    const pdfBlob = generateClinicalPDF(
        selectedPatient, 
        variants, 
        user?.displayName || "Medical Professional", 
        { asBlob: true }
    ) as Blob;

    // 2. Upload to Firebase Storage
    setLoading(true);
    let reportLink = "";
    try {
        const reportRef = ref(storage, `reports/${selectedPatient.id}/${Date.now()}.pdf`);
        await uploadBytes(reportRef, pdfBlob);
        reportLink = await getDownloadURL(reportRef);
    } catch (err) {
        console.error("PDF upload failed", err);
    } finally {
        setLoading(false);
    }

    // 3. Construct Patient-Friendly Message (Simplified for Cure & Reason)
    const activeMeds = variants
      .filter(v => v.risk === "Safe" || v.risk === "Adjust Dosage")
      .map(v => v.drug || "Prescribed Medication")
      .filter((v, i, a) => a.indexOf(v) === i); // Unique drugs

    const cureGuidance = variants
      .map(v => {
        const impact = v.effectOnBody?.patientSummary || v.recommendation || "Maintain standard care.";
        return `• *For ${v.drug || 'General Health'}:* ${v.recommendation} (Reason: ${impact})`;
      })
      .slice(0, 3) // Keep it short
      .join("\n\n");

    const text = `*🧬 PharmaGuard: Your Personalized Medicine Guide*\n\n` +
      `Hello *${selectedPatient.name}*,\n\n` +
      `Based on the analysis of your unique DNA test results, here is the medicine guide curated for you:\n\n` +
      `${cureGuidance || "Your profile indicates standard medication is safe for use."}\n\n` +
      `*Summary:* These adjustments help your body process medicine more effectively, ensuring the best cure with minimal side effects.\n\n` +
      `*📎 View Details:* ${reportLink || "Provided by your clinic."}\n\n` +
      `_Please consult your doctor before making changes._`;

    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/91${selectedPatient.phone}?text=${encodedText}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <DashboardLayout>
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Patient Monitoring</h2>
          <p className="text-on-surface-variant mt-2 text-sm leading-relaxed max-w-xl">
            Register and manage patients, upload clinical genomic data, and monitor pharmacogenomic risks in real-time.
          </p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-primary text-on-primary px-6 py-2.5 rounded-lg text-sm font-bold tracking-widest hover:scale-105 transition-all flex items-center gap-2 shadow-xl shadow-primary/20"
        >
          <span className="material-symbols-outlined text-base">person_add</span>
          NEW PATIENT
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column: Search & Selection */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10 shadow-sm">
            <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-4">Search Registry</h3>
            <PatientSearch 
              key={refreshKey}
              selectedId={selectedPatient?.id} 
              onSelect={(p) => setSelectedPatient(p)} 
            />
          </div>

          <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-[0.2em]">Patient Registry</h3>
              <div className="flex gap-2">
                <span className="text-[9px] font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded">NEWEST FIRST</span>
              </div>
            </div>
            <PatientList 
              key={`list-${refreshKey}`}
              selectedId={selectedPatient?.id} 
              onSelect={(p) => setSelectedPatient(p)} 
            />
          </div>

          {selectedPatient && (
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-lg overflow-hidden animate-in fade-in slide-in-from-left-4 duration-500">
              {/* Premium Header */}
              <div className="bg-primary/5 p-6 border-b border-outline-variant/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />
                <div className="flex justify-between items-start relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-primary text-on-primary flex items-center justify-center shadow-lg shadow-primary/30">
                    <span className="material-symbols-outlined text-3xl font-variation-fill">clinical_notes</span>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-[8px] font-black uppercase tracking-widest border border-secondary/20">
                      IDENTIFIED
                    </span>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">PG-ID: {selectedPatient.id?.slice(-6).toUpperCase()}</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="text-2xl font-black text-primary tracking-tight leading-none">{selectedPatient.name}</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                    <p className="text-xs font-mono text-on-surface-variant">+91 {selectedPatient.phone}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Biometric Vitality Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/5">
                    <p className="text-[9px] font-black text-on-surface-variant uppercase mb-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[10px]">height</span> Height
                    </p>
                    <p className="text-xl font-black text-primary">{selectedPatient.height}<span className="text-xs font-normal opacity-40 ml-1">cm</span></p>
                  </div>
                  <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/5">
                    <p className="text-[9px] font-black text-on-surface-variant uppercase mb-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[10px]">weight</span> Weight
                    </p>
                    <p className="text-xl font-black text-primary">{selectedPatient.weight}<span className="text-xs font-normal opacity-40 ml-1">kg</span></p>
                  </div>
                </div>

                {/* BMI Calculation (Derived) */}
                <div className="p-4 bg-secondary/5 rounded-xl border border-secondary/10 flex justify-between items-center">
                  <div>
                    <p className="text-[9px] font-bold text-secondary uppercase tracking-widest">Calculated BMI Index</p>
                    <p className="text-sm font-bold text-on-surface">
                      {(Number(selectedPatient.weight) / Math.pow(Number(selectedPatient.height)/100, 2)).toFixed(1)} <span className="text-[10px] font-normal opacity-60">kg/m²</span>
                    </p>
                  </div>
                  <div className="px-3 py-1 bg-secondary/10 rounded-lg text-[10px] font-black text-secondary border border-secondary/20 uppercase tracking-widest">
                    NORMAL
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-4">Patient Control Suite</p>
                  
                  <button 
                    onClick={shareOnWhatsApp}
                    className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-4 rounded-2xl text-[10px] font-black tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-green-500/10 active:scale-95"
                  >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className="w-5 h-5 invert brightness-200" alt="WhatsApp" />
                    SEND MEDICINE GUIDE
                  </button>
                  
                  <button 
                    onClick={() => generateClinicalPDF(selectedPatient, variants, user?.displayName || "Medical Professional", { download: true })}
                    className="w-full bg-primary/10 hover:bg-primary/20 text-primary py-4 rounded-2xl text-[10px] font-black tracking-[0.2em] border border-primary/20 transition-all flex items-center justify-center gap-3 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
                    SECURE REPORT EXPORT
                  </button>
                </div>

                <div className="pt-4 border-t border-outline-variant/10">
                   <div className="flex items-center gap-2 text-[8px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">
                      <span className="material-symbols-outlined text-[10px]">history</span>
                      Registry Entry: {new Date(selectedPatient.createdAt).toLocaleDateString()}
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Ingestion & Analysis */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {!selectedPatient ? (
            <div className="h-full min-h-[400px] border-2 border-dashed border-outline-variant/20 rounded-3xl flex flex-col items-center justify-center text-center p-12 bg-surface-container-lowest/50">
              <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant opacity-40 mb-4">
                <span className="material-symbols-outlined text-4xl">person_search</span>
              </div>
              <p className="text-on-surface-variant font-medium">Select a patient from the left to begin analysis or view history.</p>
            </div>
          ) : (
            <>
              {/* Dynamic Analysis Section: Upload vs Dashboard */}
              {variants.length === 0 ? (
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden shadow-sm">
                  <div className="p-5 border-b border-outline-variant/10 bg-surface-container-low">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                         <span className="material-symbols-outlined text-lg">science</span>
                         Genomic Data Ingestion
                      </h3>
                      <span className="text-[10px] font-mono text-on-surface-variant px-2 py-0.5 border border-outline-variant/20 rounded">WAITING_FOR_DATA</span>
                    </div>
                  </div>
                  <div className="p-8">
                    <UploadDropzone
                      onUploadComplete={handleUploadComplete}
                      onError={(msg) => { setErrorMessage(msg); setUploadState("error"); }}
                      onWarning={(msg) => console.warn(msg)}
                    />
                    
                    {uploadState === "processing" && (
                       <div className="mt-6 p-4 bg-primary/5 border border-primary/10 rounded-xl flex items-center gap-4">
                          <span className="material-symbols-outlined text-primary animate-spin">sync</span>
                          <div>
                            <p className="text-sm font-bold text-primary uppercase tracking-widest">Analyzing Genomic Sequence...</p>
                            <p className="text-xs text-on-surface-variant">Mapping variants → Predicting Drug Metabolizer Phenotype → CPIC Rules</p>
                          </div>
                       </div>
                    )}

                    {uploadState === "error" && (
                      <div className="mt-6 p-4 bg-error/10 border border-error/20 rounded-xl flex items-start gap-4 animate-in shake-in">
                        <span className="material-symbols-outlined text-error">error</span>
                        <div>
                          <p className="text-sm font-bold text-error uppercase">Analysis Failed</p>
                          <p className="text-xs text-on-surface-variant">{errorMessage}</p>
                          <button onClick={() => setUploadState("idle")} className="mt-2 text-[10px] font-bold text-primary hover:underline">TRY AGAIN</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
                  {/* Physiological Impact Gallery */}
                  <div className="md:col-span-3 bg-surface-container-lowest border border-outline-variant/10 rounded-3xl overflow-hidden shadow-sm flex flex-col">
                    <div className="p-5 border-b border-outline-variant/10 bg-error/5 flex justify-between items-center">
                       <h4 className="text-[10px] font-black text-error uppercase tracking-[0.2em] flex items-center gap-2">
                         <span className="material-symbols-outlined text-sm font-variation-fill">vital_signs</span>
                         Physiological Impact Gallery
                       </h4>
                       <span className="text-[9px] font-bold text-on-surface-variant italic opacity-60">TOP SEVERITY RISKS</span>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                       {variants
                         .filter(v => v.risk === "Toxic" || v.risk === "Adjust Dosage" || v.risk === "Ineffective")
                         .sort((a, b) => b.score - a.score)
                         .slice(0, 3)
                         .map((v, i) => (
                         <div key={i} className="group p-4 bg-surface-container-low rounded-2xl border border-outline-variant/5 hover:border-error/20 transition-all duration-300">
                            <div className="flex justify-between items-start mb-3">
                               <div className="px-2 py-0.5 rounded-lg bg-error/10 text-error text-[8px] font-black border border-error/20">
                                 {v.risk.toUpperCase()}
                               </div>
                               <span className="material-symbols-outlined text-on-surface-variant/20 text-sm group-hover:text-error/40 transition-colors">medical_information</span>
                            </div>
                            <h5 className="text-sm font-black text-primary mb-1">{v.drug || v.gene}</h5>
                            <p className="text-[10px] text-error font-bold leading-tight mb-3">
                              {v.effectOnBody?.severity || "Inhibited Metabolism"}
                            </p>
                            <p className="text-[10px] text-on-surface-variant leading-relaxed line-clamp-3">
                              {v.effectOnBody?.patientSummary || v.recommendation}
                            </p>
                         </div>
                       ))}
                       {variants.length < 3 && Array(3 - variants.length).fill(0).map((_, i) => (
                         <div key={`empty-${i}`} className="p-4 border-2 border-dashed border-outline-variant/10 rounded-2xl flex items-center justify-center grayscale opacity-20">
                            <span className="material-symbols-outlined text-2xl">monitoring</span>
                         </div>
                       ))}
                    </div>
                  </div>

                  {/* Metabolic Hub Card */}
                  <div className="bg-primary/5 border border-primary/10 rounded-3xl p-6 flex flex-col justify-center text-center shadow-lg shadow-primary/5">
                    <div className="relative w-24 h-24 mx-auto mb-4">
                      <div className="absolute inset-0 border-4 border-primary/10 rounded-full" />
                      <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-[spin_3s_linear_infinite]" />
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <p className="text-2xl font-black text-primary leading-none">64%</p>
                        <p className="text-[8px] font-black text-primary/60 uppercase">Load</p>
                      </div>
                    </div>
                    <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">Clearance Rate</h4>
                    <p className="text-[9px] text-on-surface-variant px-2 leading-relaxed opacity-60">Aggregated Liver Enzyme Efficiency based on PGx Profile.</p>
                  </div>
                </div>
              )}

              {/* Analysis History & Explainable AI */}
              <div className="grid lg:grid-cols-2 gap-6 h-full">
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm flex flex-col overflow-hidden">
                  <div className="p-5 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/50">
                     <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                       <span className="material-symbols-outlined text-lg">database</span>
                       Analysis History & Findings
                     </h3>
                     <span className="text-[10px] text-on-surface-variant font-bold bg-surface-container-high px-2 py-0.5 rounded">{variants.length} VARIANTS</span>
                  </div>
                  <div className="flex-1 overflow-auto max-h-[600px]">
                    {loading ? (
                      <div className="p-8 space-y-4">
                        {[1,2,3,4].map(i => <div key={i} className="h-12 bg-surface-container rounded-lg animate-pulse" />)}
                      </div>
                    ) : variants.length === 0 ? (
                      <div className="p-12 text-center text-on-surface-variant italic text-xs">
                        No genomic variants found for this patient yet.
                      </div>
                    ) : (
                      <VariantTable 
                        variants={variants} 
                        onSelectVariant={(v) => setSelectedVariant(v)}
                        selectedVariantId={selectedVariant?.id}
                      />
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                    {selectedVariant ? (
                      <ExplainableAIModule variant={selectedVariant} />
                    ) : (
                      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden shadow-sm flex flex-col min-h-[500px] animate-in fade-in slide-in-from-right-4">
                         <div className="p-4 border-b border-outline-variant/10 bg-primary/5 flex justify-between items-center">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                              <span className="material-symbols-outlined text-sm">medication_liquid</span>
                              Prescription Guidance Strategy
                            </h3>
                            <span className="text-[8px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">AGGREGATED INSIGHTS</span>
                         </div>
                         <div className="p-6 overflow-auto max-h-[600px] bg-[radial-gradient(circle_at_top_right,var(--primary-opacity-5),transparent_50%)]">
                           <div className="space-y-6">
                             {PRESCRIPTION_DATA.map((item, idx) => {
                               const isHigh = item.risk === "High";
                               const riskColor = isHigh ? "text-error" : "text-secondary";
                               const riskBg = isHigh ? "bg-error/10" : "bg-secondary/10";
                               
                               return (
                                 <div key={idx} className="p-5 bg-surface-container-low rounded-xl border border-outline-variant/5 shadow-sm hover:border-primary/20 transition-all flex flex-col gap-3 group relative overflow-hidden">
                                     {/* Background Gene Stamp */}
                                     <div className="absolute -right-2 -bottom-2 opacity-[0.03] pointer-events-none">
                                        <span className="text-4xl font-black italic">{item.gene}</span>
                                     </div>

                                     <div className="flex items-start justify-between">
                                        <div className="space-y-0.5">
                                           <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">Primary Drug</p>
                                           <h5 className="text-sm font-black text-primary leading-tight">{item.primary_drug}</h5>
                                        </div>
                                        <div className={`px-2 py-0.5 rounded-full ${riskBg} ${riskColor} text-[8px] font-black uppercase flex items-center gap-1`}>
                                           <span className="h-1 w-1 rounded-full bg-current animate-pulse"></span>
                                           {item.risk} RISK
                                        </div>
                                     </div>

                                     <div className="flex flex-wrap gap-2">
                                        <div className="px-2 py-1 bg-surface-container-highest rounded-md border border-outline-variant/5">
                                           <span className="text-[8px] font-bold text-on-surface-variant uppercase tracking-tighter block leading-none mb-0.5">Gene Target</span>
                                           <span className="text-[10px] font-mono font-black text-primary">{item.gene}</span>
                                        </div>
                                        <div className="px-2 py-1 bg-surface-container-highest rounded-md border border-outline-variant/5">
                                           <span className="text-[8px] font-bold text-on-surface-variant uppercase tracking-tighter block leading-none mb-0.5">Rec. Action</span>
                                           <span className="text-[10px] font-bold text-primary">{item.recommendation}</span>
                                        </div>
                                        <div className="px-2 py-1 bg-primary/10 rounded-md border border-primary/10">
                                           <span className="text-[8px] font-bold text-primary uppercase tracking-tighter block leading-none mb-0.5">Confidence</span>
                                           <span className="text-[10px] font-black text-primary">{item.confidence}</span>
                                        </div>
                                     </div>

                                     <div className="space-y-1 bg-surface-container-lowest/50 p-3 rounded-lg border border-outline-variant/5">
                                        <p className="text-[10px] font-medium text-on-surface-variant leading-relaxed">
                                          <span className="font-bold text-primary">Reason:</span> {item.reason}
                                        </p>
                                        <div className="pt-2 mt-2 border-t border-outline-variant/10 flex items-center gap-2">
                                           <span className="material-symbols-outlined text-xs text-secondary">clinical_notes</span>
                                           <p className="text-[10px] font-bold text-secondary">
                                              Alternative: <span className="text-on-surface font-black uppercase">{item.alternative_drug}</span>
                                           </p>
                                        </div>
                                     </div>
                                 </div>
                               );
                             })}
                           </div>
                           
                           <div className="mt-8 pt-4 border-t border-outline-variant/10 text-center">
                              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full border border-primary/10">
                                <span className="material-symbols-outlined text-xs text-primary animate-pulse">info</span>
                                <p className="text-[9px] text-on-surface-variant font-medium">
                                  Click <span className="font-bold text-primary">Expand</span> on history items for deeper biological mechanism analysis.
                                </p>
                              </div>
                           </div>
                         </div>
                      </div>
                    )}
                   
                   {/* 6. Structured Output Generation */}
                   <StructuredReportView 
                     patient={selectedPatient} 
                     variants={variants} 
                   />
                   
                   {/* Drug Insights Card (Mini) */}
                   {selectedVariant && (
                     <div className="p-5 bg-tertiary/5 border border-tertiary/10 rounded-2xl">
                       <h4 className="text-[10px] font-bold text-tertiary uppercase tracking-widest mb-3 flex items-center gap-2">
                         <span className="material-symbols-outlined text-sm">lightbulb</span>
                         Clinical Intelligence Tip
                       </h4>
                       <p className="text-xs text-on-surface-variant leading-relaxed">
                         The {selectedVariant.gene} mutation observed here indicates a specific metabolic pathway disruption. 
                         Ensure you review the "Alternative Drugs" section in the AI report before final prescription.
                       </p>
                     </div>
                   )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add Patient Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-surface-container-lowest/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="w-full max-w-lg">
            <AddPatientForm 
              onCancel={() => setShowAddForm(false)} 
              onSuccess={handlePatientAdded} 
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
