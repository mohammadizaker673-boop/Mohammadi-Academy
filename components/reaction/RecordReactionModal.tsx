import React, { useEffect, useRef, useState } from 'react';
import { Camera, Mic, MicOff, Square, Video, X } from 'lucide-react';
import { MediaAsset } from './types';

interface Props {
  original: MediaAsset | null;
  /** Timeline position (seconds) of the original clip's first frame – recording starts aligned to it. */
  onDone: (blob: Blob, opts: { mirrored: boolean }) => void;
  onClose: () => void;
}

type Phase = 'setup' | 'countdown' | 'recording' | 'error';

const RecordReactionModal: React.FC<Props> = ({ original, onDone, onClose }) => {
  const [phase, setPhase] = useState<Phase>('setup');
  const [error, setError] = useState('');
  const [micOn, setMicOn] = useState(true);
  const [mirror, setMirror] = useState(true);
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const [cams, setCams] = useState<MediaDeviceInfo[]>([]);
  const [micId, setMicId] = useState('');
  const [camId, setCamId] = useState('');
  const [count, setCount] = useState(3);
  const [elapsed, setElapsed] = useState(0);

  const camRef = useRef<HTMLVideoElement>(null);
  const origRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number>(0);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const openStream = async () => {
    stopStream();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: camId ? { deviceId: { exact: camId }, width: { ideal: 1280 }, height: { ideal: 720 } } : { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: micOn ? (micId ? { deviceId: { exact: micId }, echoCancellation: true, noiseSuppression: true } : { echoCancellation: true, noiseSuppression: true }) : false,
      });
      streamRef.current = stream;
      if (camRef.current) {
        camRef.current.srcObject = stream;
        camRef.current.play().catch(() => undefined);
      }
      const devices = await navigator.mediaDevices.enumerateDevices();
      setMics(devices.filter((d) => d.kind === 'audioinput'));
      setCams(devices.filter((d) => d.kind === 'videoinput'));
      setError('');
    } catch (e: any) {
      setError(e?.message?.includes('Permission') || e?.name === 'NotAllowedError' ? 'Camera/microphone permission was denied. Please allow access and try again.' : e?.message || 'Could not open the camera.');
      setPhase('error');
    }
  };

  useEffect(() => {
    openStream();
    return () => {
      stopStream();
      window.clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [micOn, micId, camId]);

  const startCountdown = () => {
    if (!streamRef.current) return;
    setPhase('countdown');
    setCount(3);
    let n = 3;
    const id = window.setInterval(() => {
      n -= 1;
      if (n <= 0) {
        window.clearInterval(id);
        startRecording();
      } else {
        setCount(n);
      }
    }, 1000);
  };

  const startRecording = () => {
    const stream = streamRef.current;
    if (!stream) return;
    const mimes = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
    const mime = mimes.find((m) => MediaRecorder.isTypeSupported(m)) || '';
    const rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 6_000_000 } : undefined);
    chunksRef.current = [];
    rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
    rec.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mime.split(';')[0] || 'video/webm' });
      stopStream();
      onDone(blob, { mirrored: mirror });
    };
    recRef.current = rec;
    rec.start(250);
    setPhase('recording');
    setElapsed(0);
    const startedAt = performance.now();
    timerRef.current = window.setInterval(() => setElapsed((performance.now() - startedAt) / 1000), 200);
    // play original in sync – with a quiet volume so the mic doesn't pick up too much
    if (origRef.current) {
      origRef.current.currentTime = 0;
      origRef.current.volume = 0.5;
      origRef.current.play().catch(() => undefined);
      origRef.current.onended = () => stopRecording();
    }
  };

  const stopRecording = () => {
    window.clearInterval(timerRef.current);
    origRef.current?.pause();
    if (recRef.current && recRef.current.state !== 'inactive') recRef.current.stop();
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={phase === 'recording' ? undefined : onClose}>
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Video size={18} className="text-rose-400" /> Record Reaction
          </h3>
          {phase !== 'recording' && (
            <button onClick={onClose} className="text-slate-400 hover:text-white" aria-label="Close">
              <X size={20} />
            </button>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-3 p-4 bg-black">
          <div className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden">
            {original ? (
              <video ref={origRef} src={original.url} className="w-full h-full object-contain" playsInline preload="auto" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">No original video – you can still record.</div>
            )}
            <span className="absolute top-2 left-2 text-[11px] bg-black/60 text-white px-2 py-0.5 rounded">Original</span>
          </div>
          <div className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden">
            <video ref={camRef} muted playsInline className="w-full h-full object-cover" style={{ transform: mirror ? 'scaleX(-1)' : undefined }} />
            <span className="absolute top-2 left-2 text-[11px] bg-black/60 text-white px-2 py-0.5 rounded">Your camera</span>
            {phase === 'recording' && (
              <span className="absolute top-2 right-2 text-xs font-mono bg-rose-600 text-white px-2 py-0.5 rounded flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> REC {fmt(elapsed)}
              </span>
            )}
            {phase === 'countdown' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <span className="text-8xl font-black text-white drop-shadow-lg animate-pulse">{count}</span>
              </div>
            )}
          </div>
        </div>

        {phase === 'error' && <div className="mx-4 mb-2 text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg p-3">{error}</div>}

        <div className="p-4 flex flex-wrap items-center gap-3 border-t border-white/10">
          <button
            onClick={() => setMicOn((v) => !v)}
            disabled={phase === 'recording'}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border ${micOn ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200' : 'bg-slate-800 border-white/10 text-slate-300'}`}
          >
            {micOn ? <Mic size={16} /> : <MicOff size={16} />} {micOn ? 'Microphone on' : 'Microphone off'}
          </button>
          {micOn && mics.length > 1 && (
            <select value={micId} onChange={(e) => setMicId(e.target.value)} className="bg-slate-800 border border-white/10 text-slate-200 text-sm rounded-lg px-2 py-2 max-w-[180px]">
              <option value="">Default mic</option>
              {mics.map((m) => (
                <option key={m.deviceId} value={m.deviceId}>
                  {m.label || 'Microphone'}
                </option>
              ))}
            </select>
          )}
          {cams.length > 1 && (
            <select value={camId} onChange={(e) => setCamId(e.target.value)} className="bg-slate-800 border border-white/10 text-slate-200 text-sm rounded-lg px-2 py-2 max-w-[180px]">
              <option value="">Default camera</option>
              {cams.map((c) => (
                <option key={c.deviceId} value={c.deviceId}>
                  {c.label || 'Camera'}
                </option>
              ))}
            </select>
          )}
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input type="checkbox" checked={mirror} onChange={(e) => setMirror(e.target.checked)} className="accent-sky-500" /> Mirror preview
          </label>
          <div className="flex-1" />
          {phase === 'recording' ? (
            <button onClick={stopRecording} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-900 font-semibold hover:bg-slate-200">
              <Square size={16} fill="currentColor" /> Stop & add to timeline
            </button>
          ) : (
            <button
              onClick={phase === 'error' ? openStream : startCountdown}
              disabled={phase === 'countdown'}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold disabled:opacity-50"
            >
              <Camera size={16} /> {phase === 'error' ? 'Retry camera' : 'Start (3s countdown)'}
            </button>
          )}
        </div>
        <p className="px-4 pb-4 text-xs text-slate-500">The original video plays while you record so your reaction is already in sync. Use headphones for the cleanest audio.</p>
      </div>
    </div>
  );
};

export default RecordReactionModal;
