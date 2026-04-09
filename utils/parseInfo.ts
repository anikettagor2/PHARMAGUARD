export function parseInfo(infoStr: string) {
  if (!infoStr) {
    return { CLNSIG: 'Unknown', CLNDN: 'Unknown', MC: 'Unknown' };
  }

  const parts = infoStr.split(';');
  const infoObj: Record<string, string> = {};
  
  parts.forEach(part => {
    const [key, ...valueParts] = part.split('=');
    if (key) {
      infoObj[key] = valueParts.join('=') || '';
    }
  });

  let clnsig = infoObj['CLNSIG'] || 'Unknown';
  
  // if multiple CLNSIG, pick highest severity
  if (clnsig.includes('|') || clnsig.includes(',')) {
    const sigs = clnsig.split(/[|,]/).map(s => s.trim().toLowerCase());
    if (sigs.includes('pathogenic')) clnsig = 'Pathogenic';
    else if (sigs.includes('likely_pathogenic')) clnsig = 'Likely_pathogenic';
    else if (sigs.includes('uncertain_significance')) clnsig = 'Uncertain_significance';
    else if (sigs.includes('likely_benign')) clnsig = 'Likely_benign';
    else if (sigs.includes('benign')) clnsig = 'Benign';
    else clnsig = sigs[0];
  }

  return {
    CLNSIG: clnsig,
    CLNDN: infoObj['CLNDN'] || 'Unknown',
    MC: infoObj['MC'] || 'Unknown'
  };
}

export function normalizeMutation(ref: string, alt: string) {
  if (!ref && !alt) return 'Unknown';
  return `${ref}>${alt}`;
}
