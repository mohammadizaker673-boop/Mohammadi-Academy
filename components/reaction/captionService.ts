import { CAPTION_LANGUAGES, Caption, CaptionLanguage, uid } from './types';

/**
 * Auto-caption pipeline.
 *  1. OpenAI Whisper (VITE_OPENAI_API_KEY) – best quality, word timestamps.
 *  2. Google Gemini (GEMINI_API_KEY)       – good quality, sentence timestamps.
 *  3. Browser SpeechRecognition             – free fallback, listens through the mic while
 *                                             the reaction audio plays (or during recording).
 */

const getOpenAIKey = (): string => (import.meta.env as Record<string, string | undefined>).VITE_OPENAI_API_KEY?.trim() || '';
const getGeminiKey = (): string => {
  try {
    return (process.env.GEMINI_API_KEY || '').trim();
  } catch {
    return '';
  }
};

export type CaptionEngine = 'whisper' | 'gemini' | 'browser';

export const availableEngines = (): CaptionEngine[] => {
  const engines: CaptionEngine[] = [];
  if (getOpenAIKey()) engines.push('whisper');
  if (getGeminiKey()) engines.push('gemini');
  if (typeof window !== 'undefined' && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) {
    engines.push('browser');
  }
  return engines;
};

export const languageMeta = (lang: CaptionLanguage) => CAPTION_LANGUAGES.find((l) => l.id === lang) || CAPTION_LANGUAGES[0];

/* ---------- Audio extraction ---------- */

const encodeWav = (buffer: AudioBuffer): Blob => {
  const channels = 1;
  const sampleRate = buffer.sampleRate;
  const samples = buffer.getChannelData(0);
  const dataLength = samples.length * 2;
  const arr = new ArrayBuffer(44 + dataLength);
  const view = new DataView(arr);
  const writeStr = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
  };
  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * channels * 2, true);
  view.setUint16(32, channels * 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, dataLength, true);
  let off = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    off += 2;
  }
  return new Blob([arr], { type: 'audio/wav' });
};

/** Extracts a mono 16 kHz WAV of [from, to] seconds from a video/audio blob. */
export const extractAudio = async (media: Blob, from: number, to: number): Promise<Blob> => {
  const arrayBuffer = await media.arrayBuffer();
  const AC: typeof AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
  const probe = new AC();
  let decoded: AudioBuffer;
  try {
    decoded = await probe.decodeAudioData(arrayBuffer.slice(0));
  } finally {
    probe.close().catch(() => undefined);
  }
  const start = Math.max(0, Math.min(from, decoded.duration));
  const end = Math.max(start + 0.1, Math.min(to, decoded.duration));
  const targetRate = 16000;
  const length = Math.ceil((end - start) * targetRate);
  const offline = new OfflineAudioContext(1, length, targetRate);
  const src = offline.createBufferSource();
  src.buffer = decoded;
  src.connect(offline.destination);
  src.start(0, start, end - start);
  const rendered = await offline.startRendering();
  return encodeWav(rendered);
};

/* ---------- Segment helpers ---------- */

interface RawSegment {
  start: number;
  end: number;
  text: string;
}

/** Splits long segments so every caption is short and readable. */
const normaliseSegments = (segments: RawSegment[], offset: number, maxChars = 42): Caption[] => {
  const out: Caption[] = [];
  for (const seg of segments) {
    const text = seg.text.trim();
    if (!text) continue;
    const dur = Math.max(0.4, seg.end - seg.start);
    if (text.length <= maxChars) {
      out.push({ id: uid(), start: offset + seg.start, end: offset + seg.start + dur, text });
      continue;
    }
    const words = text.split(/\s+/);
    const chunks: string[] = [];
    let cur = '';
    for (const w of words) {
      if ((cur + ' ' + w).trim().length > maxChars && cur) {
        chunks.push(cur);
        cur = w;
      } else {
        cur = (cur + ' ' + w).trim();
      }
    }
    if (cur) chunks.push(cur);
    const totalChars = chunks.reduce((n, c) => n + c.length, 0) || 1;
    let t = seg.start;
    for (const c of chunks) {
      const d = (c.length / totalChars) * dur;
      out.push({ id: uid(), start: offset + t, end: offset + t + d, text: c });
      t += d;
    }
  }
  return out.sort((a, b) => a.start - b.start);
};

/* ---------- Engines ---------- */

const transcribeWhisper = async (audio: Blob, lang: CaptionLanguage): Promise<RawSegment[]> => {
  const form = new FormData();
  form.append('file', audio, 'reaction.wav');
  form.append('model', 'whisper-1');
  form.append('language', languageMeta(lang).whisper);
  form.append('response_format', 'verbose_json');
  form.append('timestamp_granularities[]', 'segment');
  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${getOpenAIKey()}` },
    body: form,
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error?.message || `Whisper request failed (${res.status})`);
  const segments: RawSegment[] = (json?.segments || []).map((s: any) => ({ start: s.start, end: s.end, text: s.text }));
  if (!segments.length && json?.text) segments.push({ start: 0, end: 5, text: json.text });
  return segments;
};

const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1] || '');
    r.onerror = reject;
    r.readAsDataURL(blob);
  });

const transcribeGemini = async (audio: Blob, lang: CaptionLanguage, durationSec: number): Promise<RawSegment[]> => {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey: getGeminiKey() });
  const meta = languageMeta(lang);
  const prompt =
    `Transcribe this ${meta.label} (${meta.native}) speech. The audio is ${durationSec.toFixed(1)} seconds long. ` +
    `Return ONLY a JSON array of objects {"start": seconds, "end": seconds, "text": "..."} with short phrases (max 8 words each), ` +
    `in the original language. No commentary.`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }, { inlineData: { mimeType: 'audio/wav', data: await blobToBase64(audio) } }],
      },
    ],
  });
  const text = (response.text || '').replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  const first = text.indexOf('[');
  const last = text.lastIndexOf(']');
  const arr = JSON.parse(text.slice(first, last + 1));
  return (arr as any[]).map((s) => ({ start: Number(s.start) || 0, end: Number(s.end) || 0, text: String(s.text || '') }));
};

/**
 * Browser fallback: plays the reaction media out loud and listens with the mic via SpeechRecognition.
 * The user must keep the tab audible. Resolves when playback ends.
 */
const transcribeBrowser = (
  mediaUrl: string,
  from: number,
  to: number,
  lang: CaptionLanguage,
  onProgress?: (ratio: number) => void,
): Promise<RawSegment[]> =>
  new Promise((resolve, reject) => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      reject(new Error('Speech recognition is not supported in this browser.'));
      return;
    }
    const rec = new SR();
    rec.lang = languageMeta(lang).speech;
    rec.continuous = true;
    rec.interimResults = true;
    const media = document.createElement('video');
    media.src = mediaUrl;
    media.currentTime = from;
    media.volume = 1;
    const segments: RawSegment[] = [];
    let segStart = 0;
    let started = false;

    rec.onresult = (e: any) => {
      const t = media.currentTime - from;
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) {
          segments.push({ start: segStart, end: t, text: r[0].transcript });
          segStart = t;
        }
      }
    };
    rec.onerror = (e: any) => {
      if (e.error === 'not-allowed') {
        media.pause();
        reject(new Error('Microphone access was denied.'));
      }
    };
    rec.onend = () => {
      if (started && !media.ended && !media.paused) {
        try {
          rec.start();
        } catch {
          /* ignore */
        }
      }
    };
    const finish = () => {
      started = false;
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
      media.pause();
      resolve(segments);
    };
    media.ontimeupdate = () => {
      onProgress?.((media.currentTime - from) / Math.max(0.1, to - from));
      if (media.currentTime >= to) finish();
    };
    media.onended = finish;
    media.onerror = () => reject(new Error('Could not play the reaction video.'));
    media
      .play()
      .then(() => {
        started = true;
        rec.start();
      })
      .catch(reject);
  });

export interface TranscribeParams {
  media: Blob;
  mediaUrl: string;
  /** trim window in source seconds */
  from: number;
  to: number;
  /** timeline offset (seconds) where `from` sits */
  timelineOffset: number;
  /** playback speed applied to the clip */
  speed: number;
  language: CaptionLanguage;
  engine?: CaptionEngine;
  onStatus?: (message: string, ratio?: number) => void;
}

export const generateCaptions = async (p: TranscribeParams): Promise<{ captions: Caption[]; engine: CaptionEngine }> => {
  const engines = availableEngines();
  const engine = p.engine && engines.includes(p.engine) ? p.engine : engines[0];
  if (!engine) {
    throw new Error('No caption engine available. Add VITE_OPENAI_API_KEY or GEMINI_API_KEY, or use a browser with speech recognition (Chrome).');
  }
  let raw: RawSegment[] = [];
  if (engine === 'browser') {
    p.onStatus?.('Listening to the reaction audio… keep this tab audible.', 0);
    raw = await transcribeBrowser(p.mediaUrl, p.from, p.to, p.language, (r) => p.onStatus?.('Listening…', r));
  } else {
    p.onStatus?.('Extracting reaction audio…', 0.1);
    const audio = await extractAudio(p.media, p.from, p.to);
    p.onStatus?.(engine === 'whisper' ? 'Transcribing with Whisper…' : 'Transcribing with Gemini…', 0.4);
    raw = engine === 'whisper' ? await transcribeWhisper(audio, p.language) : await transcribeGemini(audio, p.language, p.to - p.from);
  }
  // convert source seconds -> timeline seconds (respect speed & clip start)
  const scaled = raw.map((s) => ({ start: s.start / p.speed, end: s.end / p.speed, text: s.text }));
  const captions = normaliseSegments(scaled, p.timelineOffset);
  p.onStatus?.('Done', 1);
  return { captions, engine };
};
