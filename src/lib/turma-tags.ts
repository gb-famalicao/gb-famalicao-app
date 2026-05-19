interface TurmaTag { code: string; bg: string }

const TAGS: Array<{ keywords: string[]; code: string; bg: string }> = [
  { keywords: ["gb1 e gb2", "gb1/2"],              code: "GB1/2", bg: "#5B7FF8" },
  { keywords: ["gb1"],                              code: "GB1",   bg: "#5B7FF8" },
  { keywords: ["gb2"],                              code: "GB2",   bg: "#1E3A8A" },
  { keywords: ["gb3"],                              code: "GB3",   bg: "#0F766E" },
  { keywords: ["no-gi", "nogi"],                    code: "NoGi",  bg: "#EA580C" },
  { keywords: ["competição", "competicao", "cmp"],  code: "CMP",   bg: "#0A0A0A" },
  { keywords: ["gbf", "feminino"],                  code: "GBF",   bg: "#EC4899" },
  { keywords: ["gbk", "3 a 6"],                     code: "GBK",   bg: "#D97706" },
  { keywords: ["kids"],                             code: "KIDS",  bg: "#CA8A04" },
  { keywords: ["juniores", "7 a 12"],               code: "JNR",   bg: "#16A34A" },
  { keywords: ["treino livre"],                     code: "LVR",   bg: "#CC0000" },
];

export function getTurmaTag(nome: string): TurmaTag | null {
  const lower = nome.toLowerCase();
  for (const entry of TAGS) {
    if (entry.keywords.some((k) => lower.includes(k))) {
      return { code: entry.code, bg: entry.bg };
    }
  }
  return null;
}
