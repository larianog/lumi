'use client';

import { useEffect, useState } from 'react';
import { LumiSpeechDetector, type LumiSpeechState } from '@/lib/lumi-speech';

type AudioLevelTrack = { getVolumeLevel(): number };

type Props = {
  enabled: boolean;
  connected: boolean;
  microphoneEnabled: boolean;
  agentAudioEnabled: boolean;
  microphone: AudioLevelTrack | null;
  agent: { audioTrack?: AudioLevelTrack & { isPlaying: boolean } } | undefined;
};

export function useLumiSpeechState({ enabled, connected, microphoneEnabled, agentAudioEnabled, microphone, agent }: Props): LumiSpeechState {
  const [state, setState] = useState<LumiSpeechState>('idle');
  useEffect(() => {
    if (!enabled || !connected) { setState('idle'); return; }
    const detector = new LumiSpeechDetector();
    const level = (track: AudioLevelTrack | null | undefined) => {
      try { return track?.getVolumeLevel() ?? 0; } catch { return 0; }
    };
    const sample = () => {
      // Read the current track each time: subscription can complete after user-joined.
      const remoteTrack = agent?.audioTrack;
      setState(detector.sample({
        connected,
        microphoneEnabled: microphoneEnabled && Boolean(microphone),
        agentAudible: agentAudioEnabled && Boolean(remoteTrack?.isPlaying),
        microphoneLevel: microphoneEnabled ? level(microphone) : 0,
        agentLevel: level(remoteTrack),
      }, performance.now()));
    };
    sample();
    const timer = window.setInterval(sample, 80);
    return () => window.clearInterval(timer);
  }, [enabled, connected, microphoneEnabled, agentAudioEnabled, microphone, agent]);
  return enabled && connected ? state : 'idle';
}
