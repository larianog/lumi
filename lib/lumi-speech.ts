export type LumiSpeechState = 'idle' | 'listening' | 'speaking';

export type LumiSpeechSample = {
  connected: boolean;
  microphoneEnabled: boolean;
  agentAudible: boolean;
  microphoneLevel: number;
  agentLevel: number;
};

// Short attack/release windows avoid switching poses on clicks or between syllables.
// These are audio-level heuristics, not a speech recognition model.
export class LumiSpeechDetector {
  private userCandidate: number | null = null;
  private lastUserSpeech = -Infinity;
  private lastAgentSpeech = -Infinity;

  sample(input: LumiSpeechSample, now: number): LumiSpeechState {
    if (!input.connected) {
      this.userCandidate = null;
      this.lastUserSpeech = this.lastAgentSpeech = -Infinity;
      return 'idle';
    }

    if (input.microphoneEnabled && input.microphoneLevel >= 0.1) {
      this.userCandidate ??= now;
      if (now - this.userCandidate >= 80) this.lastUserSpeech = now;
    } else {
      this.userCandidate = null;
      if (!input.microphoneEnabled) this.lastUserSpeech = -Infinity;
    }

    if (!input.agentAudible) this.lastAgentSpeech = -Infinity;
    else if (input.agentLevel >= 0.03) this.lastAgentSpeech = now;

    // Audible agent speech wins overlap, including microphone pickup of its voice.
    if (now - this.lastAgentSpeech < 220) return 'speaking';
    if (now - this.lastUserSpeech < 280) return 'listening';
    return 'idle';
  }
}
