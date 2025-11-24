export type ParsedActivity = { type: "walk" | "play" | "treat" | "care"; amount: number; unit: string };

export const extractActivities = (text: string): ParsedActivity[] => {
  const matches: ParsedActivity[] = [];
  const regex = /(散歩|ウォーク|walk|遊び|play|おやつ|treat|ケア)(\d+)?(分|回)?/gi;
  let m;
  while ((m = regex.exec(text)) !== null) {
    const raw = m[0];
    const amount = Number(m[2]) || 1;
    if (/散歩|walk|ウォーク/i.test(raw)) matches.push({ type: "walk", amount, unit: "min" });
    if (/遊び|play/i.test(raw)) matches.push({ type: "play", amount, unit: "min" });
    if (/おやつ|treat/i.test(raw)) matches.push({ type: "treat", amount, unit: "count" });
    if (/ケア/i.test(raw)) matches.push({ type: "care", amount, unit: "count" });
  }
  return matches;
};
