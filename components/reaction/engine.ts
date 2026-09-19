import { renderFrame, activeClipAt, RenderOptions } from './renderer';
import { Clip, ExportPreset, MediaAsset, Project, TrackKind, projectDuration } from './types';

/**
 * Playback + export engine. Owns two hidden <video> elements (one per track), a WebAudio mixer
 * (so volumes can be routed to the export) and a render loop that paints into a canvas.
 */
export class ReactionEngine {
  readonly videos: Record<TrackKind, HTMLVideoElement>;
  private audioCtx: AudioContext | null = null;
  private gains: Partial<Record<TrackKind, GainNode>> = {};
  private mixDest: MediaStreamAudioDestinationNode | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private project: Project;
  private media: Map<string, MediaAsset> = new Map();
  private renderOpts: RenderOptions = {};
  private loadedSrc: Record<TrackKind, string | null> = { original: null, reaction: null };

  time = 0;
  playing = false;
  private lastTs = 0;
  private raf = 0;
  private exporting = false;

  onTime: ((t: number) => void) | null = null;
  onPlayState: ((playing: boolean) => void) | null = null;

  constructor(project: Project) {
    this.project = project;
    this.videos = { original: this.makeVideo(), reaction: this.makeVideo() };
    this.loop = this.loop.bind(this);
    this.raf = requestAnimationFrame(this.loop);
  }

  private makeVideo() {
    const v = document.createElement('video');
    v.playsInline = true;
    v.preload = 'auto';
    v.crossOrigin = 'anonymous';
    v.muted = false;
    return v;
  }

  attachCanvas(canvas: HTMLCanvasElement | null) {
    this.canvas = canvas;
  }

  setProject(project: Project) {
    this.project = project;
    this.applyAudio();
  }

  setMedia(media: Map<string, MediaAsset>) {
    this.media = media;
  }

  setRenderOptions(opts: RenderOptions) {
    this.renderOpts = opts;
  }

  /** Must be called from a user gesture before audio can be heard. */
  ensureAudio() {
    if (this.audioCtx) {
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume().catch(() => undefined);
      return;
    }
    try {
      const AC: typeof AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AC();
      this.mixDest = this.audioCtx.createMediaStreamDestination();
      (['original', 'reaction'] as TrackKind[]).forEach((track) => {
        const src = this.audioCtx!.createMediaElementSource(this.videos[track]);
        const gain = this.audioCtx!.createGain();
        src.connect(gain);
        gain.connect(this.audioCtx!.destination);
        gain.connect(this.mixDest!);
        this.gains[track] = gain;
      });
      this.applyAudio();
    } catch (e) {
      console.warn('WebAudio unavailable, falling back to element volume', e);
      this.audioCtx = null;
    }
  }

  private applyAudio() {
    (['original', 'reaction'] as TrackKind[]).forEach((track) => {
      const clip = activeClipAt(this.project, track, this.time);
      const vol = clip ? (clip.muted ? 0 : clip.volume) : 0;
      const g = this.gains[track];
      if (g) {
        g.gain.value = vol;
        this.videos[track].volume = 1;
        this.videos[track].muted = false;
      } else {
        this.videos[track].volume = vol;
        this.videos[track].muted = vol === 0;
      }
    });
  }

  seek(t: number) {
    const dur = projectDuration(this.project);
    this.time = Math.max(0, Math.min(t, dur));
    this.syncVideos(true);
    this.onTime?.(this.time);
  }

  play() {
    if (this.playing) return;
    this.ensureAudio();
    const dur = projectDuration(this.project);
    if (dur <= 0) return;
    if (this.time >= dur - 0.01) this.time = 0;
    this.playing = true;
    this.lastTs = performance.now();
    this.onPlayState?.(true);
  }

  pause() {
    if (!this.playing) return;
    this.playing = false;
    (['original', 'reaction'] as TrackKind[]).forEach((k) => this.videos[k].pause());
    this.onPlayState?.(false);
  }

  toggle() {
    if (this.playing) this.pause();
    else this.play();
  }

  private sourceTime(clip: Clip) {
    return clip.trimStart + (this.time - clip.start) * clip.speed;
  }

  private syncVideos(force: boolean) {
    (['original', 'reaction'] as TrackKind[]).forEach((track) => {
      const v = this.videos[track];
      const clip = activeClipAt(this.project, track, this.time);
      if (!clip) {
        if (!v.paused) v.pause();
        return;
      }
      const asset = this.media.get(clip.mediaId);
      if (!asset) return;
      if (this.loadedSrc[track] !== asset.url) {
        v.src = asset.url;
        this.loadedSrc[track] = asset.url;
        v.load();
      }
      const want = this.sourceTime(clip);
      if (Math.abs(v.playbackRate - clip.speed) > 0.001) v.playbackRate = clip.speed;
      const drift = Math.abs(v.currentTime - want);
      if (force || drift > (this.playing ? 0.3 : 0.02)) {
        if (Number.isFinite(want)) v.currentTime = want;
      }
      if (this.playing) {
        if (v.paused) v.play().catch(() => undefined);
      } else if (!v.paused) {
        v.pause();
      }
    });
    this.applyAudio();
  }

  private loop(ts: number) {
    if (this.playing) {
      const dt = (ts - this.lastTs) / 1000;
      this.lastTs = ts;
      this.time += dt;
      const dur = projectDuration(this.project);
      if (this.time >= dur) {
        this.time = dur;
        this.pause();
        this.onExportEnd?.();
      }
      this.syncVideos(false);
      this.onTime?.(this.time);
    }
    if (this.canvas) {
      const ctx = this.canvas.getContext('2d');
      if (ctx) {
        renderFrame(ctx, this.project, this.time, this.videos, this.exporting ? { showPlaceholders: false, rtlCaptions: this.renderOpts.rtlCaptions } : this.renderOpts);
      }
    }
    this.raf = requestAnimationFrame(this.loop);
  }

  private onExportEnd: (() => void) | null = null;

  /**
   * Real-time export: plays the whole timeline once while recording the canvas + mixed audio.
   */
  async exportVideo(preset: ExportPreset, onProgress: (ratio: number) => void): Promise<{ blob: Blob; ext: string; mime: string }> {
    if (!this.canvas) throw new Error('Preview canvas not ready.');
    const dur = projectDuration(this.project);
    if (dur <= 0) throw new Error('Add at least one video before exporting.');
    this.ensureAudio();
    this.pause();

    const canvas = this.canvas;
    const prevW = canvas.width;
    const prevH = canvas.height;
    const prevProject = this.project;
    canvas.width = preset.width;
    canvas.height = preset.height;
    this.project = { ...prevProject, canvasWidth: preset.width, canvasHeight: preset.height };

    const videoStream = canvas.captureStream(preset.fps);
    const tracks: MediaStreamTrack[] = [...videoStream.getVideoTracks()];
    if (this.mixDest) tracks.push(...this.mixDest.stream.getAudioTracks());
    const stream = new MediaStream(tracks);

    const candidates = [
      { mime: 'video/mp4;codecs=avc1.42E01E,mp4a.40.2', ext: 'mp4' },
      { mime: 'video/mp4;codecs=avc1,mp4a.40.2', ext: 'mp4' },
      { mime: 'video/mp4', ext: 'mp4' },
      { mime: 'video/webm;codecs=vp9,opus', ext: 'webm' },
      { mime: 'video/webm;codecs=vp8,opus', ext: 'webm' },
      { mime: 'video/webm', ext: 'webm' },
    ];
    const chosen = candidates.find((c) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(c.mime));
    if (!chosen) throw new Error('This browser cannot record video. Please use Chrome, Edge or Safari.');

    const recorder = new MediaRecorder(stream, {
      mimeType: chosen.mime,
      videoBitsPerSecond: preset.bitrateMbps * 1_000_000,
      audioBitsPerSecond: 192_000,
    });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);

    // mute speakers during export but keep the mix stream alive
    const gainBackup: Partial<Record<TrackKind, GainNode>> = {};
    const silence: GainNode[] = [];
    if (this.audioCtx) {
      (['original', 'reaction'] as TrackKind[]).forEach((k) => {
        const g = this.gains[k];
        if (!g) return;
        gainBackup[k] = g;
        try {
          g.disconnect(this.audioCtx!.destination);
        } catch {
          /* ignore */
        }
      });
    }

    this.exporting = true;
    this.time = 0;
    this.syncVideos(true);
    // wait for both videos to be seekable / have data
    await Promise.all(
      (['original', 'reaction'] as TrackKind[]).map(
        (k) =>
          new Promise<void>((res) => {
            const v = this.videos[k];
            if (!this.loadedSrc[k] || v.readyState >= 2) return res();
            const done = () => {
              v.removeEventListener('loadeddata', done);
              res();
            };
            v.addEventListener('loadeddata', done);
            setTimeout(res, 3000);
          }),
      ),
    );

    const result = await new Promise<Blob>((resolve, reject) => {
      recorder.onerror = () => reject(new Error('Recording failed.'));
      recorder.onstop = () => resolve(new Blob(chunks, { type: chosen.mime.split(';')[0] }));
      const tick = () => {
        if (!this.exporting) return;
        onProgress(Math.min(1, this.time / dur));
        setTimeout(tick, 200);
      };
      this.onExportEnd = () => {
        this.onExportEnd = null;
        setTimeout(() => recorder.state !== 'inactive' && recorder.stop(), 250);
      };
      recorder.start(500);
      this.playing = true;
      this.lastTs = performance.now();
      this.onPlayState?.(true);
      tick();
    }).finally(() => {
      this.exporting = false;
      this.playing = false;
      this.onPlayState?.(false);
      this.onExportEnd = null;
      stream.getTracks().forEach((t) => t.stop());
      if (this.audioCtx) {
        Object.values(gainBackup).forEach((g) => g && g.connect(this.audioCtx!.destination));
      }
      canvas.width = prevW;
      canvas.height = prevH;
      this.project = prevProject;
      this.seek(0);
    });
    onProgress(1);
    return { blob: result, ext: chosen.ext, mime: chosen.mime };
  }

  cancelExport() {
    if (!this.exporting) return;
    this.time = projectDuration(this.project);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.pause();
    (['original', 'reaction'] as TrackKind[]).forEach((k) => {
      this.videos[k].removeAttribute('src');
      this.videos[k].load();
    });
    this.audioCtx?.close().catch(() => undefined);
  }
}

/** Loads a Blob/File as a MediaAsset (handles WebM recordings with unknown duration). */
export const loadMediaAsset = (file: Blob, name: string): Promise<MediaAsset> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.muted = true;
    v.src = url;
    const finish = () => {
      resolve({
        id: Math.random().toString(36).slice(2, 10),
        name,
        url,
        file,
        duration: v.duration,
        width: v.videoWidth,
        height: v.videoHeight,
      });
      v.removeAttribute('src');
    };
    v.onloadedmetadata = () => {
      if (!Number.isFinite(v.duration) || v.duration === 0) {
        // Chrome MediaRecorder WebM quirk: seek far to force duration calculation
        v.currentTime = 1e6;
        v.ondurationchange = () => {
          if (Number.isFinite(v.duration) && v.duration > 0) {
            v.ondurationchange = null;
            v.currentTime = 0;
            finish();
          }
        };
        setTimeout(() => {
          if (!Number.isFinite(v.duration)) reject(new Error('Could not read video duration.'));
        }, 8000);
      } else {
        finish();
      }
    };
    v.onerror = () => reject(new Error(`Could not load "${name}". Please use MP4, WebM or MOV.`));
  });
