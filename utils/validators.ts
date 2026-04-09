export function validateVariantFile(data: any[]): boolean {
  if (!Array.isArray(data)) return false;

  return data.every(item => {
    return (
      item.hasOwnProperty('gene') &&
      item.hasOwnProperty('POS') &&
      item.hasOwnProperty('REF') &&
      item.hasOwnProperty('ALT') &&
      item.hasOwnProperty('INFO')
    );
  });
}
