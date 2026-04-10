import { RiskLevel } from "@/types";

/**
 * Per-gene CPIC-style recommendations.
 * Source: CPIC.pharmacogenomics.org guidelines
 */
const GENE_CPIC_RULES: Record<string, Partial<Record<RiskLevel, string>>> = {
  CYP2D6: {
    "Toxic":         "CYP2D6 Poor Metabolizer: Avoid codeine, tramadol, and tricyclic antidepressants. Use opioids without CYP2D6 metabolism (e.g., morphine, hydromorphone). Reduce TCA dose by ≥50%.",
    "Adjust Dosage": "CYP2D6 Intermediate Metabolizer: Reduce codeine dose by 25–50%. Consider alternative analgesics. Monitor for reduced opioid efficacy or toxicity.",
    "Ineffective":   "CYP2D6 Ultrarapid Metabolizer: Codeine rapidly converted to morphine — risk of respiratory depression. Avoid codeine. Use non-CYP2D6-dependent agents.",
    "Safe":          "CYP2D6 Normal Metabolizer: Standard dosing for CYP2D6-metabolized drugs.",
    "Unknown":       "CYP2D6 status uncertain. Phenotype testing recommended before prescribing CYP2D6-substrate drugs.",
  },
  CYP2C19: {
    "Toxic":         "CYP2C19 Poor Metabolizer: Clopidogrel is likely ineffective — avoid for ACS/PCI. Use prasugrel or ticagrelor instead. PPIs accumulate — halve omeprazole dose.",
    "Adjust Dosage": "CYP2C19 Intermediate Metabolizer: Clopidogrel response may be reduced. Increase monitoring. Consider alternative antiplatelet therapy for high-risk patients.",
    "Ineffective":   "CYP2C19 Ultrarapid Metabolizer: Increased clopidogrel activation — monitor for bleeding risk. PPIs cleared faster, may reduce efficacy.",
    "Safe":          "CYP2C19 Normal Metabolizer: Standard dosing for PPIs and clopidogrel.",
    "Unknown":       "CYP2C19 status uncertain. Genotype-guided therapy recommended.",
  },
  CYP2C9: {
    "Toxic":         "CYP2C9 Poor Metabolizer: Warfarin, phenytoin, NSAIDs accumulate — start at ≤25% normal dose. Frequent INR monitoring mandatory for warfarin.",
    "Adjust Dosage": "CYP2C9 Intermediate Metabolizer: Warfarin dose reduction of 30–50% required. Phenytoin levels should be monitored closely.",
    "Safe":          "CYP2C9 Normal Metabolizer: Standard dosing for warfarin, NSAIDs, and phenytoin.",
    "Unknown":       "CYP2C9 status uncertain. INR-guided dosing required if starting warfarin.",
  },
  SLCO1B1: {
    "Toxic":         "SLCO1B1 *5 Homozygous: High risk of statin-induced myopathy. Avoid simvastatin >20mg/day. Switch to rosuvastatin, pravastatin, or fluvastatin.",
    "Adjust Dosage": "SLCO1B1 *5 Heterozygous: Statin myopathy risk elevated. Prefer low-dose simvastatin (<40mg) or alternative statin. CK monitoring recommended.",
    "Safe":          "SLCO1B1 Normal Function: Standard statin dosing. Low myopathy risk.",
    "Unknown":       "SLCO1B1 status uncertain. Caution warranted with high-dose simvastatin.",
  },
  TPMT: {
    "Toxic":         "TPMT Poor Metabolizer: Avoid standard-dose thiopurines (azathioprine, 6-mercaptopurine). Reduce dose by ≥90% or switch to non-thiopurine alternatives. Myelosuppression risk is severe.",
    "Adjust Dosage": "TPMT Intermediate Metabolizer: Reduce thiopurine dose by 30–70%. Weekly CBC monitoring required for first 8 weeks.",
    "Safe":          "TPMT Normal Metabolizer: Standard thiopurine dosing. Routine monitoring applies.",
    "Unknown":       "TPMT status uncertain. Avoid full-dose thiopurines until phenotype confirmed.",
  },
  DPYD: {
    "Toxic":         "DPYD Poor Metabolizer: 5-fluorouracil (5-FU) and capecitabine are contraindicated. Risk of life-threatening fluoropyrimidine toxicity (mucositis, neutropenia, neurotoxicity). Use alternative agents.",
    "Adjust Dosage": "DPYD Intermediate Metabolizer: Reduce 5-FU/capecitabine starting dose by 50%. Strict toxicity monitoring required. Dose titrate based on tolerance.",
    "Safe":          "DPYD Normal Metabolizer: Standard fluoropyrimidine dosing.",
    "Unknown":       "DPYD status uncertain. Test before initiating fluoropyrimidine therapy.",
  },
};

const GENERIC_RECOMMENDATIONS: Record<RiskLevel, string> = {
  "Safe":          "Variant is likely benign. Standard dosing protocols apply. Routine clinical monitoring is sufficient.",
  "Adjust Dosage": "Variant suggests altered drug metabolism. Consult prescribing guidelines and reduce or titrate dose based on clinical response. Enhanced monitoring recommended.",
  "Toxic":         "High-risk variant detected. Avoid implicated drug class or apply significant dose reduction per CPIC guidelines. Pharmacist and clinical pharmacogeneticist review required.",
  "Ineffective":   "Variant suggests drug may be cleared too rapidly or fail to achieve therapeutic effect. Consider alternative agents with different metabolic pathways.",
  "Unknown":       "Clinical significance of this variant is uncertain. Further pharmacogenomic testing is recommended. Proceed with standard dosing until phenotype is clarified.",
};

export function getRecommendation(risk: RiskLevel, gene: string = ""): string {
  const g = gene.toUpperCase();
  const geneRules = GENE_CPIC_RULES[g];
  if (geneRules && geneRules[risk]) {
    return geneRules[risk]!;
  }
  return GENERIC_RECOMMENDATIONS[risk] ?? GENERIC_RECOMMENDATIONS["Unknown"];
}
