/*
 * Comparador: a fala da criança (transcrição do ASR) × a palavra-alvo da atividade.
 *
 * Por que não comparar texto exato: o ASR erra com voz infantil, e uma palavra em
 * inglês dita por criança brasileira vem escrita "do jeito português" (ball -> "bol").
 * Então o comparador tem 4 camadas, da mais certa para a mais frouxa:
 *   1. exata        a palavra-alvo aparece como palavra inteira na fala
 *   2. alias        o ASR costuma escrever assim (lista por palavra, enche com os testes)
 *   3. fonética     escrita parecida depois de "achatar" (ss/ç/s, c/qu/k, h mudo, letra dobrada)
 *   4. aproximada   distância de edição pequena (1 letra em palavra curta)
 *
 * Resultado: status = "correct" | "close" | "wrong" | "silence"
 *   correct  -> exata, alias ou fonética
 *   close    -> aproximada: o app deve pedir "quase! tenta de novo", não marcar erro
 *   wrong    -> disse outra coisa
 *   silence  -> sem transcrição útil (ruído, ou só enchimento: "é", "hum")
 *
 * Funciona no navegador (window.Matcher) e no Node (module.exports), para testar.
 */
(function (root) {
  "use strict";

  // Palavras que a criança fala em volta e que não contam como resposta.
  const FILLER = new Set([
    "e", "eh", "hum", "hm", "ah", "ahn", "uh", "tipo", "entao", "ne", "ta", "ai",
    "eu", "falei", "falo", "foi", "acho", "que", "e", "o", "a", "os", "as", "um", "uma",
    "de", "do", "da", "pra", "para", "isso", "essa", "esse", "aqui", "assim",
    "the", "a", "an", "it", "is", "its", "this", "that", "i", "say", "said",
  ]);

  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "") // tira acentos
      .replace(/[^a-z0-9\s]/g, " ") // tira pontuação
      .replace(/\s+/g, " ")
      .trim();
  }

  function tokens(s) {
    return normalize(s).split(" ").filter(Boolean);
  }

  // "Achata" a escrita para aproximar o som. Serve para comparar duas grafias.
  function phonetic(w) {
    return normalize(w)
      .replace(/\s/g, "")
      .replace(/^h/, "") // h mudo no começo (hot -> ot é aceitável para criança)
      .replace(/ph/g, "f")
      .replace(/qu|c(?=[aou])|k/g, "k")
      .replace(/c(?=[ei])|ss|sc|z|x/g, "s")
      .replace(/ck/g, "k")
      .replace(/w/g, "u")
      .replace(/y/g, "i")
      .replace(/(.)\1+/g, "$1") // letra dobrada
      .replace(/[aeiou]+$/, (m) => m[0]) // vogal final: ball~bola não depende dela
      .replace(/l+$|r+$/, ""); // l/r final some em fala de criança (ball ~ bo, car ~ ca)
  }

  function levenshtein(a, b) {
    const m = a.length, n = b.length;
    if (!m) return n;
    if (!n) return m;
    let prev = Array.from({ length: n + 1 }, (_, j) => j);
    for (let i = 1; i <= m; i++) {
      const cur = [i];
      for (let j = 1; j <= n; j++) {
        cur[j] = Math.min(
          prev[j] + 1,
          cur[j - 1] + 1,
          prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
        );
      }
      prev = cur;
    }
    return prev[n];
  }

  function similarity(a, b) {
    const L = Math.max(a.length, b.length);
    return L ? 1 - levenshtein(a, b) / L : 1;
  }

  /*
   * activity = { target: "bola", accept?: ["bolas"], asrAliases?: ["bol","bolla"] }
   *   target       palavra pedida (ou frase curta)
   *   accept       outras respostas corretas de verdade (sinônimos, plural)
   *   asrAliases   como o ASR costuma escrever errado essa palavra (vem dos testes)
   */
  function compare(heard, activity) {
    const toks = tokens(heard);
    const content = toks.filter((t) => !FILLER.has(t) || t === normalize(activity.target));
    const base = {
      heard: String(heard || ""),
      target: activity.target,
      matched: null,
    };
    if (!content.length) return { ...base, status: "silence", score: 0, how: "sem conteúdo" };

    const targets = [activity.target, ...(activity.accept || [])].map(normalize);
    const aliases = (activity.asrAliases || []).map(normalize);
    const joined = " " + content.join(" ") + " ";

    // 1. exata (palavra inteira ou frase inteira)
    for (const t of targets) {
      if (joined.includes(" " + t + " ")) return { ...base, status: "correct", score: 1, matched: t, how: "exata" };
    }
    // 2. alias conhecido do ASR
    for (const al of aliases) {
      if (joined.includes(" " + al + " ")) return { ...base, status: "correct", score: 0.95, matched: al, how: "alias do ASR" };
    }
    // 3. fonética, token a token (e janelas de 2 palavras para alvos com espaço)
    const tgtPh = targets.map(phonetic);
    const windows = [...content];
    for (let i = 0; i + 1 < content.length; i++) windows.push(content[i] + content[i + 1]);
    for (const w of windows) {
      const pw = phonetic(w);
      if (!pw) continue;
      for (let k = 0; k < targets.length; k++) {
        if (pw === tgtPh[k] && pw.length >= 2) {
          return { ...base, status: "correct", score: 0.9, matched: w, how: "som parecido" };
        }
      }
    }
    // 4. aproximada: o melhor token contra o melhor alvo
    let best = { s: 0, w: null };
    for (const w of windows) {
      for (const t of targets) {
        const s = similarity(w, t);
        if (s > best.s) best = { s, w };
      }
    }
    const tLen = Math.min(...targets.map((t) => t.length));
    const closeMin = tLen <= 4 ? 0.5 : 0.7; // palavra curta aceita 1-2 letras de diferença
    if (best.s >= closeMin) return { ...base, status: "close", score: best.s, matched: best.w, how: "quase" };

    return { ...base, status: "wrong", score: best.s, matched: best.w, how: "outra palavra" };
  }

  /*
   * Escolhe o melhor resultado entre várias falas do mesmo turno (a criança pode falar
   * "bo... bola!" e o ASR entregar dois finais). correct > close > wrong > silence.
   */
  const RANK = { correct: 3, close: 2, wrong: 1, silence: 0 };
  function best(results) {
    return results.reduce((a, b) => (!a || RANK[b.status] > RANK[a.status] || (b.status === a.status && b.score > a.score) ? b : a), null);
  }

  const api = { compare, best, normalize, phonetic, similarity };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Matcher = api;
})(typeof window !== "undefined" ? window : globalThis);
