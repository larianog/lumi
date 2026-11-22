'use client';

import { useEffect, useRef, useState } from 'react';
import type { IMicrophoneAudioTrack, IRemoteAudioTrack } from 'agora-rtc-react';
import type { RecordingTurn } from '@/types/database';

export type SessionRecordingContext = {
  profileId: string;
  materialId?: string;
  title: string;
};

type SessionRecorderOptions = {
  /** When undefined, nothing is recorded (e.g. adult or demo-less contexts). */
  context?: SessionRecordingContext;
  micTrack: IMicrophoneAudioTrack | null;
  remoteAudioTracks: IRemoteAudioTrack[];
  /** Read at the end of the session, so it should return the latest transcript. */
  getTranscript: () => RecordingTurn[];
};

/** Shorter sessions (accidental opens) are not uploaded. */
const MIN_DURATION_MS = 3000;

function pickMimeType() {
  if (typeof MediaRecorder === 'undefined') return null;
  return ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']
    .find((type) => MediaRecorder.isTypeSupported(type)) ?? null;
}

/**
 * Records the conversation (child's mic + Lumi's voice) in the browser and
 * uploads it to `/api/recordings` when the session ends (unmount). Tracks are
 * only read, never stopped: the Agora hooks own their lifecycle.
 */
export function useSessionRecorder({ context, micTrack, remoteAudioTracks, getTranscript }: SessionRecorderOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const destinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const remoteSourcesRef = useRef(new Map<string, { source: MediaStreamAudioSourceNode; element: HTMLAudioElement }>());
  const getTranscriptRef = useRef(getTranscript);
  useEffect(() => {
    getTranscriptRef.current = getTranscript;
  }, [getTranscript]);

  const contextKey = context ? `${context.profileId}:${context.materialId ?? ''}` : '';

  // Start once the mic exists; finish and upload on unmount.
  useEffect(() => {
    if (!context || !micTrack) return;
    const mimeType = pickMimeType();
    const AudioContextClass = window.AudioContext
      ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!mimeType || !AudioContextClass) return;

    const audioContext = new AudioContextClass();
    const destination = audioContext.createMediaStreamDestination();
    audioContextRef.current = audioContext;
    destinationRef.current = destination;
    const micSource = audioContext.createMediaStreamSource(new MediaStream([micTrack.getMediaStreamTrack()]));
    micSource.connect(destination);

    // Browsers may start the context suspended until the user interacts.
    const resume = () => void audioContext.resume().catch(() => {});
    resume();
    window.addEventListener('pointerdown', resume);

    const chunks: Blob[] = [];
    const recorder = new MediaRecorder(destination.stream, { mimeType });
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };
    const startedAt = new Date();
    recorder.start(1000);
    setIsRecording(true);

    const uploadContext = context;
    recorder.onstop = () => {
      const durationMs = Date.now() - startedAt.getTime();
      if (durationMs < MIN_DURATION_MS || chunks.length === 0) return;
      const form = new FormData();
      form.set('profileId', uploadContext.profileId);
      if (uploadContext.materialId) form.set('materialId', uploadContext.materialId);
      form.set('title', uploadContext.title);
      form.set('startedAt', startedAt.toISOString());
      form.set('durationMs', String(durationMs));
      form.set('transcript', JSON.stringify(getTranscriptRef.current()));
      form.set('file', new Blob(chunks, { type: mimeType }), 'sessao');
      void fetch('/api/recordings', { method: 'POST', body: form })
        .catch((error) => console.error('Failed to upload session recording:', error));
    };

    const remoteSources = remoteSourcesRef.current;
    return () => {
      window.removeEventListener('pointerdown', resume);
      setIsRecording(false);
      if (recorder.state !== 'inactive') recorder.stop();
      micSource.disconnect();
      remoteSources.forEach(({ source, element }) => {
        source.disconnect();
        element.srcObject = null;
      });
      remoteSources.clear();
      audioContextRef.current = null;
      destinationRef.current = null;
      // Close after the recorder has flushed its last chunk.
      setTimeout(() => void audioContext.close().catch(() => {}), 500);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restart only when the session target or mic changes
  }, [contextKey, micTrack]);

  // Mix in Lumi's (and the avatar's) remote audio as tracks come and go.
  useEffect(() => {
    const audioContext = audioContextRef.current;
    const destination = destinationRef.current;
    if (!audioContext || !destination) return;
    const sources = remoteSourcesRef.current;
    const current = new Set(remoteAudioTracks.map((track) => track.getTrackId()));

    sources.forEach(({ source, element }, trackId) => {
      if (current.has(trackId)) return;
      source.disconnect();
      element.srcObject = null;
      sources.delete(trackId);
    });
    remoteAudioTracks.forEach((track) => {
      const trackId = track.getTrackId();
      if (sources.has(trackId)) return;
      const stream = new MediaStream([track.getMediaStreamTrack()]);
      // Chrome keeps remote WebRTC audio silent in Web Audio unless the stream
      // is also attached to a media element; a muted element is enough.
      const element = new Audio();
      element.muted = true;
      element.srcObject = stream;
      void element.play().catch(() => {});
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(destination);
      sources.set(trackId, { source, element });
    });
  }, [remoteAudioTracks, isRecording]);

  return { isRecording };
}
