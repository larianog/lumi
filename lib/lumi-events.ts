/**
 * Browser-only bridge from page UI (e.g. the homework answer grid) to the live
 * Lumi conversation. `ConversationComponent` listens and forwards the text to
 * the agent over RTM; if no conversation is live, nothing happens and
 * `sendTextToLumi` returns false.
 */
export const LUMI_SEND_TEXT_EVENT = 'lumi:send-text';

export type LumiSendTextDetail = {
  text: string;
  /** Set to true by the listener when a live conversation accepted the text. */
  handled?: boolean;
};

export function sendTextToLumi(text: string) {
  const detail: LumiSendTextDetail = { text };
  window.dispatchEvent(new CustomEvent<LumiSendTextDetail>(LUMI_SEND_TEXT_EVENT, { detail }));
  return Boolean(detail.handled);
}

/**
 * Lumi writes `[preencher <questão>|<espaço>|<resposta>]` in her reply when the
 * child says an answer out loud. TTS skips bracketed text (MiniMax
 * `skip_patterns: [4]`), the UI strips it from transcripts, and
 * `ConversationComponent` turns each command into this event so the answer
 * grid can fill the matching blank.
 */
export const LUMI_FILL_ANSWER_EVENT = 'lumi:fill-answer';

export type LumiFillAnswerDetail = {
  question: string;
  slot: string;
  answer: string;
};

const FILL_COMMAND = /\[\s*preencher\s+([^|\]]*)\|([^|\]]*)\|([^\]]*)\]/gi;
// A command still being streamed (no closing bracket yet).
const PARTIAL_COMMAND = /\[\s*(?:p(?:r(?:e(?:e(?:n(?:c(?:h(?:e(?:r)?)?)?)?)?)?)?)?[^\]]*)?$/i;

export function extractFillCommands(text: string): LumiFillAnswerDetail[] {
  return Array.from(text.matchAll(FILL_COMMAND), (match) => ({
    question: match[1].trim(),
    slot: match[2].trim(),
    answer: match[3].trim(),
  })).filter((command) => command.answer);
}

/** Remove fill commands (complete or still streaming) from text shown to people. */
export function stripFillCommands(text: string) {
  return text.replace(FILL_COMMAND, '').replace(PARTIAL_COMMAND, '').replace(/\s{2,}/g, ' ').trim();
}

export function fillAnswer(detail: LumiFillAnswerDetail) {
  window.dispatchEvent(new CustomEvent<LumiFillAnswerDetail>(LUMI_FILL_ANSWER_EVENT, { detail }));
}

/**
 * What the child said (final speech-to-text turns). The study page matches it
 * against the active question's word bank to fill answer blanks directly,
 * without depending on the LLM.
 */
export const LUMI_CHILD_SAID_EVENT = 'lumi:child-said';

export type LumiChildSaidDetail = { text: string };

export function childSaid(text: string) {
  window.dispatchEvent(new CustomEvent<LumiChildSaidDetail>(LUMI_CHILD_SAID_EVENT, { detail: { text } }));
}

/** The study page routed a spoken utterance to one question (by index). */
export const LUMI_VOICE_ANSWERS_EVENT = 'lumi:voice-answers';

export type LumiVoiceAnswersDetail = { index: number; text: string };

export function routeVoiceAnswers(detail: LumiVoiceAnswersDetail) {
  window.dispatchEvent(new CustomEvent<LumiVoiceAnswersDetail>(LUMI_VOICE_ANSWERS_EVENT, { detail }));
}
