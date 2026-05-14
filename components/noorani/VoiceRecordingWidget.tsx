import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Volume2, RotateCcw, CheckCircle2, AlertCircle, Loader } from 'lucide-react';
import { analyzeRecordedPronunciation, PronunciationAnalysisResult } from '../../services/aiPronunciationService';

interface VoiceRecordingWidgetProps {
  letter: string;
  studentId: string;
  lessonId: string;
  onAnalysisComplete: (result: PronunciationAnalysisResult) => void;
  disabled?: boolean;
}

const VoiceRecordingWidget: React.FC<VoiceRecordingWidgetProps> = ({
  letter,
  studentId,
  lessonId,
  onAnalysisComplete,
  disabled = false,
}) => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioTrackRef = useRef<MediaStreamAudioTrack | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<PronunciationAnalysisResult | null>(null);
  const [error, setError] = useState<string>('');
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [micPermission, setMicPermission] = useState<boolean | null>(null);

  // Check microphone permission on mount
  useEffect(() => {
    const checkMicPermission = async () => {
      try {
        const result = await navigator.permissions.query({ name: 'microphone' });
        setMicPermission(result.state === 'granted');
      } catch {
        setMicPermission(null);
      }
    };
    checkMicPermission();
  }, []);

  const startRecording = async () => {
    try {
      setError('');
      setRecordingTime(0);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioTrackRef.current = stream.getAudioTracks()[0];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        setRecordedAudio(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Timer for recording duration
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      setMicPermission(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Microphone access denied';
      setError(message);
      setMicPermission(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const resetRecording = () => {
    setRecordedAudio(null);
    setAudioUrl('');
    setAnalysisResult(null);
    setError('');
    setRecordingTime(0);

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
  };

  const playRecording = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  const submitForAnalysis = async () => {
    if (!recordedAudio) {
      setError('No recording available');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      const result = await analyzeRecordedPronunciation(
        recordedAudio,
        studentId,
        lessonId,
        letter,
        recordingTime * 1000
      );

      setAnalysisResult(result);
      onAnalysisComplete(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analysis failed';
      setError(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (micPermission === false) {
    return (
      <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-5">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-red-300 font-semibold text-sm">Microphone access required</p>
            <p className="text-red-200 text-xs mt-1">
              This feature requires microphone permission. Please enable it in your browser settings.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Recording Controls */}
      <div className="rounded-2xl bg-slate-800/60 border border-white/10 p-5">
        <p className="text-sm text-slate-300 mb-4 flex items-center gap-2">
          <Mic size={14} className="text-primary-400" />
          Record yourself saying the letter <span className="text-2xl font-arabic text-primary-300">{letter}</span>
        </p>

        <div className="space-y-4">
          {/* Recording Time Display */}
          {(isRecording || recordingTime > 0) && (
            <div className="flex items-center justify-between bg-black/30 rounded-lg p-3">
              <div className="flex items-center gap-2">
                {isRecording && (
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
                <span className="text-sm font-mono text-slate-300">
                  {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}
                </span>
              </div>
              <span className="text-xs text-slate-500">
                {isRecording ? 'Recording...' : 'Recorded'}
              </span>
            </div>
          )}

          {/* Record Button */}
          {!isRecording && !recordedAudio && (
            <button
              type="button"
              onClick={startRecording}
              disabled={disabled || isAnalyzing}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-gradient-to-r from-primary-500/20 to-accent-500/20 border border-primary-500/40 text-primary-200 font-bold hover:from-primary-500/30 hover:to-accent-500/30 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Mic size={18} />
              Start Recording
            </button>
          )}

          {/* Stop Button */}
          {isRecording && (
            <button
              type="button"
              onClick={stopRecording}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 font-bold hover:bg-red-500/30 transition"
            >
              <Square size={18} />
              Stop Recording
            </button>
          )}

          {/* Playback Controls */}
          {recordedAudio && !isRecording && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={playRecording}
                disabled={isAnalyzing}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 text-slate-200 hover:bg-white/20 transition disabled:opacity-40 font-semibold text-sm"
              >
                <Volume2 size={16} />
                Play
              </button>
              <button
                type="button"
                onClick={resetRecording}
                disabled={isAnalyzing}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 transition disabled:opacity-40 font-semibold text-sm"
              >
                <RotateCcw size={16} />
                Retake
              </button>
            </div>
          )}

          {/* Submit Button */}
          {recordedAudio && !isRecording && (
            <button
              type="button"
              onClick={submitForAnalysis}
              disabled={isAnalyzing}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-gradient-to-r from-accent-500 to-primary-500 text-white font-bold hover:from-accent-400 hover:to-primary-400 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  Analyze & Proceed
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Analysis Result */}
      {analysisResult && (
        <div className="space-y-3">
          {/* Overall Score */}
          <div className="rounded-2xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 border border-primary-500/20 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-200">Overall Accuracy</p>
              <p className="text-3xl font-black text-primary-300">
                {analysisResult.analysis.overallAccuracy}%
              </p>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all"
                style={{ width: `${analysisResult.analysis.overallAccuracy}%` }}
              />
            </div>
          </div>

          {/* Letter-by-Letter Scores */}
          {analysisResult.analysis.letterScores.length > 0 && (
            <div className="rounded-2xl bg-slate-800/60 border border-white/10 p-4">
              <p className="text-xs font-bold text-accent-300 uppercase tracking-[0.2em] mb-3">
                Pronunciation Details
              </p>
              {analysisResult.analysis.letterScores.map((score, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-b-0">
                  <div className="flex items-center gap-3">
                    <p className="text-2xl font-arabic text-white">{score.letter}</p>
                    <div>
                      <p className="text-xs text-slate-400 uppercase">{score.makhrajQuality}</p>
                      <p className="text-xs text-slate-500">{score.details}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-black text-lg ${
                      score.accuracy >= 85
                        ? 'text-green-400'
                        : score.accuracy >= 70
                          ? 'text-yellow-400'
                          : 'text-red-400'
                    }`}>
                      {score.accuracy}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recommendations */}
          {analysisResult.analysis.recommendations.length > 0 && (
            <div className="rounded-2xl bg-blue-500/10 border border-blue-500/20 p-4">
              <p className="text-xs font-bold text-blue-300 uppercase tracking-[0.2em] mb-2">
                Recommendations
              </p>
              <ul className="space-y-1">
                {analysisResult.analysis.recommendations.map((rec, i) => (
                  <li key={i} className="text-xs text-blue-200 flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Steps */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={resetRecording}
              className="flex-1 py-3 rounded-lg bg-white/10 text-slate-200 hover:bg-white/20 transition font-semibold text-sm"
            >
              Try Again
            </button>
            {analysisResult.analysis.passedThreshold && (
              <button
                type="button"
                onClick={() => {
                  /* Parent component will handle next step */
                }}
                className="flex-1 py-3 rounded-lg bg-green-500/20 text-green-200 hover:bg-green-500/30 transition font-semibold text-sm"
              >
                ✓ Passed
              </button>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-4 flex items-start gap-3">
          <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};

export default VoiceRecordingWidget;
