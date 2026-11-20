export type PromptBlank = {
  key: string;
  label: string;
  example: string;
  long?: boolean;
};

export function valuesForBlanks(url: URL, blanks: PromptBlank[]) {
  const values: Record<string, string> = {};
  for (const blank of blanks) {
    const raw = url.searchParams.get(blank.key) ?? '';
    const clean = raw.replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, 180);
    values[blank.key] = clean || blank.example;
  }
  return values;
}

export function fillPrompt(body: string, values: Record<string, string>) {
  return body.trim().replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => values[key] ?? '');
}
