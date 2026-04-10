export interface DrugEffect {
  metabolicImpact: string;
  drugBehavior: string;
  clinicalEffects: string[];
  severity: string;
  patientSummary: string;
}

export interface DrugSuggestion {
  name: string;
  risk: string;
  severity: string;
  recommendation: string;
  confidence: number;
  explanation: string;
  duration?: string;
  effectOnBody?: DrugEffect;
}

export const GENE_DRUGS: Record<string, { drugs: DrugSuggestion[] }> = {
  "CYP2D6": {
    drugs: [
      {
        name: "Codeine",
        risk: "High",
        severity: "Severe",
        recommendation: "Avoid use in poor metabolizers",
        confidence: 0.95,
        explanation: "CYP2D6 is required to convert Codeine into active form.",
        duration: "Not recommended",
        effectOnBody: {
          metabolicImpact: "Failure to convert prodrug to active morphine",
          drugBehavior: "Drug remains inactive in bloodstream",
          clinicalEffects: ["Lack of pain relief", "Risk of respiratory depression in ultra-rapid metabolizers"],
          severity: "Severe",
          patientSummary: "Your body cannot activate this medicine, making it ineffective for pain relief."
        }
      },
      {
        name: "Tramadol",
        risk: "Moderate",
        severity: "Medium",
        recommendation: "Adjust dose",
        confidence: 0.85,
        explanation: "Altered CYP2D6 activity affects drug metabolism.",
        duration: "Short-term use only",
        effectOnBody: {
          metabolicImpact: "Reduced conversion to active O-desmethyltramadol",
          drugBehavior: "Decreased analgesic efficacy",
          clinicalEffects: ["Poor pain management", "Nausea", "Dizziness"],
          severity: "Moderate",
          patientSummary: "This medicine may not work effectively at standard doses due to slow activation."
        }
      }
    ]
  },
  "CYP2C19": {
    drugs: [
      {
        name: "Clopidogrel",
        risk: "Critical",
        severity: "Severe",
        recommendation: "Use alternative antiplatelet (e.g., Prasugrel)",
        confidence: 0.98,
        explanation: "Poor metabolizers have increased risk of major cardiac events.",
        duration: "Continuous",
        effectOnBody: {
          metabolicImpact: "Insufficient production of active metabolite",
          drugBehavior: "Increased platelet aggregation despite therapy",
          clinicalEffects: ["Stent thrombosis", "Myocardial infarction", "Stroke"],
          severity: "Severe",
          patientSummary: "This drug fails to prevent blood clots in your system, significantly increasing heart attack risk."
        }
      }
    ]
  },
  "SLCO1B1": {
    drugs: [
      {
        name: "Simvastatin",
        risk: "Moderate",
        severity: "Medium",
        recommendation: "Use lower dose or alternative statin",
        confidence: 0.90,
        explanation: "Increased risk of myopathy.",
        duration: "Long-term",
        effectOnBody: {
          metabolicImpact: "Reduced transport of statin into the liver",
          drugBehavior: "Increased systemic exposure and plasma levels",
          clinicalEffects: ["Muscle pain (Myopathy)", "Rhabdomyolysis", "Liver enzyme elevation"],
          severity: "Moderate",
          patientSummary: "This drug stays in your blood longer instead of entering the liver, which can cause muscle damage."
        }
      }
    ]
  },
  "DPYD": {
    drugs: [
      {
        name: "Fluorouracil (5-FU)",
        risk: "Toxic",
        severity: "Critical",
        recommendation: "Reduce dose by 50% or avoid completely",
        confidence: 0.99,
        explanation: "Deficiency in DPD enzyme prevents clearance of 5-FU.",
        duration: "Cycle-dependent",
        effectOnBody: {
          metabolicImpact: "Severely impaired drug detoxification",
          drugBehavior: "Rapid accumulation of toxic chemotherapy levels",
          clinicalEffects: ["Severe neutropenia", "Stomatitis", "Diarrhea", "Neurotoxicity"],
          severity: "Severe",
          patientSummary: "Your body cannot break down this chemotherapy, which can lead to life-threatening toxicity."
        }
      }
    ]
  }
};
