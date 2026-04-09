export interface Variant {
  id?: string;
  gene: string;
  mutation: string; // REF>ALT
  significance: string;
  risk: "Safe" | "Monitor" | "Toxic" | "Unknown";
  score: number;
  severity: "Low" | "Medium" | "High" | "Unknown";
  recommendation: string;
  genePriority: boolean;
  explanation?: string;
  fileId?: string;
  userId?: string;
  createdAt?: number;
  pos: string;
  ref: string;
  alt: string;
  info: string;
}

export interface Alert {
  id?: string;
  message: string;
  severity: "critical" | "warning" | "info";
  variantId: string;
  userId: string;
  createdAt: number;
  read: boolean;
}

export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
}
