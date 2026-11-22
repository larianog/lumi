/** Accent- and case-insensitive form used to compare spoken and printed words. */
export function normalizeWord(value: string) {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Split a word box into items ("pepino - mel - tangerina", "ib oia, elatina, pa é").
 * Returns null when it reads like prose, so it is shown as text instead.
 */
export function parseWordBank(content: string) {
  const items = content
    .split(/\s+[-–—]\s+|\s*\n\s*|\s*[;,]\s*/)
    .map((item) => item.replace(/[-–—]\s*$/, '').trim())
    .filter(Boolean);
  if (items.length < 3 || items.some((item) => item.length > 32 || item.split(/\s+/).length > 3)) return null;
  return items;
}

/** True when `printed` (letters only) appears, in order, inside `spoken`: "iboia" ⊂ "jiboia". */
function isSubsequence(printed: string, spoken: string) {
  let next = 0;
  for (const letter of spoken) {
    if (letter === printed[next]) next += 1;
    if (next === printed.length) return true;
  }
  return printed.length === 0;
}

/**
 * Answers to write from what the child said, in spoken order, skipping words
 * already in a blank.
 * - Exact bank words ("amora") are written with the bank's spelling. Whole
 *   words only, longest first, so "mel" does not match inside "melão".
 * - Bank items with a missing letter ("_iboia", "pa é" for "pajé") match a
 *   spoken word that contains the printed letters in order plus 1–2 more; the
 *   child's word is written as said (right or wrong: "giboia" too).
 */
export function matchBankWords(spoken: string, bank: string[], alreadyUsed: string[] = []) {
  const text = ` ${normalizeWord(spoken).replace(/[^a-z0-9\s-]/g, ' ')} `;
  const used = new Set(alreadyUsed.map(normalizeWord).filter(Boolean));
  const taken: Array<[number, number]> = [];
  const found: Array<{ word: string; position: number }> = [];
  const overlaps = (start: number, end: number) => taken.some(([from, to]) => start < to && end > from);

  const items = bank
    .map((word) => ({ word, key: normalizeWord(word) }))
    .filter(({ key }) => key)
    .sort((a, b) => b.key.length - a.key.length);

  // 1) Exact whole-word matches.
  const gapped: typeof items = [];
  for (const item of items) {
    if (used.has(item.key)) continue;
    const pattern = new RegExp(`(?<=\\s)${escapeRegExp(item.key)}(?=\\s)`, 'g');
    let matched = false;
    for (const match of text.matchAll(pattern)) {
      const start = match.index ?? 0;
      const end = start + item.key.length;
      if (overlaps(start, end)) continue;
      taken.push([start, end]);
      found.push({ word: item.word, position: start });
      matched = true;
      break;
    }
    if (!matched) gapped.push(item);
  }

  // 2) Fill-in-the-letter matches against the remaining spoken words. Tokens
  // line up 1:1 with the original words, so we can write the child's spelling.
  const originalWords = spoken.match(/[\p{L}\p{N}]+/gu) ?? [];
  const tokens = Array.from(text.matchAll(/[a-z0-9]+/g), (match, index) => ({
    token: match[0],
    original: originalWords[index] ?? match[0],
    start: match.index ?? 0,
    end: (match.index ?? 0) + match[0].length,
  }));
  for (const item of gapped) {
    const letters = item.key.replace(/[^a-z0-9]/g, '');
    if (letters.length < 3) continue;
    const hit = tokens.find(({ token, start, end }) =>
      !overlaps(start, end)
      && token.length > letters.length
      && token.length - letters.length <= 2
      && !used.has(token)
      && isSubsequence(letters, token));
    if (!hit) continue;
    taken.push([hit.start, hit.end]);
    found.push({ word: hit.original.toLowerCase(), position: hit.start });
  }

  return found.sort((a, b) => a.position - b.position).map(({ word }) => word);
}

const NUMBER_WORDS: Record<string, string> = {
  um: '1', uma: '1', primeira: '1', dois: '2', duas: '2', segunda: '2', tres: '3', terceira: '3',
  quatro: '4', quarta: '4', cinco: '5', quinta: '5', seis: '6', sexta: '6', sete: '7', setima: '7',
  oito: '8', oitava: '8', nove: '9', nona: '9', dez: '10', decima: '10', onze: '11', doze: '12',
  treze: '13', quatorze: '14', catorze: '14', quinze: '15',
};

/** "questão dois", "na questão 2", "exercício 3" → "2" / "3"; null when no question is named. */
export function mentionedQuestion(spoken: string) {
  const text = normalizeWord(spoken);
  const match = text.match(/(?:questao|exercicio|atividade|numero)\s+([a-z0-9]+)/);
  if (!match) return null;
  return NUMBER_WORDS[match[1]] ?? (/^\d+[a-z]?$/.test(match[1]) ? match[1] : null);
}
