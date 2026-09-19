// Reaction Video editor – shared types

export type TrackKind = 'original' | 'reaction';

export type ReactionShape = 'rectangle' | 'rounded' | 'circle';

export type LayoutId = 'side-by-side' | 'top-bottom' | 'pip' | 'circle';

export interface MediaAsset {
  id: string;
  name: string;
  url: string; // object URL
  file: Blob;
  duration: number; // seconds
  width: number;
  height: number;
}

/** Normalised box (0..1 of canvas width / height). */
export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Crop expressed as fractions removed from each side of the source video (0..0.9). */
export interface Crop {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface Clip {
  id: string;
  track: TrackKind;
  mediaId: string;
  /** Position of the clip on the timeline (seconds). */
  start: number;
  /** Trim inside the source media (seconds). */
  trimStart: number;
  trimEnd: number;
  speed: number; // 0.25 .. 4
  volume: number; // 0 .. 1
  muted: boolean;
}

export interface TrackStyle {
  box: Box;
  crop: Crop;
  shape: ReactionShape;
  borderWidth: number; // canvas px
  borderColor: string;
  cornerRadius: number; // canvas px, for 'rounded'
}

export interface TextOverlay {
  id: string;
  text: string;
  x: number; // 0..1 (centre)
  y: number; // 0..1 (centre)
  size: number; // canvas px
  color: string;
  background: boolean;
  start: number; // timeline seconds
  end: number;
}

export interface Caption {
  id: string;
  /** Times are timeline seconds (already synced to the reaction clip). */
  start: number;
  end: number;
  text: string;
}

export type CaptionLanguage = 'en' | 'fa' | 'prs' | 'ar' | 'ur';

export interface CaptionStyle {
  size: number;
  color: string;
  background: boolean;
  y: number; // 0..1 (centre)
}

export interface Project {
  canvasWidth: number;
  canvasHeight: number;
  background: string;
  layout: LayoutId;
  clips: Clip[];
  styles: Record<TrackKind, TrackStyle>;
  texts: TextOverlay[];
  captions: Caption[];
  captionStyle: CaptionStyle;
  captionLanguage: CaptionLanguage;
}

export type Selection =
  | { type: 'clip'; id: string }
  | { type: 'text'; id: string }
  | { type: 'caption'; id: string }
  | null;

export interface ExportPreset {
  id: string;
  label: string;
  width: number;
  height: number;
  fps: number;
  bitrateMbps: number;
}

export const EXPORT_PRESETS: ExportPreset[] = [
  { id: 'tiktok', label: 'TikTok', width: 1080, height: 1920, fps: 30, bitrateMbps: 10 },
  { id: 'reels', label: 'Instagram Reels', width: 1080, height: 1920, fps: 30, bitrateMbps: 10 },
  { id: 'shorts', label: 'YouTube Shorts', width: 1080, height: 1920, fps: 30, bitrateMbps: 12 },
  { id: 'fb-reels', label: 'Facebook Reels', width: 1080, height: 1920, fps: 30, bitrateMbps: 8 },
];

export const CAPTION_LANGUAGES: { id: CaptionLanguage; label: string; native: string; whisper: string; speech: string; rtl: boolean }[] = [
  { id: 'en', label: 'English', native: 'English', whisper: 'en', speech: 'en-US', rtl: false },
  { id: 'fa', label: 'Persian', native: 'فارسی', whisper: 'fa', speech: 'fa-IR', rtl: true },
  { id: 'prs', label: 'Dari', native: 'دری', whisper: 'fa', speech: 'fa-AF', rtl: true },
  { id: 'ar', label: 'Arabic', native: 'العربية', whisper: 'ar', speech: 'ar-SA', rtl: true },
  { id: 'ur', label: 'Urdu', native: 'اردو', whisper: 'ur', speech: 'ur-PK', rtl: true },
];

export const uid = (): string => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export const clipDuration = (clip: Clip): number => Math.max(0, (clip.trimEnd - clip.trimStart) / clip.speed);
export const clipEnd = (clip: Clip): number => clip.start + clipDuration(clip);

export const projectDuration = (project: Project): number =>
  project.clips.reduce((max, c) => Math.max(max, clipEnd(c)), 0);

export const defaultCrop = (): Crop => ({ left: 0, top: 0, right: 0, bottom: 0 });

export const LAYOUT_PRESETS: Record<LayoutId, { label: string; hint: string; original: Box; reaction: Box; shape: ReactionShape }> = {
  'side-by-side': {
    label: 'Side by Side',
    hint: 'Original left · Reaction right',
    original: { x: 0, y: 0.25, w: 0.5, h: 0.5 },
    reaction: { x: 0.5, y: 0.25, w: 0.5, h: 0.5 },
    shape: 'rectangle',
  },
  'top-bottom': {
    label: 'Top & Bottom',
    hint: 'Original top · Reaction bottom',
    original: { x: 0, y: 0, w: 1, h: 0.5 },
    reaction: { x: 0, y: 0.5, w: 1, h: 0.5 },
    shape: 'rectangle',
  },
  pip: {
    label: 'Picture in Picture',
    hint: 'Original full · Reaction small window',
    original: { x: 0, y: 0, w: 1, h: 1 },
    reaction: { x: 0.6, y: 0.7, w: 0.35, h: 0.2 },
    shape: 'rounded',
  },
  circle: {
    label: 'Circle Reaction',
    hint: 'Original full · Reaction in a circle',
    original: { x: 0, y: 0, w: 1, h: 1 },
    reaction: { x: 0.62, y: 0.72, w: 0.33, h: 0.33 * (1080 / 1920) },
    shape: 'circle',
  },
};

export const createDefaultProject = (): Project => ({
  canvasWidth: 1080,
  canvasHeight: 1920,
  background: '#000000',
  layout: 'top-bottom',
  clips: [],
  styles: {
    original: {
      box: LAYOUT_PRESETS['top-bottom'].original,
      crop: defaultCrop(),
      shape: 'rectangle',
      borderWidth: 0,
      borderColor: '#ffffff',
      cornerRadius: 0,
    },
    reaction: {
      box: LAYOUT_PRESETS['top-bottom'].reaction,
      crop: defaultCrop(),
      shape: 'rectangle',
      borderWidth: 0,
      borderColor: '#ffffff',
      cornerRadius: 40,
    },
  },
  texts: [],
  captions: [],
  captionStyle: { size: 56, color: '#ffffff', background: true, y: 0.86 },
  captionLanguage: 'en',
});
