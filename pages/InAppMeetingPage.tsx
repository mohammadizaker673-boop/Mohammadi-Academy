import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Camera, CameraOff, Copy, Mic, MicOff, PhoneOff, RotateCcw, Users } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { canJoinLiveClass, getLiveClassSessionById, markLiveClassStatus, type LiveClassSession } from '../services/liveClassService';

interface SignalPayload {
  from: string;
  to?: string;
  type: 'offer' | 'answer' | 'candidate' | 'bye';
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

const InAppMeetingPage: React.FC = () => {
  const { roomId, sessionId } = useParams<{ roomId?: string; sessionId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [guestName, setGuestName] = React.useState('');
  const [guestReady, setGuestReady] = React.useState(false);

  const localVideoRef = React.useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = React.useRef<HTMLVideoElement | null>(null);
  const channelRef = React.useRef<any>(null);
  const peerConnectionRef = React.useRef<RTCPeerConnection | null>(null);
  const localStreamRef = React.useRef<MediaStream | null>(null);
  const remoteStreamRef = React.useRef<MediaStream>(new MediaStream());
  const remotePeerIdRef = React.useRef<string | null>(null);
  const hasSentOfferRef = React.useRef(false);
  const clientIdRef = React.useRef<string>(crypto.randomUUID());

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [cameraEnabled, setCameraEnabled] = React.useState(true);
  const [micEnabled, setMicEnabled] = React.useState(true);
  const [cameraUnavailable, setCameraUnavailable] = React.useState(false);
  const [remoteConnected, setRemoteConnected] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [session, setSession] = React.useState<LiveClassSession | null>(null);
  const [resolvedRoomId, setResolvedRoomId] = React.useState(roomId || '');

  const meetingUrl = `${window.location.origin}/${sessionId ? `class/${sessionId}` : `meeting/${resolvedRoomId}`}`;

  const identityName = user?.displayName || user?.email || guestName.trim();

  const getBackPath = React.useMemo(() => {
    if (!user) return '/meetings';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'teacher') return '/teacher';
    return '/student';
  }, [user]);

  const sendSignal = React.useCallback(async (payload: SignalPayload) => {
    if (!channelRef.current) return;
    await channelRef.current.send({
      type: 'broadcast',
      event: 'signal',
      payload,
    });
  }, []);

  const createOffer = React.useCallback(async () => {
    const pc = peerConnectionRef.current;
    const remotePeerId = remotePeerIdRef.current;
    if (!pc || !remotePeerId || hasSentOfferRef.current) {
      return;
    }

    hasSentOfferRef.current = true;
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    await sendSignal({
      from: clientIdRef.current,
      to: remotePeerId,
      type: 'offer',
      sdp: offer,
    });
  }, [sendSignal]);

  const ensurePeerConnection = React.useCallback(async () => {
    if (peerConnectionRef.current) {
      return peerConnectionRef.current;
    }

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    pc.onicecandidate = async (event) => {
      if (!event.candidate) return;
      await sendSignal({
        from: clientIdRef.current,
        to: remotePeerIdRef.current || undefined,
        type: 'candidate',
        candidate: event.candidate.toJSON(),
      });
    };

    pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStreamRef.current.addTrack(track);
      });
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStreamRef.current;
      }
      setRemoteConnected(true);
    };

    const localStream = localStreamRef.current;
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
    }

    peerConnectionRef.current = pc;
    return pc;
  }, [sendSignal]);

  React.useEffect(() => {
    if (!roomId && !sessionId) {
      setError('Invalid meeting room.');
      setLoading(false);
      return;
    }

    if (!user && !guestReady) {
      setLoading(false);
      return;
    }

    if (!identityName) {
      setLoading(false);
      return;
    }

    let active = true;

    const initializeMeeting = async () => {
      try {
        setLoading(true);
        setError('');

        let activeRoomId = roomId || '';
        if (sessionId) {
          const liveSession = await getLiveClassSessionById(sessionId);
          if (!liveSession) {
            setError('Class session not found. Ask your teacher to reschedule this lesson.');
            setLoading(false);
            return;
          }
          if (!canJoinLiveClass(liveSession)) {
            setSession(liveSession);
            setError('This class is not open yet. You can join 15 minutes before the scheduled start time.');
            setLoading(false);
            return;
          }

          activeRoomId = liveSession.roomId;
          setResolvedRoomId(activeRoomId);
          setSession(liveSession);
          void markLiveClassStatus(liveSession.id, 'live');
        }

        const mediaConstraints: MediaStreamConstraints = {
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        };

        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
          setCameraUnavailable(false);
        } catch (mediaError) {
          // If camera fails, keep lesson functional by falling back to audio-only.
          stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          setCameraEnabled(false);
          setCameraUnavailable(true);
        }
        if (!active) return;

        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          void localVideoRef.current.play().catch(() => undefined);
        }

        await ensurePeerConnection();

        const channel = supabase.channel(`meeting-room-${activeRoomId}`, {
          config: {
            broadcast: { self: false },
            presence: { key: clientIdRef.current },
          },
        });

        channelRef.current = channel;

        channel.on('broadcast', { event: 'signal' }, async ({ payload }: { payload: SignalPayload }) => {
          if (!active) return;
          if (!payload || payload.from === clientIdRef.current) return;
          if (payload.to && payload.to !== clientIdRef.current) return;

          if (!remotePeerIdRef.current) {
            remotePeerIdRef.current = payload.from;
          }

          const pc = await ensurePeerConnection();

          if (payload.type === 'offer' && payload.sdp) {
            await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            await sendSignal({
              from: clientIdRef.current,
              to: payload.from,
              type: 'answer',
              sdp: answer,
            });
          }

          if (payload.type === 'answer' && payload.sdp) {
            await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
            setRemoteConnected(true);
          }

          if (payload.type === 'candidate' && payload.candidate) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
            } catch (candidateError) {
              console.warn('ICE candidate apply skipped:', candidateError);
            }
          }

          if (payload.type === 'bye') {
            setRemoteConnected(false);
          }
        });

        channel.on('presence', { event: 'sync' }, async () => {
          const state = channel.presenceState();
          const peers = Object.values(state)
            .flat()
            .map((entry: any) => entry.clientId as string)
            .filter((id: string) => id && id !== clientIdRef.current);

          if (peers.length > 0 && !remotePeerIdRef.current) {
            peers.sort();
            remotePeerIdRef.current = peers[0];
          }

          const remotePeerId = remotePeerIdRef.current;
          if (remotePeerId && clientIdRef.current < remotePeerId) {
            await createOffer();
          }
        });

        await channel.subscribe(async (status: string) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({
              clientId: clientIdRef.current,
              userId: user?.uid || `guest-${clientIdRef.current.slice(0, 8)}`,
              name: identityName,
            });
          }
        });
      } catch (err: any) {
        console.error('Meeting initialization error:', err);
        setError(err?.message || 'Failed to initialize video meeting.');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void initializeMeeting();

    return () => {
      active = false;
      const channel = channelRef.current;
      if (channel) {
        void sendSignal({ from: clientIdRef.current, type: 'bye' });
        void channel.unsubscribe();
      }
      channelRef.current = null;

      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      const localStream = localStreamRef.current;
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      localStreamRef.current = null;

      remoteStreamRef.current.getTracks().forEach((track) => track.stop());
      remoteStreamRef.current = new MediaStream();
      remotePeerIdRef.current = null;
      hasSentOfferRef.current = false;

      if (sessionId) {
        void markLiveClassStatus(sessionId, 'completed');
      }
    };
  }, [roomId, sessionId, user, guestReady, identityName, ensurePeerConnection, createOffer, sendSignal]);
  if (!user && !guestReady) {
    return (
      <div className="min-h-screen bg-[#0a0f2b] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-slate-900/70 border border-white/10 rounded-2xl p-6">
          <h1 className="text-2xl font-black text-white mb-2">Join Meeting as Guest</h1>
          <p className="text-slate-400 text-sm mb-5">Enter your name to join this in-app meeting room.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!guestName.trim()) return;
              setGuestReady(true);
              setLoading(true);
            }}
            className="space-y-4"
          >
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Your full name"
              className="w-full px-4 py-3 bg-slate-800/70 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-primary-500"
            />
            <button
              type="submit"
              className="w-full px-4 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-bold"
            >
              Continue to Meeting
            </button>
            <Link to="/meetings" className="block text-center text-sm text-slate-400 hover:text-slate-200">
              Back to Meetings
            </Link>
          </form>
        </div>
      </div>
    );
  }


  const toggleMic = () => {
    const stream = localStreamRef.current;
    if (!stream) return;

    const nextEnabled = !micEnabled;
    stream.getAudioTracks().forEach((track) => {
      track.enabled = nextEnabled;
    });
    setMicEnabled(nextEnabled);
  };

  const toggleCamera = () => {
    const stream = localStreamRef.current;
    if (!stream) return;

    const nextEnabled = !cameraEnabled;
    stream.getVideoTracks().forEach((track) => {
      track.enabled = nextEnabled;
    });
    setCameraEnabled(nextEnabled);
  };

  const retryCamera = async () => {
    try {
      const stream = localStreamRef.current;
      if (!stream) return;

      const camStream = await navigator.mediaDevices.getUserMedia({ video: true });
      const [camTrack] = camStream.getVideoTracks();
      if (!camTrack) return;

      const sender = peerConnectionRef.current?.getSenders().find((s) => s.track?.kind === 'video');
      if (sender) {
        await sender.replaceTrack(camTrack);
      } else {
        peerConnectionRef.current?.addTrack(camTrack, stream);
      }

      stream.getVideoTracks().forEach((track) => track.stop());
      stream.addTrack(camTrack);
      setCameraEnabled(true);
      setCameraUnavailable(false);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (cameraError) {
      console.error('Retry camera failed:', cameraError);
      setError('Camera still unavailable. Check browser permission and device usage by other apps.');
    }
  };

  const copyMeetingLink = async () => {
    try {
      await navigator.clipboard.writeText(meetingUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f2b] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-300">Joining in-app meeting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f2b] px-4 py-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white">In-App Meeting Room</h1>
            <p className="text-slate-400">{session ? `${session.lessonTitle} • ${new Date(session.startsAt).toLocaleString()}` : 'Live class room'}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={copyMeetingLink}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-sm font-semibold flex items-center gap-2"
            >
              <Copy size={16} />
              {copied ? 'Copied' : 'Copy Invite Link'}
            </button>
            <Link
              to={getBackPath}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-sm font-semibold"
            >
              Back
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200 text-sm">
            {error}
          </div>
        )}

        {cameraUnavailable && (
          <div className="p-4 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-100 text-sm flex items-center justify-between gap-4">
            <span>Camera is currently unavailable. You are connected with audio. You can retry camera anytime.</span>
            <button
              onClick={retryCamera}
              className="px-3 py-2 bg-amber-500/30 hover:bg-amber-500/40 rounded-lg text-xs font-bold inline-flex items-center gap-2"
            >
              <RotateCcw size={14} />
              Retry Camera
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-4">
            <p className="text-slate-300 text-sm mb-3">You</p>
            <video ref={localVideoRef} autoPlay muted playsInline className="w-full aspect-video bg-black rounded-xl object-cover" />
          </div>
          <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-4">
            <p className="text-slate-300 text-sm mb-3">Remote Participant</p>
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full aspect-video bg-black rounded-xl object-cover" />
            <div className="mt-3 text-xs text-slate-400 flex items-center gap-2">
              <Users size={14} />
              {remoteConnected ? 'Connected' : 'Waiting for participant to join...'}
            </div>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-4 flex flex-wrap gap-3">
          <button
            onClick={toggleMic}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 ${
              micEnabled ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-red-600 hover:bg-red-500 text-white'
            }`}
          >
            {micEnabled ? <Mic size={16} /> : <MicOff size={16} />}
            {micEnabled ? 'Mute Mic' : 'Unmute Mic'}
          </button>
          <button
            onClick={toggleCamera}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 ${
              cameraEnabled ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-red-600 hover:bg-red-500 text-white'
            }`}
          >
            {cameraEnabled ? <Camera size={16} /> : <CameraOff size={16} />}
            {cameraEnabled ? 'Turn Camera Off' : 'Turn Camera On'}
          </button>
          <Link
            to={getBackPath}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-700 hover:bg-red-600 text-white inline-flex items-center gap-2"
          >
            <PhoneOff size={16} />
            Leave Meeting
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InAppMeetingPage;
