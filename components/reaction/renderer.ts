import { Box, Caption, Clip, Project, TextOverlay, TrackKind, TrackStyle, clipEnd } from './types';

export type VideoSources = Partial<Record<TrackKind, HTMLVideoElement | null>>;

export interface RenderOptions {
  /** Draw a selection outline around this track. */
  selectedTrack?: TrackKind | null;
  selectedTextId?: string | null;
  showPlaceholders?: boolean;
  rtlCaptions?: boolean;
}

export const activeClipAt = (project: Project, track: TrackKind, time: number): Clip | undefined =>
  project.clips.find((c) => c.track === track && time >= c.start && time < clipEnd(c));

const roundedRectPath = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
};

const shapePath = (ctx: CanvasRenderingContext2D, style: TrackStyle, px: { x: number; y: number; w: number; h: number }) => {
  if (style.shape === 'circle') {
    const r = Math.min(px.w, px.h) / 2;
    ctx.beginPath();
    ctx.arc(px.x + px.w / 2, px.y + px.h / 2, r, 0, Math.PI * 2);
    ctx.closePath();
  } else if (style.shape === 'rounded') {
    roundedRectPath(ctx, px.x, px.y, px.w, px.h, style.cornerRadius);
  } else {
    ctx.beginPath();
    ctx.rect(px.x, px.y, px.w, px.h);
    ctx.closePath();
  }
};

export const boxToPixels = (box: Box, W: number, H: number) => ({
  x: box.x * W,
  y: box.y * H,
  w: box.w * W,
  h: box.h * H,
});

/** Pixel rect actually occupied by the shape (circle shrinks to a square). */
export const shapeRect = (style: TrackStyle, W: number, H: number) => {
  const px = boxToPixels(style.box, W, H);
  if (style.shape === 'circle') {
    const d = Math.min(px.w, px.h);
    return { x: px.x + (px.w - d) / 2, y: px.y + (px.h - d) / 2, w: d, h: d };
  }
  return px;
};

const drawTrack = (
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement | null | undefined,
  style: TrackStyle,
  W: number,
  H: number,
  label: string,
  showPlaceholder: boolean,
) => {
  const rect = shapeRect(style, W, H);
  if (rect.w <= 0 || rect.h <= 0) return;

  ctx.save();
  shapePath(ctx, style, rect);
  ctx.clip();

  if (video && video.readyState >= 2 && video.videoWidth > 0) {
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const sx = style.crop.left * vw;
    const sy = style.crop.top * vh;
    const sw = Math.max(1, vw - sx - style.crop.right * vw);
    const sh = Math.max(1, vh - sy - style.crop.bottom * vh);
    // cover fit
    const scale = Math.max(rect.w / sw, rect.h / sh);
    const dw = sw * scale;
    const dh = sh * scale;
    const dx = rect.x + (rect.w - dw) / 2;
    const dy = rect.y + (rect.h - dh) / 2;
    ctx.drawImage(video, sx, sy, sw, sh, dx, dy, dw, dh);
  } else if (showPlaceholder) {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = `${Math.round(Math.min(rect.w, rect.h) * 0.08)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2);
  }
  ctx.restore();

  if (style.borderWidth > 0) {
    ctx.save();
    shapePath(ctx, style, rect);
    ctx.lineWidth = style.borderWidth;
    ctx.strokeStyle = style.borderColor;
    ctx.stroke();
    ctx.restore();
  }
};

const wrapLines = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
};

const drawTextBlock = (
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  size: number,
  color: string,
  background: boolean,
  W: number,
  rtl: boolean,
) => {
  ctx.save();
  ctx.font = `700 ${size}px system-ui, "Segoe UI", Tahoma, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.direction = rtl ? 'rtl' : 'ltr';
  const lines = wrapLines(ctx, text, W * 0.86);
  const lineH = size * 1.25;
  const totalH = lines.length * lineH;
  lines.forEach((ln, i) => {
    const y = cy - totalH / 2 + lineH * (i + 0.5);
    const w = ctx.measureText(ln).width;
    if (background) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      roundedRectPath(ctx, cx - w / 2 - size * 0.35, y - lineH / 2, w + size * 0.7, lineH, size * 0.25);
      ctx.fill();
    } else {
      ctx.lineWidth = Math.max(2, size * 0.12);
      ctx.strokeStyle = 'rgba(0,0,0,0.85)';
      ctx.lineJoin = 'round';
      ctx.strokeText(ln, cx, y);
    }
    ctx.fillStyle = color;
    ctx.fillText(ln, cx, y);
  });
  ctx.restore();
};

/** Measures the drawn text overlay rectangle (canvas px) – used for hit-testing. */
export const measureText = (ctx: CanvasRenderingContext2D, t: TextOverlay, W: number, H: number) => {
  ctx.save();
  ctx.font = `700 ${t.size}px system-ui, "Segoe UI", Tahoma, sans-serif`;
  const lines = wrapLines(ctx, t.text || ' ', W * 0.86);
  const w = Math.max(...lines.map((l) => ctx.measureText(l).width), t.size) + t.size * 0.7;
  const h = lines.length * t.size * 1.25;
  ctx.restore();
  return { x: t.x * W - w / 2, y: t.y * H - h / 2, w, h };
};

export const renderFrame = (
  ctx: CanvasRenderingContext2D,
  project: Project,
  time: number,
  sources: VideoSources,
  opts: RenderOptions = {},
) => {
  const W = project.canvasWidth;
  const H = project.canvasHeight;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = project.background;
  ctx.fillRect(0, 0, W, H);

  const order: TrackKind[] = ['original', 'reaction'];
  for (const track of order) {
    const clip = activeClipAt(project, track, time);
    const hasClip = project.clips.some((c) => c.track === track);
    drawTrack(
      ctx,
      clip ? sources[track] : null,
      project.styles[track],
      W,
      H,
      track === 'original' ? 'Original Video' : 'Reaction Video',
      opts.showPlaceholders !== false && (!hasClip || !clip),
    );
  }

  // captions
  const caption: Caption | undefined = project.captions.find((c) => time >= c.start && time < c.end);
  if (caption && caption.text.trim()) {
    const cs = project.captionStyle;
    drawTextBlock(ctx, caption.text, W / 2, cs.y * H, cs.size, cs.color, cs.background, W, !!opts.rtlCaptions);
  }

  // text overlays
  for (const t of project.texts) {
    if (time < t.start || time >= t.end) continue;
    drawTextBlock(ctx, t.text, t.x * W, t.y * H, t.size, t.color, t.background, W, false);
    if (opts.selectedTextId === t.id) {
      const r = measureText(ctx, t, W, H);
      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.setLineDash([14, 10]);
      ctx.strokeRect(r.x, r.y, r.w, r.h);
      ctx.restore();
    }
  }

  // selection outline
  if (opts.selectedTrack) {
    const r = shapeRect(project.styles[opts.selectedTrack], W, H);
    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 5;
    ctx.setLineDash([18, 12]);
    ctx.strokeRect(r.x, r.y, r.w, r.h);
    ctx.setLineDash([]);
    ctx.fillStyle = '#38bdf8';
    const hs = 22;
    for (const [hx, hy] of [
      [r.x, r.y],
      [r.x + r.w, r.y],
      [r.x, r.y + r.h],
      [r.x + r.w, r.y + r.h],
    ]) {
      ctx.fillRect(hx - hs / 2, hy - hs / 2, hs, hs);
    }
    ctx.restore();
  }
  ctx.restore();
};
