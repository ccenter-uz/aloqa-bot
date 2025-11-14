export const extractId = (text: string): string | null => {
  const lines = text.split('\n');
  if (!lines.length) return null;

  const idLine = lines.find((line) => line.toLowerCase().startsWith('👤 id:'));
  if (!idLine) return null;

  const id = idLine.split(':')[1]?.trim();
  return id || null;
};
