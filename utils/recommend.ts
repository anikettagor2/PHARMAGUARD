export function getRecommendation(risk: "Safe" | "Monitor" | "Toxic" | "Unknown"): string {
  switch (risk) {
    case 'Safe':
      return 'Standard dosage';
    case 'Monitor':
      return 'Use with caution; monitor toxicity markers';
    case 'Toxic':
      return 'Avoid drug or reduce dosage per CPIC';
    case 'Unknown':
      return 'Further genetic testing recommended';
    default:
      return 'Consult a clinical pharmacogeneticist';
  }
}
