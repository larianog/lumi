import { TurnStatus } from 'agora-agent-client-toolkit';
import { messages } from '@/packages/i18n';

type TutorTurn = { uid: string; turn_id: number; text: string; status: TurnStatus };
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, ' ');

/** Recognizes a reserved tutor verdict; does not independently grade answers. */
class LumiTutorConfirmationDetector {
  private readonly seen = new Set<number>();
  private readonly confirmation: string;

  constructor(confirmation: string) { this.confirmation = normalize(confirmation); }

  observe(turns: readonly TutorTurn[], agentUid: string, localUid: string, enabled: boolean): string | null {
    let userAnswered = false;
    let event: string | null = null;
    for (const turn of turns) {
      if (turn.uid === localUid && turn.status === TurnStatus.END && turn.text.trim()) userAnswered = true;
      if (turn.uid !== agentUid || turn.status === TurnStatus.IN_PROGRESS || this.seen.has(turn.turn_id)) continue;
      this.seen.add(turn.turn_id);
      // Interrupted, replayed, disabled-context and generic praise turns cannot fire.
      if (enabled && userAnswered && turn.status === TurnStatus.END
        && normalize(turn.text).startsWith(this.confirmation)) event = `${agentUid}:${turn.turn_id}`;
    }
    return event;
  }
}

/** Per-question success is a visual cue only, never whole-material completion. */
export class LumiAnswerCelebrationDetector extends LumiTutorConfirmationDetector {
  constructor() { super(messages.voice.correctAnswerConfirmation); }
}

/** Whole-material success has a separate phrase and must follow a user answer. */
export class LumiMaterialCompletionDetector extends LumiTutorConfirmationDetector {
  constructor() { super(messages.voice.materialCompletionConfirmation); }
}
