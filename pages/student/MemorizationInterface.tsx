import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, RotateCcw, Mic, Upload, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

const MemorizationInterface: React.FC = () => {
  const [recording, setRecording] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [textVisible, setTextVisible] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Mock Quranic page data (Page 234)
  const pageData = {
    juzNumber: 12,
    pageNumber: 234,
    surahName: 'Surah At-Tawbah',
    ayahRange: '45-67',
    arabicText: `الم۔ ذٰلِكَ الْكِتٰبُ لَا رَیْبَ فِیۡہِ ہُدًی لِّلْمُتَّقِیْنَ۔ الَّذِیْنَ یُؤْمِنُوْنَ بِالْغَیْبِ وَیُقِیْمُوْنَ الصَّلٰوۃَ وَمِمَّا رَزَقْنٰہُمْ یُنْفِقُوْنَ۔`,
    transliteration: `Alif Laam Meem. Dhaalika al-kitabu la rayba fee hi hudan lil-muttaqeen.`,
    translation: `This is the Book; in it is guidance sure, without doubt, to those who fear Allah.`,
    reciter: 'Mishary Rashid Alafasy',
    audioUrl: 'https://example.com/audio.mp3',
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        recordedChunksRef.current.push(event.data);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setRecording(true);

      // Simulate recording time
      let time = 0;
      const timer = setInterval(() => {
        time += 1;
        setRecordingTime(time);
        if (!recording && time > 0) clearInterval(timer);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(recordedChunksRef.current, { type: 'audio/wav' });
        console.log('Recording saved:', audioBlob);
        recordedChunksRef.current = [];
      };
    }
  };

  const handleSubmitRecording = () => {
    console.log('Submitting recording for teacher review...');
    alert('Recording submitted for teacher review. You will receive feedback shortly.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f2b] via-[#0e1436] to-[#131b41] text-slate-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              Memorization Session
            </h1>
            <p className="text-slate-400 mt-2">Page {pageData.pageNumber} • {pageData.surahName} • Ayah {pageData.ayahRange}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">Juz {pageData.juzNumber}</p>
            <p className="text-xs text-slate-500">Reciter: {pageData.reciter}</p>
          </div>
        </div>
      </div>

      {/* Main Memorization Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Quranic Text Panel */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/10 border border-slate-600/30 rounded-lg p-8">
            {/* Arabic Text */}
            <div className="mb-8 p-6 bg-blue-900/20 border border-blue-400/30 rounded-lg">
              <p className="text-right text-4xl font-arabic leading-relaxed text-blue-100">
                {textVisible ? pageData.arabicText : '••••••••••••••••••••••••••••'}
              </p>
              <div className="flex justify-between mt-4">
                <button
                  onClick={() => setTextVisible(!textVisible)}
                  className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                >
                  {textVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                  {textVisible ? 'Hide Text' : 'Show Text'}
                </button>
                <span className="text-xs text-blue-300">Madani Script • 16-Line Format</span>
              </div>
            </div>

            {/* Transliteration */}
            <div className="mb-6 p-4 bg-slate-900/30 rounded">
              <p className="text-sm text-slate-400 mb-2">Transliteration:</p>
              <p className="text-slate-200">{pageData.transliteration}</p>
            </div>

            {/* Translation */}
            <div className="p-4 bg-slate-900/30 rounded">
              <p className="text-sm text-slate-400 mb-2">Translation (English):</p>
              <p className="text-slate-200">{pageData.translation}</p>
            </div>
          </div>
        </div>

        {/* Audio & Recording Controls */}
        <div className="space-y-4">
          {/* Audio Player */}
          <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-600/10 border border-emerald-400/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">🎵 Audio Reference</h3>

            {/* Reciter Selection */}
            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-2">Choose Reciter:</label>
              <select className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-100">
                <option>Mishary Rashid Alafasy</option>
                <option>Maher Al-Muaiqly</option>
                <option>Khalid Al-Jalil</option>
                <option>Hani Al-Rifai</option>
              </select>
            </div>

            {/* Playback Controls */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setAudioPlaying(!audioPlaying)}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  {audioPlaying ? <Pause size={20} /> : <Play size={20} />}
                  {audioPlaying ? 'Pause' : 'Play'}
                </button>
                <button className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg">
                  <RotateCcw size={20} />
                </button>
              </div>

              {/* Playback Speed */}
              <div>
                <label className="block text-xs text-slate-400 mb-2">Speed:</label>
                <div className="flex gap-1">
                  {[0.75, 1, 1.25, 1.5].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setPlaybackSpeed(speed)}
                      className={`px-2 py-1 text-xs rounded ${
                        playbackSpeed === speed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Volume */}
              <div>
                <label className="block text-xs text-slate-400 mb-2">Volume:</label>
                <div className="flex items-center gap-2">
                  <Volume2 size={16} className="text-slate-400" />
                  <input type="range" min="0" max="100" defaultValue="70" className="flex-1" />
                </div>
              </div>
            </div>
          </div>

          {/* Recording Interface */}
          <div className="bg-gradient-to-br from-purple-900/30 to-purple-600/10 border border-purple-400/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">🎙️ Record Recitation</h3>

            {/* Recording Status */}
            <div
              className={`p-3 rounded-lg mb-4 text-sm ${
                recording ? 'bg-red-500/20 border border-red-400/50' : 'bg-slate-900/30 border border-slate-600/30'
              }`}
            >
              {recording ? (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span>Recording... {recordingTime}s</span>
                </div>
              ) : (
                <span className="text-slate-400">Ready to record</span>
              )}
            </div>

            {/* Recording Controls */}
            <div className="space-y-3">
              <button
                onClick={recording ? handleStopRecording : handleStartRecording}
                className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
                  recording
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-purple-500 hover:bg-purple-600'
                }`}
              >
                <Mic size={20} />
                {recording ? 'Stop Recording' : 'Start Recording'}
              </button>

              {recordingTime > 0 && !recording && (
                <button
                  onClick={handleSubmitRecording}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  <Upload size={20} />
                  Submit for Review
                </button>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-400/30 rounded-lg p-4">
            <p className="text-sm text-amber-100">
              <strong>💡 Tip:</strong> Listen to the recitation first, then try to memorize and recite from memory. Record your recitation for teacher feedback.
            </p>
          </div>
        </div>
      </div>

      {/* Tajweed Color Reference */}
      <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/10 border border-slate-600/30 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Tajweed Color Guide</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded" />
            <span className="text-sm text-slate-300">Noon Sakinah</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded" />
            <span className="text-sm text-slate-300">Meem Sakinah</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded" />
            <span className="text-sm text-slate-300">Emphatic Letters</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded" />
            <span className="text-sm text-slate-300">Madd (Elongation)</span>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-600/10 border border-cyan-400/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="text-cyan-400 flex-shrink-0 mt-1" size={20} />
            <div>
              <p className="font-semibold mb-1">After Recording:</p>
              <p className="text-sm text-slate-400">Your teacher will review within 24 hours and provide detailed feedback on Tajweed and accuracy.</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-900/30 to-purple-600/10 border border-purple-400/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-purple-400 flex-shrink-0 mt-1" size={20} />
            <div>
              <p className="font-semibold mb-1">Practice Tips:</p>
              <p className="text-sm text-slate-400">Memorize a few ayahs at a time. Use the Hide Text mode to practice from memory only.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemorizationInterface;
