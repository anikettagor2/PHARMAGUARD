export function computeRisk(significance: string): {
  risk: "Safe" | "Monitor" | "Toxic" | "Unknown";
  score: number;
  severity: "Low" | "Medium" | "High" | "Unknown";
} {
  const sigLower = significance.toLowerCase();

  if (sigLower.includes('pathogenic')) {
    return { risk: 'Toxic', score: 0.9, severity: 'High' };
  }

  if (sigLower.includes('uncertain') || sigLower.includes('conflict')) {
    return { risk: 'Monitor', score: 0.5, severity: 'Medium' };
  }

  if (sigLower.includes('benign')) {
    return { risk: 'Safe', score: 0.2, severity: 'Low' };
  }

  return { risk: 'Unknown', score: 0.3, severity: 'Unknown' };
}
