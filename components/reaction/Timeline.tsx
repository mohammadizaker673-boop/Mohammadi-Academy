import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Film, Video } from 'lucide-react';
import { Clip, MediaAsset, Project, Selection, TrackKind, clipDuration, clipEnd, projectDuration } from './types';

interface Props {
  project: Project;
  media: Map<string, MediaAsset>;
  time: number;
  selection: Selection;
  onSelect: (s: Selection) => void;
  onSeek: (t: number) => void;
  onPatch: (fn: (p: Project) => Project) => void;
  onDragEnd: () => void;
}

const fmt = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  const d = Math.floor((s % 1) * 10);
  return `${m}:${sec.toString().padStart(2, '0')}.${d}`;
};

const TRACKS: { id: TrackKind; label: string; color: string; icon: React.ReactNode }[] = [
  { id: 'original', label: 'Original Video', color: 'from-sky-500/80 to-sky-600/80 border-sky-300/40', icon: <Film size={14} /> },
  { id: 'reaction', label: 'Reaction Video', color: 'from-rose-500/80 to-rose-600/80 border-rose-300/40', icon: <Video size={14} /> },
];

type DragMode = 'move' | 'trim-start' | 'trim-end' | 'scrub';

const Timeline: React.FC<Props> = ({ project, media, time, selection, onSelect, onSeek, onPatch, onDragEnd }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(40); // px per second
  const [width, setWidth] = useState(800);
  const dragRef = useRef<{ mode: DragMode; clipId?: string; startX: number; orig?: Clip } | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const duration = projectDuration(project);
  const LABEL_W = 132;
  const totalSec = Math.max(duration + 5, (width - LABEL_W) / zoom);
  const trackW = totalSec * zoom;

  const ticks = useMemo(() => {
    const step = zoom >= 80 ? 1 : zoom >= 40 ? 2 : zoom >= 20 ? 5 : 10;
    const arr: number[] = [];
    for (let s = 0; s <= totalSec; s += step) arr.push(s);
    return arr;
  }, [zoom, totalSec]);

  const xToTime = (clientX: number) => {
    const el = scrollRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    return Math.max(0, (clientX - rect.left - LABEL_W + el.scrollLeft) / zoom);
  };

  const startDrag = (e: React.PointerEvent, mode: DragMode, clip?: Clip) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    dragRef.current = { mode, clipId: clip?.id, startX: e.clientX, orig: clip ? { ...clip } : undefined };
    if (clip) onSelect({ type: 'clip', id: clip.id });
    if (mode === 'scrub') onSeek(xToTime(e.clientX));
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    if (d.mode === 'scrub') {
      onSeek(xToTime(e.clientX));
      return;
    }
    const dx = (e.clientX - d.startX) / zoom;
    const orig = d.orig!;
    const asset = media.get(orig.mediaId);
    const maxSrc = asset?.duration ?? orig.trimEnd;
    onPatch((p) => ({
      ...p,
      clips: p.clips.map((c) => {
        if (c.id !== d.clipId) return c;
        if (d.mode === 'move') {
          return { ...c, start: Math.max(0, orig.start + dx) };
        }
        if (d.mode === 'trim-start') {
          const delta = Math.max(-orig.trimStart / orig.speed, Math.min(dx, clipDuration(orig) - 0.2));
          return { ...c, start: Math.max(0, orig.start + delta), trimStart: orig.trimStart + delta * orig.speed };
        }
        // trim-end
        const newEnd = Math.min(maxSrc, Math.max(orig.trimStart + 0.2 * orig.speed, orig.trimEnd + dx * orig.speed));
        return { ...c, trimEnd: newEnd };
      }),
    }));
  };

  const onPointerUp = () => {
    if (dragRef.current && dragRef.current.mode !== 'scrub') onDragEnd();
    dragRef.current = null;
  };

  const playheadX = LABEL_W + time * zoom;

  return (
    <div className="flex flex-col h-full select-none">
      <div className="flex items-center gap-3 px-3 py-1.5 border-b border-white/10 text-xs text-slate-400">
        <span className="font-mono text-slate-200">{fmt(time)}</span>
        <span>/ {fmt(duration)}</span>
        <span className="hidden sm:inline text-slate-500">· Drag the Reaction clip left / right until it lines up with the Original.</span>
        <div className="flex-1" />
        <label className="flex items-center gap-2">
          Zoom
          <input type="range" min={10} max={160} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-24 accent-sky-500" />
        </label>
      </div>

      <div ref={scrollRef} className="relative flex-1 overflow-x-auto overflow-y-hidden" onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}>
        <div style={{ width: LABEL_W + trackW, minWidth: '100%' }} className="relative">
          {/* ruler */}
          <div className="flex h-6 border-b border-white/10 sticky top-0 bg-slate-900/95 z-10">
            <div className="shrink-0 sticky left-0 bg-slate-900 z-20" style={{ width: LABEL_W }} />
            <div className="relative flex-1 cursor-pointer" onPointerDown={(e) => startDrag(e, 'scrub')}>
              {ticks.map((s) => (
                <div key={s} className="absolute top-0 h-full border-l border-white/15 text-[10px] text-slate-500 pl-1" style={{ left: s * zoom }}>
                  {s % (zoom >= 40 ? 2 : 10) === 0 ? fmt(s).replace(/\.\d$/, '') : ''}
                </div>
              ))}
            </div>
          </div>

          {TRACKS.map((track) => {
            const clips = project.clips.filter((c) => c.track === track.id);
            return (
              <div key={track.id} className="flex h-16 border-b border-white/5">
                <div className="shrink-0 sticky left-0 z-20 bg-slate-900 border-r border-white/10 px-3 flex items-center gap-2 text-xs font-medium text-slate-200" style={{ width: LABEL_W }}>
                  <span className={track.id === 'original' ? 'text-sky-400' : 'text-rose-400'}>{track.icon}</span>
                  {track.label}
                </div>
                <div className="relative flex-1 bg-slate-950/40" onPointerDown={(e) => startDrag(e, 'scrub')}>
                  {clips.length === 0 && <div className="absolute inset-0 flex items-center pl-4 text-xs text-slate-600">Empty – add a video from the Media panel</div>}
                  {clips.map((clip) => {
                    const asset = media.get(clip.mediaId);
                    const selected = selection?.type === 'clip' && selection.id === clip.id;
                    return (
                      <div
                        key={clip.id}
                        className={`absolute top-2 bottom-2 rounded-lg border bg-gradient-to-b ${track.color} ${selected ? 'ring-2 ring-white shadow-lg' : ''} cursor-grab active:cursor-grabbing overflow-hidden`}
                        style={{ left: clip.start * zoom, width: Math.max(8, clipDuration(clip) * zoom) }}
                        onPointerDown={(e) => startDrag(e, 'move', clip)}
                        title={`${asset?.name || ''}  ${fmt(clip.start)} → ${fmt(clipEnd(clip))}`}
                      >
                        <div className="px-2 py-1 text-[11px] text-white truncate font-medium flex items-center gap-1">
                          {clip.muted && <span className="opacity-80">🔇</span>}
                          {clip.speed !== 1 && <span className="opacity-80">{clip.speed}x</span>}
                          {asset?.name || 'Video'}
                        </div>
                        <div className="px-2 text-[10px] text-white/70">{fmt(clipDuration(clip))}</div>
                        <div className="absolute left-0 top-0 bottom-0 w-2.5 cursor-ew-resize bg-white/30 hover:bg-white/60" onPointerDown={(e) => startDrag(e, 'trim-start', clip)} />
                        <div className="absolute right-0 top-0 bottom-0 w-2.5 cursor-ew-resize bg-white/30 hover:bg-white/60" onPointerDown={(e) => startDrag(e, 'trim-end', clip)} />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* captions strip */}
          {project.captions.length > 0 && (
            <div className="flex h-8 border-b border-white/5">
              <div className="shrink-0 sticky left-0 z-20 bg-slate-900 border-r border-white/10 px-3 flex items-center text-[11px] text-slate-400" style={{ width: LABEL_W }}>
                Captions
              </div>
              <div className="relative flex-1" onPointerDown={(e) => startDrag(e, 'scrub')}>
                {project.captions.map((c) => (
                  <div
                    key={c.id}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      onSelect({ type: 'caption', id: c.id });
                      onSeek(c.start + 0.01);
                    }}
                    className={`absolute top-1 bottom-1 rounded bg-amber-400/70 border border-amber-200/40 text-[10px] text-black px-1 truncate cursor-pointer ${selection?.type === 'caption' && selection.id === c.id ? 'ring-2 ring-white' : ''}`}
                    style={{ left: c.start * zoom, width: Math.max(6, (c.end - c.start) * zoom) }}
                  >
                    {c.text}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* playhead */}
          <div className="absolute top-0 bottom-0 w-px bg-white pointer-events-none z-30" style={{ left: playheadX }}>
            <div className="w-3 h-3 -ml-1.5 bg-white rotate-45 -mt-1" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
