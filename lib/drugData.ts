export interface DrugSuggestion {
  name: string;
  risk: string;
  severity: string;
  recommendation: string;
  confidence: number;
  explanation: string;
  typicalDuration?: string;
}

export const GENE_DRUG_DATA: Record<string, { related_genes: string[]; drugs: DrugSuggestion[] }> = {
  CYP2D6: {
    related_genes: ["CYP3A4"],
    drugs: [
      {
        name: "Codeine",
        risk: "High",
        severity: "Severe",
        recommendation: "Avoid use in poor metabolizers. Consider Morphine or Non-opioid alternatives.",
        confidence: 0.95,
        explanation: "CYP2D6 is required to convert Codeine into active form. Poor metabolizers get no effect, ultra-rapid metabolizers risk toxicity.",
        typicalDuration: "Duration: Acute use only (3-5 days)"
      },
      {
        name: "Tramadol",
        risk: "Moderate",
        severity: "Medium",
        recommendation: "Adjust dose or use Tapentadol.",
        confidence: 0.85,
        explanation: "Altered CYP2D6 activity affects drug metabolism and efficacy.",
        typicalDuration: "Duration: 5-7 days as needed"
      }
    ]
  },
  CYP2C19: {
    related_genes: ["CYP3A5"],
    drugs: [
      {
        name: "Clopidogrel",
        risk: "High",
        severity: "Severe",
        recommendation: "Use alternative drug (e.g., Prasugrel or Ticagrelor).",
        confidence: 0.92,
        explanation: "CYP2C19 activates Clopidogrel. Poor metabolizers have reduced drug efficacy.",
        typicalDuration: "Duration: 12 months (post-stent)"
      },
      {
        name: "Omeprazole",
        risk: "Moderate",
        severity: "Medium",
        recommendation: "Consider Rabeprazole or Pantoprazole if rapid metabolizer.",
        confidence: 0.8,
        explanation: "CYP2C19 variants affect drug clearance.",
        typicalDuration: "Duration: 14-28 days"
      }
    ]
  },
  CYP2C9: {
    related_genes: ["VKORC1"],
    drugs: [
      {
        name: "Warfarin",
        risk: "High",
        severity: "Severe",
        recommendation: "Reduce dosage significantly or use DOACs like Apixaban.",
        confidence: 0.97,
        explanation: "CYP2C9 variants slow Warfarin metabolism, increasing bleeding risk.",
        typicalDuration: "Duration: Long-term/Chronic"
      },
      {
        name: "Phenytoin",
        risk: "High",
        severity: "High",
        recommendation: "Reduce dose by 25-50%.",
        confidence: 0.9,
        explanation: "Reduced metabolism leads to drug accumulation.",
        typicalDuration: "Duration: Chronic"
      }
    ]
  },
  SLCO1B1: {
    related_genes: ["ABCG2"],
    drugs: [
      {
        name: "Simvastatin",
        risk: "High",
        severity: "Severe",
        recommendation: "Avoid or reduce dose. Consider Pravastatin or Fluvastatin.",
        confidence: 0.93,
        explanation: "SLCO1B1 variants increase statin concentration causing muscle toxicity.",
        typicalDuration: "Duration: Chronic"
      },
      {
        name: "Atorvastatin",
        risk: "Moderate",
        severity: "Medium",
        recommendation: "Monitor for myopathy or use Rosuvastatin.",
        confidence: 0.8,
        explanation: "Transporter function affects drug uptake in liver.",
        typicalDuration: "Duration: Chronic"
      }
    ]
  },
  TPMT: {
    related_genes: ["NUDT15"],
    drugs: [
      {
        name: "Azathioprine",
        risk: "High",
        severity: "Severe",
        recommendation: "Reduce dose by 90% or avoid. Consider biologicals.",
        confidence: 0.96,
        explanation: "Low TPMT activity leads to toxic accumulation causing bone marrow suppression.",
        typicalDuration: "Duration: Chronic (until remission)"
      },
      {
        name: "Mercaptopurine",
        risk: "High",
        severity: "Severe",
        recommendation: "Adjust dose significantly.",
        confidence: 0.95,
        explanation: "Reduced metabolism increases toxicity risk.",
        typicalDuration: "Duration: Maintenance phase (variable)"
      }
    ]
  },
  DPYD: {
    related_genes: ["TYMS"],
    drugs: [
      {
        name: "Fluorouracil",
        risk: "High",
        severity: "Life-threatening",
        recommendation: "Avoid use. Use alternative chemotherapy if available.",
        confidence: 0.98,
        explanation: "DPYD deficiency leads to severe toxicity due to impaired drug breakdown.",
        typicalDuration: "Duration: Per Cycle (continuous infusion)"
      },
      {
        name: "Capecitabine",
        risk: "High",
        severity: "Severe",
        recommendation: "Reduce dose or avoid.",
        confidence: 0.95,
        explanation: "Prodrug of Fluorouracil; toxicity risk is high in DPYD variants.",
        typicalDuration: "Duration: 14 days on, 7 days off"
      }
    ]
  }
};
