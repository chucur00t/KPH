/**
 * Utility Formatters & Helpers
 */

export function formatDateWib(isoString: string): string {
  try {
    const d = new Date(isoString);
    return (
      d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Pontianak',
      }) + ' WIB'
    );
  } catch {
    return isoString;
  }
}

export function formatHectares(ha: number): string {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 }).format(ha);
}

export function formatCoords(lat: number, lon: number): string {
  const latDir = lat >= 0 ? 'LU' : 'LS';
  const lonDir = lon >= 0 ? 'BT' : 'BB';
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lon).toFixed(4)}° ${lonDir}`;
}

export function exportAsJsonFile(data: any, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportAsTextFile(content: string, filename: string) {
  const blob = new Blob([content], {
    type: 'text/markdown;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
