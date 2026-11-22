import { MiniMaxTTS } from 'agora-agents';

/** Keep the existing voice, with Portuguese selected from the first utterance. */
export class LumiTTS extends MiniMaxTTS {
  constructor() {
    super({ model: 'speech_2_6_turbo', voiceId: 'English_captivating_female1' });
  }

  override toConfig() {
    const config = super.toConfig();
    if (config.vendor !== 'minimax') throw new Error('Lumi requires MiniMax TTS');
    // The SDK constructor omits language_boost. Agora forwards this documented
    // MiniMax option; preserve the SDK's managed-model metadata and voice settings.
    return { ...config, params: { ...config.params, language_boost: 'Portuguese' } };
  }
}
