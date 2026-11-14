/**
 * Arabic transcript similarity
 * Compares what the browser speech recogniser heard against the target
 * Arabic word/letter and returns a real 0–100 match score. This is a
 * direct text comparison — never a random number.
 */

/** Strip diacritics, tatweel and punctuation; normalise alef/yeh/teh forms. */
export const normalizeArabic = (text: string): string => {
  return text
    .replace(/[ً-ٰٟـ]/g, '') // tashkeel + tatweel
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[؟?.,!؛،'"«»()\-–—]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

/** Classic Levenshtein edit distance. */
const levenshtein = (a: string, b: string): number => {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const prev = new Array<number>(n + 1);
  const curr = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= n; j++) prev[j] = curr[j];
  }
  return prev[n];
};

/**
 * Real similarity between the recognised transcript and the target.
 * Returns null when nothing was recognised (no score to show).
 */
export const arabicSimilarity = (transcript: string, target: string): number | null => {
  const heard = normalizeArabic(transcript);
  const want = normalizeArabic(target);
  if (!heard || !want) return null;
  if (heard === want) return 100;
  // The recogniser sometimes returns the target word inside a longer phrase.
  if (heard.includes(want) || want.includes(heard)) {
    const shorter = Math.min(heard.length, want.length);
    const longer = Math.max(heard.length, want.length);
    return Math.round((shorter / longer) * 100);
  }
  const distance = levenshtein(heard, want);
  const maxLen = Math.max(heard.length, want.length);
  return Math.max(0, Math.round(((maxLen - distance) / maxLen) * 100));
};
