export type ParsedResume = {
  atsScore: number | null;
  strengths: string[];
  improvements: string[];
  beforeBullet: string;
  afterBullet: string;
};

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractSection(text: string, title: string): string | null {
  const re = new RegExp(
    `^##\\s*${escapeRe(title)}\\s*\\r?\\n([\\s\\S]*?)(?=^##\\s|$)`,
    "im"
  );
  const m = text.match(re);
  return m ? m[1].trim() : null;
}

function extractSectionAny(text: string, titles: string[]): string | null {
  for (const t of titles) {
    const s = extractSection(text, t);
    if (s) return s;
  }
  return null;
}

function parseListItems(block: string): string[] {
  if (!block) return [];
  const lines = block.split(/\r?\n/);
  const items: string[] = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    const bullet = t.match(/^[-*•]\s+(.+)$/);
    const numbered = t.match(/^\d+[.)]\s+(.+)$/);
    if (bullet) items.push(bullet[1].trim());
    else if (numbered) items.push(numbered[1].trim());
    else if (items.length && !t.startsWith("#")) {
      items[items.length - 1] += " " + t;
    }
  }
  return items.filter(Boolean);
}

function parseAtsFromSection(section: string): number | null {
  const plain = section.replace(/\*\*/g, "");
  const frac = plain.match(/(\d{1,3})\s*\/\s*100/);
  if (frac) return Math.min(100, Math.max(0, parseInt(frac[1], 10)));
  const num = plain.match(/(\d{1,3})/);
  if (num) return Math.min(100, Math.max(0, parseInt(num[1], 10)));
  return null;
}

function stripMdBold(s: string): string {
  return s.replace(/\*\*/g, "").trim();
}

function parseBeforeAfter(section: string): { before: string; after: string } {
  let before = "";
  let after = "";
  const beforeM = section.match(
    /\*\*Before:\*\*\s*([\s\S]*?)(?=\*\*After:|\n\*\*After:|$)/i
  );
  const afterM = section.match(/\*\*After:\*\*\s*([\s\S]*)$/i);
  if (beforeM) before = stripMdBold(beforeM[1].trim());
  if (afterM) after = stripMdBold(afterM[1].trim());
  if (!before && !after) {
    const lines = section.split(/\r?\n/).map((l) => l.trim());
    for (let i = 0; i < lines.length; i++) {
      if (/^before:?/i.test(lines[i])) {
        before = lines[i].replace(/^before:?\s*/i, "").replace(/^["']|["']$/g, "");
        if (!before && lines[i + 1]) before = lines[++i];
      }
      if (/^after:?/i.test(lines[i])) {
        after = lines[i].replace(/^after:?\s*/i, "").replace(/^["']|["']$/g, "");
        if (!after && lines[i + 1]) after = lines[++i];
      }
    }
  }
  return { before, after };
}

export function parseResumeFromMarkdown(text: string): ParsedResume | null {
  const atsBlock = extractSectionAny(text, [
    "ATS Score",
    "ATS compatibility",
    "ATS Compatibility Score",
  ]);
  const strengthsBlock = extractSectionAny(text, ["Strengths", "Key strengths"]);
  const improvementsBlock = extractSectionAny(text, [
    "Improvements",
    "Areas to improve",
    "Improvement areas",
  ]);
  const exampleBlock = extractSectionAny(text, [
    "Example bullet",
    "Bullet rewrite",
    "Rewritten bullet",
    "Example rewrite",
  ]);

  const atsScore = atsBlock ? parseAtsFromSection(atsBlock) : null;
  const strengths = strengthsBlock ? parseListItems(strengthsBlock) : [];
  const improvements = improvementsBlock
    ? parseListItems(improvementsBlock)
    : [];
  const { before: beforeBullet, after: afterBullet } = exampleBlock
    ? parseBeforeAfter(exampleBlock)
    : { before: "", after: "" };

  const usable =
    atsScore !== null ||
    strengths.length > 0 ||
    improvements.length > 0 ||
    (beforeBullet && afterBullet);

  if (!usable) return null;

  return {
    atsScore,
    strengths,
    improvements,
    beforeBullet,
    afterBullet,
  };
}
