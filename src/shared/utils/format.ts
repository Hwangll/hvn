export function splitParagraphs(text: string): string[] {
  return text
    .split("\n")
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}
