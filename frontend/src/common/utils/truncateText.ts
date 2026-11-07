export const truncateText = (text: string, maxLength = 90) =>
  text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}...` : text;
