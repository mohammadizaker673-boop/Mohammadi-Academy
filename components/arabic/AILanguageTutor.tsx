import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Volume2, Copy, Zap, MessageSquare, Globe, Eye, EyeOff } from 'lucide-react';
import { generateAIJson, hasOpenRouterApiKey } from '../../services/aiService';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  text: string;
  arabicText?: string;
  timestamp: Date;
  spelling?: string;
  pronunciation?: string;
  translation?: string;
}

interface LanguageConfig {
  from: string;
  to: string;
  mode: 'translation' | 'teaching' | 'writing' | 'conversation';
}

interface TutorAIResponse {
  text?: string;
  arabicText?: string;
  pronunciation?: string;
  translation?: string;
}

const LANGUAGE_RULES = {
  'Arabic-English': {
    examples: [
      { arabic: 'مرحبا', english: 'Hello', pronunciation: 'Marḥaban' },
      { arabic: 'كيف حالك؟', english: 'How are you?', pronunciation: 'Kayf ḥālak?' },
      { arabic: 'شكرا جزيلا', english: 'Thank you very much', pronunciation: 'Shukran jāzīlan' },
    ]
  },
  'Arabic-Persian': {
    examples: [
      { arabic: 'سلام', persian: 'سلام', meaning: 'Hello' },
      { arabic: 'شکریہ', persian: 'تشکر', meaning: 'Thank you' },
    ]
  },
  'Persian-Arabic': {
    examples: [
      { persian: 'سلام', arabic: 'السلام عليكم', meaning: 'Hello/Peace be upon you' },
      { persian: 'شب', arabic: 'ليل', meaning: 'Night' },
    ]
  },
};

const AILanguageTutor: React.FC = () => {
  const aiConfigured = hasOpenRouterApiKey();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      text: '🌍 Welcome to your AI Language Tutor! I can help you with:\n\n📚 Arabic Teaching - Learn vocabulary, grammar, and phrases\n🔤 Translation - Convert between Arabic, English, and Persian\n✍️ Writing Help - Improve your Arabic writing and composition\n🎤 Pronunciation - Perfect your accent with guidance\n\nWhat would you like to learn today?',
      timestamp: new Date(),
    }
  ]);

  const [input, setInput] = useState('');
  const [languageConfig, setLanguageConfig] = useState<LanguageConfig>({
    from: 'English',
    to: 'Arabic',
    mode: 'teaching',
  });
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'ar-SA';
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const speakText = (text: string, lang: string = 'ar-SA') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.8;
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported');
      return;
    }
    setIsListening(true);
    recognitionRef.current.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInput(transcript);
    };
    recognitionRef.current.onend = () => setIsListening(false);
    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const buildFallbackResponse = (userMessage: string): Message => {
    const id = Date.now().toString();
    let responseText = '';
    let arabicText = '';
    let pronunciation = '';
    let translation = '';

    // Simulate AI responses based on language config and message
    if (languageConfig.mode === 'teaching') {
      if (userMessage.toLowerCase().includes('hello') || userMessage.includes('مرحبا')) {
        responseText = '📚 Great question! Here\'s how to say hello in Arabic:\n\n';
        responseText += '🎤 Word: مرحبا (Marḥaban)\n';
        responseText += '💬 Meaning: Hello\n';
        responseText += '📢 Pronunciation: mahr-HA-ban\n\n';
        responseText += '💡 Tip: This is an informal greeting. For formal, say "السلام عليكم" (As-salāmu ʿalaykum)\n\n';
        responseText += '✍️ Cultural Note: Handshakes are common in Arab countries, and maintaining eye contact shows respect.';
        arabicText = 'مرحبا';
        pronunciation = 'Marḥaban';
        translation = 'Hello';
      } else if (userMessage.toLowerCase().includes('family') || userMessage.includes('عائلة')) {
        responseText = '👨‍👩‍👧‍👦 Family Vocabulary in Arabic:\n\n';
        responseText += '• أب (ab) - Father\n';
        responseText += '• أم (umm) - Mother\n';
        responseText += '• أخ (akh) - Brother\n';
        responseText += '• أخت (ukht) - Sister\n';
        responseText += '• عم (ʿamm) - Uncle (paternal)\n';
        responseText += '• خال (khāl) - Uncle (maternal)\n';
        responseText += '• عمة (ʿamma) - Aunt (paternal)\n';
        responseText += '• خالة (khāla) - Aunt (maternal)\n\n';
        responseText += '📺 Example: "هذا أبي وهذه أمي" (Hādhā abī wa-hādhihi ummī) = This is my father and this is my mother';
      } else {
        responseText = '📖 That\'s a great topic to learn!\n\n';
        responseText += 'I can help you with:\n';
        responseText += '• Vocabulary learning\n';
        responseText += '• Grammar explanations\n';
        responseText += '• Pronunciation practice\n';
        responseText += '• Sentence structure\n';
        responseText += '• Cultural insights\n\n';
        responseText += 'Try asking me about:\n';
        responseText += '✓ Arabic greetings\n';
        responseText += '✓ Family members\n';
        responseText += '✓ Days of the week\n';
        responseText += '✓ Numbers and counting\n';
        responseText += '✓ Food and drinks';
      }
    } else if (languageConfig.mode === 'translation') {
      if (userMessage.length > 0) {
        // Simulate translation
        if (languageConfig.from === 'English' && languageConfig.to === 'Arabic') {
          responseText = '🔄 Translation Result:\n\n';
          responseText += `English: "${userMessage}"\n`;
          responseText += `Arabic: "[Translated text would appear here]"\n`;
          responseText += `Pronunciation: "[Phonetic would appear here]\n\n`;
          responseText += '💡 This translation service supports:\n';
          responseText += '• English ↔ Arabic\n';
          responseText += '• Arabic ↔ Persian\n';
          responseText += '• English ↔ Persian\n';
        }
      }
    } else if (languageConfig.mode === 'writing') {
      responseText = '✍️ Writing Assistant\n\n';
      responseText += 'I can help you with:\n';
      responseText += '• Grammar correction\n';
      responseText += '• Sentence structure\n';
      responseText += '• Vocabulary suggestions\n';
      responseText += '• Style improvement\n';
      responseText += '• Formal vs informal writing\n\n';
      responseText += 'Share what you\'d like to write about in Arabic!';
    } else if (languageConfig.mode === 'conversation') {
      responseText = '💬 Conversation Mode\n\n';
      responseText += 'Let\'s practice a simple dialogue:\n\n';
      responseText += 'Student: السلام عليكم\n';
      responseText += 'Tutor: وعليكم السلام ورحمة الله وبركاته\n\n';
      responseText += 'Translation:\n';
      responseText += 'Student: "Peace be upon you"\n';
      responseText += 'Tutor: "And upon you be peace, and God\'s mercy and blessings"\n\n';
      responseText += 'Try responding with your own phrases!';
    }

    return {
      id,
      type: 'assistant',
      text: responseText,
      arabicText,
      pronunciation,
      translation,
      timestamp: new Date(),
    };
  };

  const generateTutorResponse = async (userMessage: string, history: Message[]): Promise<Message> => {
    const fallbackResponse = buildFallbackResponse(userMessage);

    if (!aiConfigured) {
      return fallbackResponse;
    }

    const recentHistory = history
      .slice(-6)
      .map((message) => `${message.type === 'user' ? 'Student' : 'Tutor'}: ${message.text}`)
      .join('\n');

    try {
      const response = await generateAIJson<TutorAIResponse>({
        temperature: 0.4,
        maxTokens: 900,
        messages: [
          {
            role: 'system',
            content: [
              'You are Muhammadi Academy\'s Arabic language tutor.',
              'Help with Arabic teaching, translation, writing support, and conversation practice.',
              'Keep explanations accurate, encouraging, and concise.',
              'When Arabic is relevant, include Arabic script naturally.',
              'Return JSON with these keys only: text, arabicText, pronunciation, translation.',
              'Use an empty string for fields that are not needed.',
            ].join(' '),
          },
          {
            role: 'user',
            content: [
              `Learning mode: ${languageConfig.mode}`,
              `Translate or explain from ${languageConfig.from} to ${languageConfig.to}.`,
              recentHistory ? `Recent conversation:\n${recentHistory}` : 'Recent conversation: none',
              `Latest learner message: ${userMessage}`,
            ].join('\n\n'),
          },
        ],
      });

      return {
        id: Date.now().toString(),
        type: 'assistant',
        text: response.text?.trim() || fallbackResponse.text,
        arabicText: response.arabicText?.trim() || undefined,
        pronunciation: response.pronunciation?.trim() || undefined,
        translation: response.translation?.trim() || undefined,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Arabic AI tutor generation failed:', error);
      return fallbackResponse;
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const trimmedInput = input.trim();

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: trimmedInput,
      timestamp: new Date(),
    };

    const nextHistory = [...messages, userMessage];
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsGenerating(true);

    try {
      const response = await generateTutorResponse(trimmedInput, nextHistory);
      setMessages(prev => [...prev, response]);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-b border-white/10 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="text-blue-400" size={32} />
            <div>
              <h1 className="text-2xl font-black text-white">AI Language Tutor</h1>
              <p className="text-slate-400 text-sm">Learn Arabic with AI-powered assistance</p>
            </div>
          </div>

          {!aiConfigured && (
            <div className="mb-4 rounded-lg border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
              OpenRouter is not configured yet, so the tutor is using built-in guided responses.
            </div>
          )}

          {/* Language Config */}
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="text-slate-400 text-sm block mb-2">From</label>
              <select
                value={languageConfig.from}
                onChange={(e) => setLanguageConfig(prev => ({ ...prev, from: e.target.value }))}
                className="w-full bg-slate-700/50 text-white rounded-lg px-3 py-2 border border-slate-600 focus:outline-none focus:border-blue-500"
              >
                <option>English</option>
                <option>Arabic</option>
                <option>Persian</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 text-sm block mb-2">To</label>
              <select
                value={languageConfig.to}
                onChange={(e) => setLanguageConfig(prev => ({ ...prev, to: e.target.value }))}
                className="w-full bg-slate-700/50 text-white rounded-lg px-3 py-2 border border-slate-600 focus:outline-none focus:border-blue-500"
              >
                <option>Arabic</option>
                <option>English</option>
                <option>Persian</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 text-sm block mb-2">Mode</label>
              <select
                value={languageConfig.mode}
                onChange={(e) => setLanguageConfig(prev => ({ ...prev, mode: e.target.value as any }))}
                className="w-full bg-slate-700/50 text-white rounded-lg px-3 py-2 border border-slate-600 focus:outline-none focus:border-blue-500"
              >
                <option value="teaching">Teaching</option>
                <option value="translation">Translation</option>
                <option value="writing">Writing Help</option>
                <option value="conversation">Conversation</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition flex items-center justify-center gap-2"
              >
                {showAdvanced ? <EyeOff size={18} /> : <Eye size={18} />}
                {showAdvanced ? 'Hide' : 'Show'} Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-6xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-2xl rounded-2xl px-6 py-4 border ${
                  message.type === 'user'
                    ? 'bg-blue-600/20 border-blue-500 text-white'
                    : 'bg-slate-700/50 border-slate-600 text-slate-100'
                }`}
              >
                <div className="whitespace-pre-wrap text-sm md:text-base leading-relaxed mb-3">
                  {message.text}
                </div>

                {/* Advanced Details */}
                {showAdvanced && message.type === 'assistant' && (
                  <div className="mt-4 pt-4 border-t border-white/20 space-y-3">
                    {message.arabicText && (
                      <div className="bg-slate-600/50 rounded-lg p-3">
                        <p className="text-xs text-slate-400 mb-1">Arabic Text</p>
                        <p className="text-lg font-bold text-white">{message.arabicText}</p>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => speakText(message.arabicText!, 'ar-SA')}
                            disabled={isSpeaking}
                            className="px-3 py-1 bg-blue-600/50 hover:bg-blue-600 text-white text-xs rounded transition disabled:opacity-50 flex items-center gap-1"
                          >
                            <Volume2 size={14} /> Speak
                          </button>
                          <button
                            onClick={() => copyToClipboard(message.arabicText!, message.id)}
                            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded transition flex items-center gap-1"
                          >
                            <Copy size={14} /> {copiedId === message.id ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>
                    )}

                    {message.pronunciation && (
                      <div className="bg-slate-600/50 rounded-lg p-3">
                        <p className="text-xs text-slate-400 mb-1">Pronunciation</p>
                        <p className="text-white font-mono">{message.pronunciation}</p>
                      </div>
                    )}

                    {message.translation && (
                      <div className="bg-slate-600/50 rounded-lg p-3">
                        <p className="text-xs text-slate-400 mb-1">Translation</p>
                        <p className="text-white">{message.translation}</p>
                      </div>
                    )}
                  </div>
                )}

                <p className="text-xs text-slate-500 mt-3">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {isGenerating && (
            <div className="flex justify-start">
              <div className="max-w-2xl rounded-2xl px-6 py-4 border bg-slate-700/50 border-slate-600 text-slate-100">
                <div className="text-sm md:text-base leading-relaxed">Preparing your tutor response...</div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-gradient-to-t from-slate-800 to-slate-800/50 border-t border-white/10 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-3">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`p-3 rounded-lg transition ${
                isListening
                  ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              }`}
              title="Click to start voice input"
            >
              <Mic size={20} />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a question or type to learn Arabic..."
              className="flex-1 bg-slate-700/50 text-white placeholder-slate-400 rounded-lg px-4 py-3 border border-slate-600 focus:outline-none focus:border-blue-500"
            />

            <button
              onClick={handleSend}
              disabled={!input.trim() || isGenerating}
              className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
              title="Send message"
            >
              <Send size={20} />
            </button>
          </div>

          <p className="text-xs text-slate-400 mt-2">
            💡 Tip: Use voice input by clicking the mic button, or type your questions directly
          </p>
        </div>
      </div>
    </div>
  );
};

export default AILanguageTutor;
