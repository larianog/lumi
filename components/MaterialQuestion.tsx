'use client';

import { Eraser, MessageCircleQuestion, Mic } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { matchBankWords, normalizeWord, parseWordBank } from '@/lib/answer-matching';
import { answerStorageKey } from '@/lib/answer-storage';
import {
  LUMI_FILL_ANSWER_EVENT,
  LUMI_VOICE_ANSWERS_EVENT,
  sendTextToLumi,
  type LumiFillAnswerDetail,
  type LumiVoiceAnswersDetail,
} from '@/lib/lumi-events';

export type MaterialQuestionData = {
  number: string;
  statement: string;
  supportContent?: string;
  answerSlots?: string[];
};

type MaterialQuestionProps = {
  materialId: string;
  index: number;
  question: MaterialQuestionData;
  /** Highlighted as the question spoken answers go to by default. */
  active: boolean;
  onActivate: () => void;
};

type SendState = 'idle' | 'sent' | 'offline';

/** "2)", "Questão 2" and "2" all match question 2; "A" matches slot "a". */
const labelKey = (value: string) => value.toLowerCase().replace(/quest[aã]o/g, '').replace(/[^a-z0-9]/g, '');

const normalize = normalizeWord;


/**
 * One worksheet question: the statement, its support content (word bank or
 * text) and numbered answer blanks the child can fill and ask Lumi to check.
 * Answers stay in this browser (localStorage); nothing is graded on screen.
 */
export default function MaterialQuestion({ materialId, index, question, active, onActivate }: MaterialQuestionProps) {
  const label = question.number || String(index + 1);
  const slots = question.answerSlots ?? [];
  const storageKey = answerStorageKey(materialId, label);
  const isSingleSlot = slots.length === 1;
  const [answers, setAnswers] = useState<string[]>(() => slots.map(() => ''));
  const [sendState, setSendState] = useState<SendState>('idle');
  const [filledByVoice, setFilledByVoice] = useState<number[]>([]);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // Latest answers for the Lumi fill listener (registered once per question).
  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // Restore answers typed earlier on this device.
  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(storageKey) ?? 'null') as string[] | null;
      if (Array.isArray(saved)) setAnswers(slots.map((_, slot) => saved[slot] ?? ''));
    } catch {
      // Ignore corrupted or unavailable storage.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restore once per question
  }, [storageKey]);

  const updateAnswer = (slot: number, value: string) => {
    setSendState('idle');
    setAnswers((current) => {
      const next = current.map((answer, position) => (position === slot ? value : answer));
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // Storage may be full or blocked; answers still work for this visit.
      }
      return next;
    });
  };

  /** Write several blanks at once (from speech) and flash them. */
  const fillByVoice = (entries: Array<[number, string]>) => {
    if (entries.length === 0) return;
    entries.forEach(([position, value]) => updateAnswer(position, value));
    setFilledByVoice(entries.map(([position]) => position));
    clearTimeout(highlightTimerRef.current);
    highlightTimerRef.current = setTimeout(() => setFilledByVoice([]), 1800);
  };
  useEffect(() => () => clearTimeout(highlightTimerRef.current), []);

  // Lumi heard the child say an answer and asked to write it in a blank.
  useEffect(() => {
    if (slots.length === 0) return;
    const onFill = (event: Event) => {
      const { question: target, slot, answer } = (event as CustomEvent<LumiFillAnswerDetail>).detail;
      if (labelKey(target) !== labelKey(label)) return;
      const current = answersRef.current;
      let position = slot ? slots.findIndex((candidate) => labelKey(candidate) === labelKey(slot)) : -1;
      if (position < 0) {
        // No usable slot label: skip answers already on the sheet (the
        // word-bank matcher may have written it a moment earlier).
        if (!isSingleSlot && current.some((value) => normalize(value) === normalize(answer))) return;
        position = isSingleSlot ? 0 : current.findIndex((value) => !value.trim());
      }
      if (position < 0) return;
      fillByVoice([[position, answer]]);
    };
    window.addEventListener(LUMI_FILL_ANSWER_EVENT, onFill);
    return () => window.removeEventListener(LUMI_FILL_ANSWER_EVENT, onFill);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- slots/label are stable per question
  }, [label, slots.length]);

  const clearAnswers = () => {
    setSendState('idle');
    setAnswers(slots.map(() => ''));
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // Ignore.
    }
  };

  const wordBank = useMemo(
    () => (question.supportContent ? parseWordBank(question.supportContent) : null),
    [question.supportContent],
  );

  // The study page routed what the child said to this question: write the
  // matching words in the next empty blanks, in the order spoken.
  useEffect(() => {
    if (!wordBank || slots.length === 0) return;
    const onVoiceAnswers = (event: Event) => {
      const detail = (event as CustomEvent<LumiVoiceAnswersDetail>).detail;
      if (detail.index !== index) return;
      const current = answersRef.current;
      const words = matchBankWords(detail.text, wordBank, current);
      const empty = current.map((value, position) => (value.trim() ? -1 : position)).filter((position) => position >= 0);
      fillByVoice(words.slice(0, empty.length).map((word, order) => [empty[order], word]));
    };
    window.addEventListener(LUMI_VOICE_ANSWERS_EVENT, onVoiceAnswers);
    return () => window.removeEventListener(LUMI_VOICE_ANSWERS_EVENT, onVoiceAnswers);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fillByVoice uses refs/stable setters
  }, [index, wordBank, slots.length]);
  const usedWords = useMemo(() => new Set(answers.map(normalize).filter(Boolean)), [answers]);
  const filledCount = answers.filter((answer) => answer.trim()).length;
  const isSingle = slots.length === 1;
  // Some sheets inline the word box in the statement; show it once, as the bank.
  const statement = question.supportContent && question.statement.includes(question.supportContent)
    ? question.statement.replace(question.supportContent, '').replace(/[\s:–-]+$/, '').trim()
    : question.statement;

  const askLumi = () => {
    const lines = slots
      .map((slot, position) => {
        const answer = answers[position]?.trim();
        if (!answer) return null;
        return isSingle || !slot ? answer : `${slot}) ${answer}`;
      })
      .filter(Boolean);
    const text = [
      `Lumi, fiz a questão ${label}: "${question.statement}".`,
      `Minhas respostas: ${lines.join('; ')}.`,
      'Pode conferir comigo? Se eu errei, me dá uma dica sem contar a resposta.',
    ].join(' ');
    setSendState(sendTextToLumi(text) ? 'sent' : 'offline');
  };

  return (
    <li
      className={`material-question${active && slots.length > 0 ? ' is-active' : ''}`}
      onPointerDown={onActivate}
      onFocusCapture={onActivate}
    >
      <span className="material-question-number">{label}</span>
      {active && slots.length > 0 && (
        <span className="material-question-listening"><Mic size={13} />Respondendo agora</span>
      )}
      <div className="material-question-content">
        <p className="material-question-statement">{statement}</p>

        {question.supportContent && (wordBank ? (
          <ul className="material-word-bank" aria-label="Palavras da questão">
            {wordBank.map((word, position) => (
              <li key={`${word}-${position}`} className={usedWords.has(normalize(word)) ? 'is-used' : ''}>{word}</li>
            ))}
          </ul>
        ) : (
          <p className="material-support-text">{question.supportContent}</p>
        ))}

        {slots.length > 0 && (
          <div className="material-answers">
            <div className={`material-answer-grid${isSingle ? ' is-single' : ''}`}>
              {slots.map((slot, position) => (
                <label
                  key={`${slot}-${position}`}
                  className={`material-answer${filledByVoice.includes(position) ? ' is-filled-by-lumi' : ''}`}
                >
                  {slot && !isSingle && <span>{slot}</span>}
                  <input
                    value={answers[position] ?? ''}
                    onChange={(event) => updateAnswer(position, event.target.value)}
                    placeholder={isSingle ? 'Escreva sua resposta' : ''}
                    aria-label={`Resposta ${slot || position + 1} da questão ${label}`}
                    autoComplete="off"
                    autoCapitalize="off"
                    spellCheck={false}
                  />
                </label>
              ))}
            </div>
            <div className="material-answer-actions">
              <button type="button" className="material-ask-lumi" disabled={filledCount === 0} onClick={askLumi}>
                <MessageCircleQuestion size={18} />Pedir para o Lumi conferir
              </button>
              {filledCount > 0 && (
                <button type="button" className="material-clear-answers" onClick={clearAnswers} aria-label={`Limpar respostas da questão ${label}`}>
                  <Eraser size={16} />
                </button>
              )}
              {!isSingle && <small className="material-answer-progress">{filledCount}/{slots.length}</small>}
            </div>
            {sendState === 'sent' && <p className="material-answer-feedback" role="status">Enviado! Escute o que o Lumi vai dizer.</p>}
            {sendState === 'offline' && <p className="material-answer-feedback is-warning" role="status">O Lumi ainda está chegando. Tente de novo em instantes.</p>}
          </div>
        )}
      </div>
    </li>
  );
}
