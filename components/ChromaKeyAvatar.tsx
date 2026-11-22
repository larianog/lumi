'use client';

import { RemoteUser, type IAgoraRTCRemoteUser } from 'agora-rtc-react';
import { useEffect, useRef, useState } from 'react';

/**
 * LemonSlice renders the avatar on the solid background of its reference image
 * (lime green or, for the current Lumi, a pastel mint) and Agora video has no
 * alpha channel, so the background is keyed out in the browser. `RemoteUser`
 * keeps owning subscription and audio playback; its <video> is hidden and
 * redrawn through a WebGL chroma-key pass. The key colour is sampled from the
 * top corners, so it follows whatever background the avatar actually uses.
 */

const VERTEX_SHADER = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = vec2((a_position.x + 1.0) / 2.0, 1.0 - (a_position.y + 1.0) / 2.0);
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAGMENT_SHADER = `
precision mediump float;
uniform sampler2D u_frame;
uniform vec3 u_key;
uniform float u_similarity;
uniform float u_smoothness;
uniform float u_spill;
varying vec2 v_uv;

vec2 chroma(vec3 rgb) {
  return vec2(
    -0.168736 * rgb.r - 0.331264 * rgb.g + 0.5 * rgb.b,
    0.5 * rgb.r - 0.418688 * rgb.g - 0.081312 * rgb.b
  );
}

void main() {
  vec4 color = texture2D(u_frame, v_uv);
  float distance = length(chroma(color.rgb) - chroma(u_key));
  float alpha = smoothstep(u_similarity, u_similarity + u_smoothness, distance);
  // Remove the green fringe left on edges (hair, fur, outline).
  float spill = clamp(color.g - max(color.r, color.b), 0.0, 1.0);
  vec3 rgb = color.rgb - vec3(0.0, spill * u_spill, 0.0);
  gl_FragColor = vec4(rgb * alpha, alpha);
}`;

export type ChromaKeying = { similarity: number; smoothness: number };

type Renderer = {
  draw: (video: HTMLVideoElement, key: [number, number, number]) => void;
  dispose: () => void;
};

function createRenderer(canvas: HTMLCanvasElement, keying: ChromaKeying): Renderer | null {
  const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true });
  if (!gl) return null;

  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
  };
  const vertex = compile(gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragment = compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  const keyLocation = gl.getUniformLocation(program, 'u_key');
  // Per-avatar thresholds (lib/lumi-avatars.ts), measured on real frames.
  gl.uniform1f(gl.getUniformLocation(program, 'u_similarity'), keying.similarity);
  gl.uniform1f(gl.getUniformLocation(program, 'u_smoothness'), keying.smoothness);
  gl.uniform1f(gl.getUniformLocation(program, 'u_spill'), 0.5);

  return {
    draw(video, key) {
      const width = video.videoWidth;
      const height = video.videoHeight;
      if (!width || !height) return;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);
      gl.uniform3f(keyLocation, key[0], key[1], key[2]);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    dispose() {
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    },
  };
}

/** Averages the two top corners of the frame, where the background always shows. */
function sampleKeyColor(video: HTMLVideoElement, sampler: CanvasRenderingContext2D): [number, number, number] | null {
  const width = video.videoWidth;
  const height = video.videoHeight;
  if (!width || !height) return null;
  const patch = Math.max(4, Math.round(Math.min(width, height) * 0.03));
  sampler.canvas.width = patch * 2;
  sampler.canvas.height = patch;
  sampler.drawImage(video, 0, 0, patch, patch, 0, 0, patch, patch);
  sampler.drawImage(video, width - patch, 0, patch, patch, patch, 0, patch, patch);
  const { data } = sampler.getImageData(0, 0, patch * 2, patch);
  const average = (fromColumn: number) => {
    const sum = [0, 0, 0];
    let count = 0;
    for (let row = 0; row < patch; row += 1) {
      for (let column = fromColumn; column < fromColumn + patch; column += 1) {
        const index = (row * patch * 2 + column) * 4;
        sum[0] += data[index];
        sum[1] += data[index + 1];
        sum[2] += data[index + 2];
        count += 1;
      }
    }
    return sum.map((value) => value / count / 255) as [number, number, number];
  };
  const left = average(0);
  const right = average(patch);
  // Both corners must agree, otherwise something (an arm, an antenna) is in the way.
  if (left.some((value, channel) => Math.abs(value - right[channel]) > 0.08)) return null;
  return [(left[0] + right[0]) / 2, (left[1] + right[1]) / 2, (left[2] + right[2]) / 2];
}

export default function ChromaKeyAvatar({ user, keying, fit = 'cover' }: { user: IAgoraRTCRemoteUser; keying: ChromaKeying; fit?: 'cover' | 'contain' }) {
  const sourceRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [keyed, setKeyed] = useState(true);
  const { similarity, smoothness } = keying;

  useEffect(() => {
    const canvas = canvasRef.current;
    const source = sourceRef.current;
    if (!canvas || !source) return;
    const renderer = createRenderer(canvas, { similarity, smoothness });
    const sampler = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
    if (!renderer || !sampler) {
      // No WebGL: show the raw video (green background) rather than nothing.
      setKeyed(false);
      return;
    }

    let key: [number, number, number] | null = null;
    let lastSample = 0;
    let frame = 0;
    const render = (now: number) => {
      const video = source.querySelector('video');
      if (video && video.readyState >= 2) {
        if (!key || now - lastSample > 1000) {
          lastSample = now;
          key = sampleKeyColor(video, sampler) ?? key;
        }
        // Draw nothing until the background colour is known, to avoid a flash of it.
        if (key) renderer.draw(video, key);
      }
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frame);
      renderer.dispose();
    };
  }, [similarity, smoothness]);

  return (
    <div className={`chroma-avatar is-${fit}`}>
      <div ref={sourceRef} className={keyed ? 'chroma-avatar-source' : 'chroma-avatar-raw'}>
        <RemoteUser user={user} />
      </div>
      {keyed && <canvas ref={canvasRef} className="chroma-avatar-canvas" aria-hidden="true" />}
    </div>
  );
}
