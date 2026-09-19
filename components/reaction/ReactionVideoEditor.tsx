import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Camera,
  Captions as CaptionsIcon,
  Circle,
  Columns2,
  Crop as CropIcon,
  Download,
  Film,
  LayoutTemplate,
  Loader2,
  Move,
  Music,
  Pause,
  Play,
  PictureInPicture2,
  Plus,
  Redo2,
  Rows2,
  Scissors,
  SkipBack,
  Sparkles,
  Trash2,
  Type,
  Undo2,
  Upload,
  Video,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import {
  CAPTION_LANGUAGES,
  Caption,
  CaptionLanguage,
  Clip,
  EXPORT_PRESETS,
  ExportPreset,
  LAYOUT_PRESETS,
  LayoutId,
  MediaAsset,
  Project,
  Selection,
  TextOverlay,
  TrackKind,
  clipDuration,
  clipEnd,
  createDefaultProject,
  defaultCrop,
  projectDuration,
  uid,
} from './types';
import { ReactionEngine, loadMediaAsset } from './engine';
import { measureText, shapeRect } from './renderer';
import { availableEngines, generateCaptions, languageMeta, CaptionEngine } from './captionService';
import { useHistory } from './useHistory';
import Timeline from './Timeline';
import RecordReactionModal from './RecordReactionModal';

type LeftTab = 'media' | 'layout' | 'captions' | 'text' | 'audio';

const TABS: { id: LeftTab; label: string; icon: React.ReactNode }[] = [
  { id: 'media', label: 'Media', icon: <Film size={18} /> },
  { id: 'layout', label: 'Layout', icon: <LayoutTemplate size={18} /> },
  { id: 'captions', label: 'Captions', icon: <CaptionsIcon size={18} /> },
  { id: 'text', label: 'Text', icon: <Type size={18} /> },
  { id: 'audio', label: 'Audio', icon: <Music size={18} /> },
];

const LAYOUT_ICONS: Record<LayoutId, React.ReactNode> = {
  'side-by-side': <Columns2 size={22} />,
  'top-bottom': <Rows2 size={22} />,
  pip: <PictureInPicture2 size={22} />,
  circle: <Circle size={22} />,
};

const fmt = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;

const Field: React.FC<{ label: string; children: React.ReactNode; hint?: string }> = ({ label, children, hint }) => (
  <label className="block">
    <span className="text-[11px] uppercase tracking-wide text-slate-400 flex justify-between">
      {label}
      {hint && <span className="text-slate-500 normal-case tracking-normal">{hint}</span>}
    </span>
    <div className="mt-1">{children}</div>
  </label>
);

const Slider: React.FC<{ value: number; min: number; max: number; step?: number; onChange: (v: number) => void; onCommit?: () => void }> = ({ value, min, max, step = 0.01, onChange, onCommit }) => (
  <input
    type="range"
    min={min}
    max={max}
    step={step}
    value={value}
    onChange={(e) => onChange(Number(e.target.value))}
    onPointerUp={onCommit}
    onKeyUp={onCommit}
    className="w-full accent-sky-500"
  />
);

const ReactionVideoEditor: React.FC<{ fullPage?: boolean }> = ({ fullPage = false }) => {
  const history = useHistory<Project>(createDefaultProject());
  const project = history.state;
  const [media, setMedia] = useState<Map<string, MediaAsset>>(new Map());
  const [tab, setTab] = useState<LeftTab>('media');
  const [selection, setSelection] = useState<Selection>(null);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; kind: 'ok' | 'err' } | null>(null);
  const [showRecord, setShowRecord] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [exportProgress, setExportProgress] = useState<number | null>(null);
  const [exportResult, setExportResult] = useState<{ url: string; ext: string; size: number } | null>(null);
  const [preset, setPreset] = useState<ExportPreset>(EXPORT_PRESETS[0]);
  const [captionStatus, setCaptionStatus] = useState<{ msg: string; ratio?: number } | null>(null);
  const [captionEngine, setCaptionEngine] = useState<CaptionEngine | ''>('');
  const [cropMode, setCropMode] = useState(false);

  const engineRef = useRef<ReactionEngine | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const originalInput = useRef<HTMLInputElement>(null);
  const reactionInput = useRef<HTMLInputElement>(null);

  const notify = (text: string, kind: 'ok' | 'err' = 'ok') => {
    setToast({ text, kind });
    window.setTimeout(() => setToast(null), 3500);
  };

  /* ---------- engine lifecycle ---------- */
  useEffect(() => {
    const engine = new ReactionEngine(history.get());
    engine.attachCanvas(canvasRef.current);
    engine.onTime = setTime;
    engine.onPlayState = setPlaying;
    engineRef.current = engine;
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    engineRef.current?.setProject(project);
  }, [project]);
  useEffect(() => {
    engineRef.current?.setMedia(media);
  }, [media]);

  const selectedClip = useMemo(() => (selection?.type === 'clip' ? project.clips.find((c) => c.id === selection.id) || null : null), [selection, project.clips]);
  const selectedTrack: TrackKind | null = selectedClip?.track ?? null;
  const selectedText = selection?.type === 'text' ? project.texts.find((t) => t.id === selection.id) || null : null;
  const selectedCaption = selection?.type === 'caption' ? project.captions.find((c) => c.id === selection.id) || null : null;
  const rtl = languageMeta(project.captionLanguage).rtl;

  useEffect(() => {
    engineRef.current?.setRenderOptions({ selectedTrack, selectedTextId: selectedText?.id ?? null, rtlCaptions: rtl });
  }, [selectedTrack, selectedText?.id, rtl]);

  useEffect(() => {
    return () => {
      media.forEach((m) => URL.revokeObjectURL(m.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- keyboard ---------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        e.shiftKey ? history.redo() : history.undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        history.redo();
      } else if (e.key === ' ') {
        e.preventDefault();
        engineRef.current?.toggle();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelection();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection]);

  /* ---------- media ---------- */
  const addClip = useCallback(
    (asset: MediaAsset, track: TrackKind, start = 0) => {
      setMedia((m) => new Map(m).set(asset.id, asset));
      history.commit((p) => {
        const others = p.clips.filter((c) => c.track !== track);
        const clip: Clip = { id: uid(), track, mediaId: asset.id, start, trimStart: 0, trimEnd: asset.duration, speed: 1, volume: track === 'original' ? 0.6 : 1, muted: false };
        return { ...p, clips: [...others, clip] };
      });
      const clipId = history.get().clips.find((c) => c.track === track)?.id;
      if (clipId) setSelection({ type: 'clip', id: clipId });
      engineRef.current?.seek(0);
    },
    [history],
  );

  const handleFile = async (file: File | null | undefined, track: TrackKind) => {
    if (!file) return;
    setBusy(`Loading ${file.name}…`);
    try {
      const asset = await loadMediaAsset(file, file.name);
      addClip(asset, track);
      notify(`${track === 'original' ? 'Original' : 'Reaction'} video added`);
      if (track === 'original' && !project.clips.some((c) => c.track === 'reaction')) setTab('media');
    } catch (e: any) {
      notify(e.message || 'Could not load the video', 'err');
    } finally {
      setBusy(null);
    }
  };

  const handleRecorded = async (blob: Blob, { mirrored }: { mirrored: boolean }) => {
    setShowRecord(false);
    setBusy('Processing recording…');
    try {
      const asset = await loadMediaAsset(blob, `Reaction ${new Date().toLocaleTimeString()}.webm`);
      const origClip = project.clips.find((c) => c.track === 'original');
      addClip(asset, 'reaction', origClip ? origClip.start : 0);
      void mirrored;
      notify('Recording added to the timeline');
      setTab('layout');
    } catch (e: any) {
      notify(e.message || 'Recording failed', 'err');
    } finally {
      setBusy(null);
    }
  };

  /* ---------- editing helpers ---------- */
  const updateClip = (id: string, patch: Partial<Clip>, live = false) => {
    const fn = (p: Project) => ({ ...p, clips: p.clips.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
    live ? history.patch(fn) : history.commit(fn);
  };
  const updateStyle = (track: TrackKind, patch: Partial<Project['styles'][TrackKind]>, live = false) => {
    const fn = (p: Project) => ({ ...p, styles: { ...p.styles, [track]: { ...p.styles[track], ...patch } } });
    live ? history.patch(fn) : history.commit(fn);
  };
  const updateText = (id: string, patch: Partial<TextOverlay>, live = false) => {
    const fn = (p: Project) => ({ ...p, texts: p.texts.map((t) => (t.id === id ? { ...t, ...patch } : t)) });
    live ? history.patch(fn) : history.commit(fn);
  };
  const updateCaption = (id: string, patch: Partial<Caption>) =>
    history.commit((p) => ({ ...p, captions: p.captions.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));

  const applyLayout = (layout: LayoutId) => {
    const L = LAYOUT_PRESETS[layout];
    history.commit((p) => ({
      ...p,
      layout,
      styles: {
        original: { ...p.styles.original, box: L.original, shape: 'rectangle' },
        reaction: { ...p.styles.reaction, box: L.reaction, shape: L.shape, borderWidth: layout === 'pip' || layout === 'circle' ? Math.max(p.styles.reaction.borderWidth, 8) : p.styles.reaction.borderWidth },
      },
    }));
  };

  const splitAtPlayhead = () => {
    const clip = selectedClip || project.clips.find((c) => time > c.start && time < clipEnd(c));
    if (!clip || time <= clip.start + 0.05 || time >= clipEnd(clip) - 0.05) return notify('Move the playhead inside a clip to split it', 'err');
    const srcT = clip.trimStart + (time - clip.start) * clip.speed;
    const left: Clip = { ...clip, trimEnd: srcT };
    const right: Clip = { ...clip, id: uid(), start: time, trimStart: srcT };
    history.commit((p) => ({ ...p, clips: p.clips.flatMap((c) => (c.id === clip.id ? [left, right] : [c])) }));
    setSelection({ type: 'clip', id: right.id });
  };

  const deleteSelection = () => {
    if (!selection) return;
    if (selection.type === 'clip') {
      history.commit((p) => ({ ...p, clips: p.clips.filter((c) => c.id !== selection.id) }));
    } else if (selection.type === 'text') {
      history.commit((p) => ({ ...p, texts: p.texts.filter((t) => t.id !== selection.id) }));
    } else if (selection.type === 'caption') {
      history.commit((p) => ({ ...p, captions: p.captions.filter((c) => c.id !== selection.id) }));
    }
    setSelection(null);
  };

  const addText = () => {
    const t: TextOverlay = { id: uid(), text: 'Your text', x: 0.5, y: 0.12, size: 72, color: '#ffffff', background: true, start: time, end: Math.max(time + 4, Math.min(time + 4, projectDuration(project) || time + 4)) };
    history.commit((p) => ({ ...p, texts: [...p.texts, t] }));
    setSelection({ type: 'text', id: t.id });
    setTab('text');
  };

  /* ---------- captions ---------- */
  const runAutoCaptions = async (lang: CaptionLanguage) => {
    const clip = project.clips.find((c) => c.track === 'reaction');
    if (!clip) return notify('Add a reaction video first', 'err');
    const asset = media.get(clip.mediaId);
    if (!asset) return;
    engineRef.current?.pause();
    setCaptionStatus({ msg: 'Starting…', ratio: 0 });
    try {
      const { captions, engine } = await generateCaptions({
        media: asset.file,
        mediaUrl: asset.url,
        from: clip.trimStart,
        to: clip.trimEnd,
        timelineOffset: clip.start,
        speed: clip.speed,
        language: lang,
        engine: captionEngine || undefined,
        onStatus: (msg, ratio) => setCaptionStatus({ msg, ratio }),
      });
      history.commit((p) => ({ ...p, captions, captionLanguage: lang }));
      notify(captions.length ? `${captions.length} captions generated (${engine})` : 'No speech detected', captions.length ? 'ok' : 'err');
    } catch (e: any) {
      notify(e.message || 'Caption generation failed', 'err');
    } finally {
      setCaptionStatus(null);
    }
  };

  /* ---------- export ---------- */
  const doExport = async () => {
    const engine = engineRef.current;
    if (!engine) return;
    setExportProgress(0);
    setExportResult(null);
    setSelection(null);
    try {
      const { blob, ext } = await engine.exportVideo(preset, setExportProgress);
      setExportResult({ url: URL.createObjectURL(blob), ext, size: blob.size });
    } catch (e: any) {
      notify(e.message || 'Export failed', 'err');
    } finally {
      setExportProgress(null);
    }
  };

  /* ---------- canvas interaction (move / resize / crop) ---------- */
  const canvasDrag = useRef<{ kind: 'move' | 'resize' | 'text' | 'crop'; track?: TrackKind; textId?: string; corner?: string; startX: number; startY: number; box: { x: number; y: number; w: number; h: number }; crop?: Project['styles'][TrackKind]['crop']; tx?: number; ty?: number } | null>(null);

  const toCanvas = (e: React.PointerEvent) => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * project.canvasWidth, y: ((e.clientY - r.top) / r.height) * project.canvasHeight };
  };

  const onCanvasDown = (e: React.PointerEvent) => {
    const pt = toCanvas(e);
    const W = project.canvasWidth;
    const H = project.canvasHeight;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const ctx = canvasRef.current!.getContext('2d')!;
    // text hit-test first (top-most)
    for (const t of [...project.texts].reverse()) {
      if (time < t.start || time >= t.end) continue;
      const r = measureText(ctx, t, W, H);
      if (pt.x >= r.x && pt.x <= r.x + r.w && pt.y >= r.y && pt.y <= r.y + r.h) {
        setSelection({ type: 'text', id: t.id });
        canvasDrag.current = { kind: 'text', textId: t.id, startX: pt.x, startY: pt.y, box: { x: 0, y: 0, w: 0, h: 0 }, tx: t.x, ty: t.y };
        return;
      }
    }
    // resize handles of the selected track
    if (selectedTrack) {
      const r = shapeRect(project.styles[selectedTrack], W, H);
      const hs = 40;
      const corners: Record<string, [number, number]> = { nw: [r.x, r.y], ne: [r.x + r.w, r.y], sw: [r.x, r.y + r.h], se: [r.x + r.w, r.y + r.h] };
      for (const [name, [cx, cy]] of Object.entries(corners)) {
        if (Math.abs(pt.x - cx) < hs && Math.abs(pt.y - cy) < hs) {
          canvasDrag.current = { kind: 'resize', track: selectedTrack, corner: name, startX: pt.x, startY: pt.y, box: { ...project.styles[selectedTrack].box } };
          return;
        }
      }
    }
    // track hit-test: reaction is on top
    for (const track of ['reaction', 'original'] as TrackKind[]) {
      const clip = project.clips.find((c) => c.track === track);
      if (!clip) continue;
      const r = shapeRect(project.styles[track], W, H);
      if (pt.x >= r.x && pt.x <= r.x + r.w && pt.y >= r.y && pt.y <= r.y + r.h) {
        setSelection({ type: 'clip', id: clip.id });
        canvasDrag.current = { kind: cropMode ? 'crop' : 'move', track, startX: pt.x, startY: pt.y, box: { ...project.styles[track].box }, crop: { ...project.styles[track].crop } };
        return;
      }
    }
    setSelection(null);
  };

  const onCanvasMove = (e: React.PointerEvent) => {
    const d = canvasDrag.current;
    if (!d) return;
    const pt = toCanvas(e);
    const W = project.canvasWidth;
    const H = project.canvasHeight;
    const dx = (pt.x - d.startX) / W;
    const dy = (pt.y - d.startY) / H;
    if (d.kind === 'text' && d.textId) {
      updateText(d.textId, { x: Math.min(1, Math.max(0, d.tx! + dx)), y: Math.min(1, Math.max(0, d.ty! + dy)) }, true);
    } else if (d.kind === 'move' && d.track) {
      updateStyle(d.track, { box: { ...d.box, x: Math.min(1 - d.box.w, Math.max(0, d.box.x + dx)), y: Math.min(1 - d.box.h, Math.max(0, d.box.y + dy)) } }, true);
    } else if (d.kind === 'resize' && d.track) {
      let { x, y, w, h } = d.box;
      if (d.corner!.includes('e')) w = Math.max(0.08, d.box.w + dx);
      if (d.corner!.includes('s')) h = Math.max(0.05, d.box.h + dy);
      if (d.corner!.includes('w')) {
        w = Math.max(0.08, d.box.w - dx);
        x = d.box.x + d.box.w - w;
      }
      if (d.corner!.includes('n')) {
        h = Math.max(0.05, d.box.h - dy);
        y = d.box.y + d.box.h - h;
      }
      updateStyle(d.track, { box: { x, y, w, h } }, true);
    } else if (d.kind === 'crop' && d.track && d.crop) {
      // dragging pans the crop window
      const c = d.crop;
      const availX = 1 - c.left - c.right;
      const availY = 1 - c.top - c.bottom;
      const shiftX = Math.max(-c.left, Math.min(c.right, -dx * availX));
      const shiftY = Math.max(-c.top, Math.min(c.bottom, -dy * availY));
      updateStyle(d.track, { crop: { left: c.left + shiftX, right: c.right - shiftX, top: c.top + shiftY, bottom: c.bottom - shiftY } }, true);
    }
  };

  const onCanvasUp = () => {
    if (canvasDrag.current) history.endDrag();
    canvasDrag.current = null;
  };

  /* ---------- derived ---------- */
  const originalClip = project.clips.find((c) => c.track === 'original');
  const reactionClip = project.clips.find((c) => c.track === 'reaction');
  const originalAsset = originalClip ? media.get(originalClip.mediaId) || null : null;
  const step = !originalClip ? 1 : !reactionClip ? 2 : 3;
  const engines = availableEngines();

  /* ---------- UI pieces ---------- */
  const renderTrackSettings = (clip: Clip) => {
    const style = project.styles[clip.track];
    const asset = media.get(clip.mediaId);
    const isReaction = clip.track === 'reaction';
    return (
      <div className="space-y-5">
        <div>
          <p className="text-xs text-slate-400">Selected</p>
          <p className={`font-semibold ${isReaction ? 'text-rose-300' : 'text-sky-300'}`}>{isReaction ? 'Reaction Video' : 'Original Video'}</p>
          <p className="text-xs text-slate-500 truncate">{asset?.name}</p>
        </div>

        <section className="space-y-3">
          <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-2"><Scissors size={14} /> Trim</h4>
          <Field label="Start" hint={fmt(clip.trimStart)}>
            <Slider value={clip.trimStart} min={0} max={Math.max(0, clip.trimEnd - 0.2)} step={0.05} onChange={(v) => updateClip(clip.id, { trimStart: v }, true)} onCommit={history.endDrag} />
          </Field>
          <Field label="End" hint={fmt(clip.trimEnd)}>
            <Slider value={clip.trimEnd} min={clip.trimStart + 0.2} max={asset?.duration || clip.trimEnd} step={0.05} onChange={(v) => updateClip(clip.id, { trimEnd: v }, true)} onCommit={history.endDrag} />
          </Field>
          <Field label="Position on timeline" hint={fmt(clip.start)}>
            <input type="number" min={0} step={0.1} value={Number(clip.start.toFixed(2))} onChange={(e) => updateClip(clip.id, { start: Math.max(0, Number(e.target.value)) })} className="w-full bg-slate-800 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white" />
          </Field>
        </section>

        <section className="space-y-3">
          <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-2"><Move size={14} /> Position & Size</h4>
          <p className="text-[11px] text-slate-500">Drag the video in the preview to move it. Drag a corner to resize.</p>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Width" hint={`${Math.round(style.box.w * 100)}%`}>
              <Slider value={style.box.w} min={0.08} max={1} onChange={(v) => updateStyle(clip.track, { box: { ...style.box, w: v, x: Math.min(style.box.x, 1 - v) } }, true)} onCommit={history.endDrag} />
            </Field>
            <Field label="Height" hint={`${Math.round(style.box.h * 100)}%`}>
              <Slider value={style.box.h} min={0.05} max={1} onChange={(v) => updateStyle(clip.track, { box: { ...style.box, h: v, y: Math.min(style.box.y, 1 - v) } }, true)} onCommit={history.endDrag} />
            </Field>
          </div>
        </section>

        <section className="space-y-3">
          <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-2"><CropIcon size={14} /> Crop</h4>
          <div className="grid grid-cols-2 gap-2">
            {(['left', 'right', 'top', 'bottom'] as const).map((side) => (
              <Field key={side} label={side} hint={`${Math.round(style.crop[side] * 100)}%`}>
                <Slider value={style.crop[side]} min={0} max={0.45} onChange={(v) => updateStyle(clip.track, { crop: { ...style.crop, [side]: v } }, true)} onCommit={history.endDrag} />
              </Field>
            ))}
          </div>
          <button onClick={() => updateStyle(clip.track, { crop: defaultCrop() })} className="text-xs text-sky-400 hover:underline">Reset crop</button>
        </section>

        <section className="space-y-3">
          <h4 className="text-xs font-semibold text-slate-300">Shape & Border</h4>
          <div className="grid grid-cols-3 gap-1.5">
            {(['rectangle', 'rounded', 'circle'] as const).map((s) => (
              <button key={s} onClick={() => updateStyle(clip.track, { shape: s })} className={`py-1.5 rounded-lg text-xs capitalize border ${style.shape === s ? 'bg-sky-500/20 border-sky-400 text-white' : 'bg-slate-800 border-white/10 text-slate-300 hover:bg-slate-700'}`}>
                {s}
              </button>
            ))}
          </div>
          {style.shape === 'rounded' && (
            <Field label="Corner radius" hint={`${style.cornerRadius}px`}>
              <Slider value={style.cornerRadius} min={0} max={300} step={2} onChange={(v) => updateStyle(clip.track, { cornerRadius: v }, true)} onCommit={history.endDrag} />
            </Field>
          )}
          <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
            <Field label="Border" hint={`${style.borderWidth}px`}>
              <Slider value={style.borderWidth} min={0} max={40} step={1} onChange={(v) => updateStyle(clip.track, { borderWidth: v }, true)} onCommit={history.endDrag} />
            </Field>
            <input type="color" value={style.borderColor} onChange={(e) => updateStyle(clip.track, { borderColor: e.target.value })} className="w-9 h-9 rounded-lg bg-transparent border border-white/10 cursor-pointer" aria-label="Border colour" />
          </div>
        </section>

        <section className="space-y-3">
          <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-2"><Volume2 size={14} /> Audio & Speed</h4>
          <div className="flex items-center gap-2">
            <button onClick={() => updateClip(clip.id, { muted: !clip.muted })} className={`p-2 rounded-lg border ${clip.muted ? 'bg-rose-500/20 border-rose-400 text-rose-200' : 'bg-slate-800 border-white/10 text-slate-200'}`} title={clip.muted ? 'Unmute' : 'Mute'}>
              {clip.muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <div className="flex-1">
              <Slider value={clip.volume} min={0} max={1} onChange={(v) => updateClip(clip.id, { volume: v, muted: false }, true)} onCommit={history.endDrag} />
            </div>
            <span className="text-xs text-slate-400 w-9 text-right">{Math.round(clip.volume * 100)}%</span>
          </div>
          <Field label="Speed" hint={`${clip.speed}x`}>
            <div className="grid grid-cols-5 gap-1">
              {[0.5, 0.75, 1, 1.5, 2].map((s) => (
                <button key={s} onClick={() => updateClip(clip.id, { speed: s })} className={`py-1 rounded text-xs border ${clip.speed === s ? 'bg-sky-500/20 border-sky-400 text-white' : 'bg-slate-800 border-white/10 text-slate-300'}`}>
                  {s}x
                </button>
              ))}
            </div>
          </Field>
        </section>

        <button onClick={deleteSelection} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm hover:bg-rose-500/20">
          <Trash2 size={14} /> Remove from timeline
        </button>
      </div>
    );
  };

  const renderTextSettings = (t: TextOverlay) => (
    <div className="space-y-4">
      <p className="font-semibold text-white">Text</p>
      <Field label="Content">
        <textarea value={t.text} onChange={(e) => updateText(t.id, { text: e.target.value })} rows={3} className="w-full bg-slate-800 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white" />
      </Field>
      <Field label="Size" hint={`${t.size}px`}>
        <Slider value={t.size} min={24} max={200} step={2} onChange={(v) => updateText(t.id, { size: v }, true)} onCommit={history.endDrag} />
      </Field>
      <div className="flex items-center gap-3">
        <input type="color" value={t.color} onChange={(e) => updateText(t.id, { color: e.target.value })} className="w-9 h-9 rounded-lg bg-transparent border border-white/10" />
        <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={t.background} onChange={(e) => updateText(t.id, { background: e.target.checked })} className="accent-sky-500" /> Background</label>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Show from" hint={fmt(t.start)}>
          <input type="number" min={0} step={0.1} value={Number(t.start.toFixed(1))} onChange={(e) => updateText(t.id, { start: Number(e.target.value) })} className="w-full bg-slate-800 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white" />
        </Field>
        <Field label="Until" hint={fmt(t.end)}>
          <input type="number" min={0} step={0.1} value={Number(t.end.toFixed(1))} onChange={(e) => updateText(t.id, { end: Number(e.target.value) })} className="w-full bg-slate-800 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white" />
        </Field>
      </div>
      <p className="text-[11px] text-slate-500">Drag the text in the preview to move it.</p>
      <button onClick={deleteSelection} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm"><Trash2 size={14} /> Delete text</button>
    </div>
  );

  const renderCaptionSettings = (c: Caption) => (
    <div className="space-y-4">
      <p className="font-semibold text-white">Caption</p>
      <Field label="Text">
        <textarea dir={rtl ? 'rtl' : 'ltr'} value={c.text} onChange={(e) => updateCaption(c.id, { text: e.target.value })} rows={3} className="w-full bg-slate-800 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white" />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="From" hint={fmt(c.start)}>
          <input type="number" min={0} step={0.1} value={Number(c.start.toFixed(2))} onChange={(e) => updateCaption(c.id, { start: Number(e.target.value) })} className="w-full bg-slate-800 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white" />
        </Field>
        <Field label="To" hint={fmt(c.end)}>
          <input type="number" min={0} step={0.1} value={Number(c.end.toFixed(2))} onChange={(e) => updateCaption(c.id, { end: Number(e.target.value) })} className="w-full bg-slate-800 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white" />
        </Field>
      </div>
      <button onClick={deleteSelection} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm"><Trash2 size={14} /> Delete caption</button>
    </div>
  );

  const renderLeftPanel = () => {
    switch (tab) {
      case 'media':
        return (
          <div className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-slate-800/60 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-sky-300 flex items-center gap-2"><Film size={16} /> 1. Original Video</span>
                {originalClip && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Added</span>}
              </div>
              <p className="text-xs text-slate-400 mb-2 truncate">{originalAsset?.name || 'The video you want to react to.'}</p>
              <button onClick={() => originalInput.current?.click()} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium">
                <Upload size={15} /> {originalClip ? 'Replace video' : 'Upload video'}
              </button>
              <input ref={originalInput} type="file" accept="video/*" className="hidden" onChange={(e) => { handleFile(e.target.files?.[0], 'original'); e.target.value = ''; }} />
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-800/60 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-rose-300 flex items-center gap-2"><Video size={16} /> 2. Reaction Video</span>
                {reactionClip && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Added</span>}
              </div>
              <p className="text-xs text-slate-400 mb-2 truncate">{reactionClip ? media.get(reactionClip.mediaId)?.name : 'Your camera video.'}</p>
              <div className="grid grid-cols-1 gap-2">
                <button onClick={() => setShowRecord(true)} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium">
                  <Camera size={15} /> 🎥 Record Reaction
                </button>
                <button onClick={() => reactionInput.current?.click()} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm">
                  <Upload size={15} /> Upload reaction
                </button>
              </div>
              <input ref={reactionInput} type="file" accept="video/*" className="hidden" onChange={(e) => { handleFile(e.target.files?.[0], 'reaction'); e.target.value = ''; }} />
            </div>

            <div className="text-xs text-slate-500 leading-relaxed">
              <p className="font-medium text-slate-400 mb-1">How it works</p>
              <ol className="list-decimal ml-4 space-y-0.5">
                <li>Add the original video</li>
                <li>Record or upload your reaction</li>
                <li>Pick a layout</li>
                <li>Adjust & add captions</li>
                <li>Export</li>
              </ol>
            </div>
          </div>
        );
      case 'layout':
        return (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">3. Choose how both videos appear on screen.</p>
            {(Object.keys(LAYOUT_PRESETS) as LayoutId[]).map((id) => {
              const L = LAYOUT_PRESETS[id];
              const active = project.layout === id;
              return (
                <button key={id} onClick={() => applyLayout(id)} className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition ${active ? 'bg-sky-500/15 border-sky-400' : 'bg-slate-800/60 border-white/10 hover:bg-slate-700/60'}`}>
                  <span className={`p-2 rounded-lg ${active ? 'bg-sky-500 text-white' : 'bg-slate-700 text-slate-300'}`}>{LAYOUT_ICONS[id]}</span>
                  <span>
                    <span className="block text-sm font-medium text-white">{L.label}</span>
                    <span className="block text-[11px] text-slate-400">{L.hint}</span>
                  </span>
                </button>
              );
            })}
            <div className="pt-2">
              <Field label="Background colour">
                <input type="color" value={project.background} onChange={(e) => history.commit((p) => ({ ...p, background: e.target.value }))} className="w-full h-9 rounded-lg bg-transparent border border-white/10 cursor-pointer" />
              </Field>
            </div>
            <p className="text-[11px] text-slate-500">Tip: click a video in the preview to move, resize or crop it.</p>
          </div>
        );
      case 'captions':
        return (
          <div className="space-y-4">
            <p className="text-xs text-slate-400">Auto-generate captions from the reaction audio, synced to the timeline.</p>
            <Field label="Language">
              <div className="grid grid-cols-1 gap-1.5">
                {CAPTION_LANGUAGES.map((l) => (
                  <button key={l.id} onClick={() => history.commit((p) => ({ ...p, captionLanguage: l.id }))} className={`flex items-center justify-between px-3 py-2 rounded-lg border text-sm ${project.captionLanguage === l.id ? 'bg-sky-500/15 border-sky-400 text-white' : 'bg-slate-800/60 border-white/10 text-slate-300 hover:bg-slate-700/60'}`}>
                    <span>{l.label}</span>
                    <span className="text-slate-400">{l.native}</span>
                  </button>
                ))}
              </div>
            </Field>
            {engines.length > 1 && (
              <Field label="Engine">
                <select value={captionEngine} onChange={(e) => setCaptionEngine(e.target.value as CaptionEngine)} className="w-full bg-slate-800 border border-white/10 text-slate-200 text-sm rounded-lg px-2 py-1.5">
                  <option value="">Auto (best available)</option>
                  {engines.map((e) => (
                    <option key={e} value={e}>{e === 'whisper' ? 'OpenAI Whisper' : e === 'gemini' ? 'Google Gemini' : 'Browser speech recognition'}</option>
                  ))}
                </select>
              </Field>
            )}
            <button disabled={!!captionStatus || !reactionClip} onClick={() => runAutoCaptions(project.captionLanguage)} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-semibold disabled:opacity-50">
              {captionStatus ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} Auto Captions
            </button>
            {captionStatus && (
              <div className="text-xs text-slate-300">
                <p>{captionStatus.msg}</p>
                <div className="h-1.5 bg-slate-700 rounded mt-1 overflow-hidden"><div className="h-full bg-amber-400 transition-all" style={{ width: `${Math.round((captionStatus.ratio || 0) * 100)}%` }} /></div>
              </div>
            )}
            {!reactionClip && <p className="text-[11px] text-slate-500">Add a reaction video first.</p>}
            {engines.length === 0 && <p className="text-[11px] text-amber-400/80">No caption engine detected. Add VITE_OPENAI_API_KEY or GEMINI_API_KEY to .env, or use Chrome for built-in speech recognition.</p>}
            {engines.length === 1 && engines[0] === 'browser' && <p className="text-[11px] text-slate-500">Using browser speech recognition: the reaction audio will play out loud while the mic listens. For best accuracy add VITE_OPENAI_API_KEY (Whisper).</p>}

            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Caption style</span>
              </div>
              <Field label="Size" hint={`${project.captionStyle.size}px`}>
                <Slider value={project.captionStyle.size} min={28} max={120} step={2} onChange={(v) => history.patch((p) => ({ ...p, captionStyle: { ...p.captionStyle, size: v } }))} onCommit={history.endDrag} />
              </Field>
              <Field label="Vertical position" hint={`${Math.round(project.captionStyle.y * 100)}%`}>
                <Slider value={project.captionStyle.y} min={0.05} max={0.95} onChange={(v) => history.patch((p) => ({ ...p, captionStyle: { ...p.captionStyle, y: v } }))} onCommit={history.endDrag} />
              </Field>
              <div className="flex items-center gap-3">
                <input type="color" value={project.captionStyle.color} onChange={(e) => history.commit((p) => ({ ...p, captionStyle: { ...p.captionStyle, color: e.target.value } }))} className="w-9 h-9 rounded-lg bg-transparent border border-white/10" />
                <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={project.captionStyle.background} onChange={(e) => history.commit((p) => ({ ...p, captionStyle: { ...p.captionStyle, background: e.target.checked } }))} className="accent-sky-500" /> Background box</label>
              </div>
            </div>

            {project.captions.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">{project.captions.length} captions · click to edit</span>
                  <button onClick={() => history.commit((p) => ({ ...p, captions: [] }))} className="text-[11px] text-rose-300 hover:underline">Clear all</button>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                  {project.captions.map((c) => (
                    <button key={c.id} onClick={() => { setSelection({ type: 'caption', id: c.id }); engineRef.current?.seek(c.start + 0.01); }} className={`w-full text-left px-2 py-1.5 rounded-lg border text-xs ${selection?.type === 'caption' && selection.id === c.id ? 'bg-amber-500/15 border-amber-400' : 'bg-slate-800/60 border-white/10 hover:bg-slate-700/60'}`}>
                      <span className="text-slate-500 font-mono">{fmt(c.start)}</span>
                      <span dir={rtl ? 'rtl' : 'ltr'} className="block text-slate-200 truncate">{c.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case 'text':
        return (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">Add a title or a short note on top of the video.</p>
            <button onClick={addText} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium"><Plus size={16} /> Add text</button>
            <div className="space-y-1">
              {project.texts.map((t) => (
                <button key={t.id} onClick={() => { setSelection({ type: 'text', id: t.id }); engineRef.current?.seek(t.start + 0.01); }} className={`w-full text-left px-3 py-2 rounded-lg border text-sm truncate ${selection?.type === 'text' && selection.id === t.id ? 'bg-sky-500/15 border-sky-400 text-white' : 'bg-slate-800/60 border-white/10 text-slate-300'}`}>
                  {t.text || '(empty)'} <span className="text-slate-500 text-xs">· {fmt(t.start)}–{fmt(t.end)}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 'audio':
        return (
          <div className="space-y-4">
            <p className="text-xs text-slate-400">Balance the two videos. Lower the original so your voice stands out.</p>
            {[originalClip, reactionClip].map((clip, i) =>
              clip ? (
                <div key={clip.id} className="rounded-xl border border-white/10 bg-slate-800/60 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${i === 0 ? 'text-sky-300' : 'text-rose-300'}`}>{i === 0 ? 'Original Video' : 'Reaction Video'}</span>
                    <button onClick={() => updateClip(clip.id, { muted: !clip.muted })} className={`px-2 py-1 rounded-lg text-xs border flex items-center gap-1 ${clip.muted ? 'bg-rose-500/20 border-rose-400 text-rose-200' : 'bg-slate-700 border-white/10 text-slate-200'}`}>
                      {clip.muted ? <VolumeX size={13} /> : <Volume2 size={13} />} {clip.muted ? 'Muted' : 'Mute'}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Slider value={clip.volume} min={0} max={1} onChange={(v) => updateClip(clip.id, { volume: v, muted: false }, true)} onCommit={history.endDrag} />
                    <span className="text-xs text-slate-400 w-9 text-right">{Math.round(clip.volume * 100)}%</span>
                  </div>
                </div>
              ) : (
                <div key={i} className="rounded-xl border border-dashed border-white/10 p-3 text-xs text-slate-500">{i === 0 ? 'Original' : 'Reaction'} video not added yet.</div>
              ),
            )}
          </div>
        );
    }
  };

  const toolBtn = (label: string, icon: React.ReactNode, onClick: () => void, opts: { active?: boolean; disabled?: boolean } = {}) => (
    <button
      key={label}
      onClick={onClick}
      disabled={opts.disabled}
      title={label}
      className={`flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-lg text-[10px] transition disabled:opacity-40 ${opts.active ? 'bg-sky-500/20 text-sky-300' : 'text-slate-300 hover:bg-white/10'}`}
    >
      {icon}
      {label}
    </button>
  );

  const duration = projectDuration(project);

  return (
    <div className={`reaction-editor ${fullPage ? 'h-screen' : '-m-8 h-[calc(100vh-64px)]'} min-h-[640px] flex flex-col bg-slate-950 text-slate-100`} data-theme="dark">
      {/* Top bar */}
      <header className="h-14 shrink-0 flex items-center gap-3 px-4 border-b border-white/10 bg-slate-900">
        <div className="flex items-center gap-2 mr-2">
          <span className="p-1.5 rounded-lg bg-gradient-to-br from-rose-500 to-orange-500 text-white"><Video size={16} /></span>
          <div>
            <p className="text-sm font-semibold leading-tight">Reaction Video</p>
            <p className="text-[10px] text-slate-400 leading-tight">9:16 · 1080 × 1920</p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-1 text-[11px] text-slate-400 mr-2">
          {['Original', 'Reaction', 'Layout', 'Adjust', 'Export'].map((s, i) => (
            <React.Fragment key={s}>
              <span className={`px-2 py-0.5 rounded-full border ${step > i + 1 ? 'border-emerald-500/40 text-emerald-300' : step === i + 1 ? 'border-sky-400 text-sky-300' : 'border-white/10'}`}>{i + 1}. {s}</span>
              {i < 4 && <span className="text-slate-600">›</span>}
            </React.Fragment>
          ))}
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-0.5 bg-slate-800/60 rounded-xl p-1 border border-white/5 overflow-x-auto">
          {toolBtn('Undo', <Undo2 size={16} />, history.undo, { disabled: !history.canUndo })}
          {toolBtn('Redo', <Redo2 size={16} />, history.redo, { disabled: !history.canRedo })}
          <span className="w-px h-6 bg-white/10 mx-1" />
          {toolBtn('Trim', <Scissors size={16} />, () => { if (!selectedClip && reactionClip) setSelection({ type: 'clip', id: reactionClip.id }); setTab('media'); }, { active: !!selectedClip, disabled: project.clips.length === 0 })}
          {toolBtn('Split', <Scissors size={16} className="rotate-90" />, splitAtPlayhead, { disabled: project.clips.length === 0 })}
          {toolBtn('Crop', <CropIcon size={16} />, () => setCropMode((v) => !v), { active: cropMode, disabled: !selectedClip })}
          {toolBtn('Move', <Move size={16} />, () => setCropMode(false), { active: !cropMode && !!selectedClip, disabled: !selectedClip })}
          {toolBtn('Volume', <Volume2 size={16} />, () => setTab('audio'), { active: tab === 'audio' })}
          {toolBtn('Speed', <span className="text-xs font-bold leading-4">1x</span>, () => { if (!selectedClip && reactionClip) setSelection({ type: 'clip', id: reactionClip.id }); }, { disabled: project.clips.length === 0 })}
          {toolBtn('Text', <Type size={16} />, addText)}
          {toolBtn('Captions', <CaptionsIcon size={16} />, () => setTab('captions'), { active: tab === 'captions' })}
        </div>

        <button onClick={() => { engineRef.current?.pause(); setShowExport(true); }} disabled={project.clips.length === 0} className="ml-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white text-sm font-semibold disabled:opacity-40 shadow-lg shadow-sky-500/20">
          <Download size={16} /> Export Video
        </button>
      </header>

      {/* Body */}
      <div className="flex-1 min-h-0 flex">
        {/* Left */}
        <aside className="w-[300px] shrink-0 flex border-r border-white/10 bg-slate-900">
          <nav className="w-16 shrink-0 border-r border-white/10 flex flex-col items-center py-2 gap-1">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`w-14 py-2 rounded-xl flex flex-col items-center gap-1 text-[10px] ${tab === t.id ? 'bg-sky-500/20 text-sky-300' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                {t.icon}
                {t.label}
              </button>
            ))}
          </nav>
          <div className="flex-1 min-w-0 overflow-y-auto p-3">{renderLeftPanel()}</div>
        </aside>

        {/* Center */}
        <main className="flex-1 min-w-0 flex flex-col bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.08),transparent_60%)]">
          <div ref={stageRef} className="flex-1 min-h-0 flex items-center justify-center p-4">
            <div className="relative h-full max-h-full" style={{ aspectRatio: `${project.canvasWidth} / ${project.canvasHeight}` }}>
              <canvas
                ref={canvasRef}
                width={project.canvasWidth}
                height={project.canvasHeight}
                className={`h-full w-full rounded-2xl shadow-2xl shadow-black/60 ring-1 ring-white/10 bg-black touch-none ${cropMode ? 'cursor-crosshair' : 'cursor-pointer'}`}
                onPointerDown={onCanvasDown}
                onPointerMove={onCanvasMove}
                onPointerUp={onCanvasUp}
                onPointerCancel={onCanvasUp}
              />
              {cropMode && selectedClip && <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[11px] bg-black/70 text-white px-2 py-1 rounded-lg pointer-events-none">Crop mode: drag inside the video to pan · use the Crop sliders on the right</div>}
              {project.clips.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
                  <p className="text-slate-400 text-sm">Start by adding the original video</p>
                  <button onClick={() => originalInput.current?.click()} className="pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm"><Upload size={15} /> Upload original video</button>
                </div>
              )}
            </div>
          </div>
          <div className="h-12 shrink-0 flex items-center justify-center gap-3 border-t border-white/5">
            <button onClick={() => engineRef.current?.seek(0)} className="p-2 rounded-lg text-slate-300 hover:bg-white/10" title="Go to start"><SkipBack size={18} /></button>
            <button onClick={() => engineRef.current?.toggle()} disabled={duration === 0} className="p-2.5 rounded-full bg-white text-slate-900 hover:bg-slate-200 disabled:opacity-40" title="Play / Pause (space)">
              {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
            </button>
            <span className="font-mono text-xs text-slate-300 w-24">{fmt(time)} / {fmt(duration)}</span>
          </div>
        </main>

        {/* Right */}
        <aside className="w-[290px] shrink-0 border-l border-white/10 bg-slate-900 overflow-y-auto p-4">
          {selectedClip ? renderTrackSettings(selectedClip) : selectedText ? renderTextSettings(selectedText) : selectedCaption ? renderCaptionSettings(selectedCaption) : (
            <div className="text-sm text-slate-400 space-y-3">
              <p className="font-semibold text-white">Settings</p>
              <p>Click a video in the preview or timeline to adjust it.</p>
              <ul className="text-xs space-y-1 text-slate-500">
                <li>• Drag to move, drag corners to resize</li>
                <li>• Drag clip edges in the timeline to trim</li>
                <li>• Drag the Reaction clip to sync it with the Original</li>
                <li>• Space = play / pause · Ctrl+Z = undo</li>
              </ul>
              {project.clips.length > 0 && (
                <div className="grid grid-cols-1 gap-2 pt-2">
                  {originalClip && <button onClick={() => setSelection({ type: 'clip', id: originalClip.id })} className="px-3 py-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-200 text-left text-xs">Edit Original Video</button>}
                  {reactionClip && <button onClick={() => setSelection({ type: 'clip', id: reactionClip.id })} className="px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-200 text-left text-xs">Edit Reaction Video</button>}
                </div>
              )}
            </div>
          )}
        </aside>
      </div>

      {/* Bottom timeline */}
      <footer className="h-[190px] shrink-0 border-t border-white/10 bg-slate-900">
        <Timeline
          project={project}
          media={media}
          time={time}
          selection={selection}
          onSelect={setSelection}
          onSeek={(t) => engineRef.current?.seek(t)}
          onPatch={history.patch}
          onDragEnd={history.endDrag}
        />
      </footer>

      {/* Overlays */}
      {busy && (
        <div className="fixed inset-0 z-[90] bg-black/60 flex items-center justify-center">
          <div className="bg-slate-900 border border-white/10 rounded-xl px-6 py-4 flex items-center gap-3 text-sm"><Loader2 className="animate-spin text-sky-400" size={18} /> {busy}</div>
        </div>
      )}
      {toast && <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[95] px-4 py-2 rounded-xl text-sm shadow-xl ${toast.kind === 'ok' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>{toast.text}</div>}

      {showRecord && <RecordReactionModal original={originalAsset} onDone={handleRecorded} onClose={() => setShowRecord(false)} />}

      {showExport && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => exportProgress === null && setShowExport(false)}>
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2"><Download size={18} className="text-sky-400" /> Export Video</h3>
              {exportProgress === null && <button onClick={() => setShowExport(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {EXPORT_PRESETS.map((p) => (
                <button key={p.id} disabled={exportProgress !== null} onClick={() => setPreset(p)} className={`p-3 rounded-xl border text-left ${preset.id === p.id ? 'bg-sky-500/15 border-sky-400' : 'bg-slate-800/60 border-white/10 hover:bg-slate-700/60'}`}>
                  <span className="block text-sm font-medium text-white">{p.label}</span>
                  <span className="block text-[11px] text-slate-400">{p.width}×{p.height} · {p.fps} fps</span>
                </button>
              ))}
            </div>
            <div className="text-xs text-slate-400 bg-slate-800/60 rounded-lg p-3">
              <p>Format: <span className="text-white">MP4</span> (falls back to WebM if the browser cannot encode MP4)</p>
              <p>Resolution: <span className="text-white">{preset.width} × {preset.height}</span> · {preset.fps} FPS · {preset.bitrateMbps} Mbps</p>
              <p className="mt-1 text-slate-500">Export plays the timeline once in real time ({fmt(duration)}). Keep this tab open.</p>
            </div>
            {exportProgress !== null && (
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1"><span>Rendering…</span><span>{Math.round(exportProgress * 100)}%</span></div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all" style={{ width: `${exportProgress * 100}%` }} /></div>
              </div>
            )}
            {exportResult ? (
              <div className="space-y-2">
                <video src={exportResult.url} controls className="w-full max-h-64 rounded-lg bg-black" />
                <a href={exportResult.url} download={`reaction-video-${preset.id}.${exportResult.ext}`} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold">
                  <Download size={16} /> Download ({(exportResult.size / 1024 / 1024).toFixed(1)} MB)
                </a>
              </div>
            ) : (
              <button onClick={doExport} disabled={exportProgress !== null} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-semibold disabled:opacity-60">
                {exportProgress !== null ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} {exportProgress !== null ? 'Exporting…' : `Export for ${preset.label}`}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReactionVideoEditor;
