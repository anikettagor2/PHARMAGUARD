export type RiskLevel = "Safe" | "Adjust Dosage" | "Toxic" | "Ineffective" | "Unknown";
export type SeverityLevel = "Low" | "Medium" | "High" | "Critical" | "Unknown";

export interface Variant {
  id?: string;
  gene: string;
  mutation: string;
  significance: string;
  risk: RiskLevel;
  score: number;
  severity: SeverityLevel;
  recommendation: string;
  genePriority: boolean;
  cpicGene: boolean;
  explanation?: string;
  drugSuggestions?: string;
  duration?: string;
  effectOnBody?: {
    metabolicImpact: string;
    drugBehavior: string;
    clinicalEffects: string[];
    severity: string;
    patientSummary: string;
  };
  fileId?: string;
  userId?: string;
  createdAt?: number;
  pos: string;
  ref: string;
  alt: string;
  info: string;
  drug?: string;
  patientId?: string;
  chromosome?: string;
}

export interface Alert {
  id?: string;
  message: string;
  severity: "critical" | "warning" | "info";
  variantId: string;
  userId: string;
  createdAt: number;
  read: boolean;
  patientId?: string;
}

export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface PharmacogenomicReport {
  patientId: string;
  drug: string;
  analysisDate: string;
  totalVariants: number;
  riskAssessment: {
    overall: RiskLevel;
    toxic: number;
    adjustDosage: number;
    ineffective: number;
    safe: number;
    unknown: number;
  };
  pharmacogenomicProfile: Record<string, {
    gene: string;
    cpicGene: boolean;
    risk: RiskLevel;
    mutation: string;
    recommendation: string;
  }>;
  recommendations: string[];
  qualityMetrics: {
    variantsProcessed: number;
    variantsFiltered: number;
    confidenceAvg: number;
    genesIdentified: string[];
  };
}

export interface Patient {
  id?: string;
  name: string;
  phone: string;
  height: string;
  weight: string;
  doctorId: string; // The userId of the doctor who created this patient
  createdAt: number;
}
