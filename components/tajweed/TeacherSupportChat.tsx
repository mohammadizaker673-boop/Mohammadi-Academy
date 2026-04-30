/**
 * Teacher Support Chat Module
 * Real-time communication between students and teachers
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { TajweedStudentProgress } from '../../types/quran-tajweed.types';
import { MessageSquare, Send, Phone, Video, Clock, CheckCircle } from 'lucide-react';

interface TeacherSupportChatProps {
  studentId: string;
  studentName: string;
  studentProgress: TajweedStudentProgress;
  onNewMessage: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'student' | 'teacher';
  senderName: string;
  content: string;
  timestamp: Date;
}

interface Teacher {
  id: string;
  name: string;
  expertise: string;
  avatar: string;
  isOnline: boolean;
  responseTime: string;
  rating: number;
}

const SAMPLE_TEACHERS: Teacher[] = [
  {
    id: 'teacher-1',
    name: 'Qari Ahmed',
    expertise: 'Tajweed Specialist',
    avatar: '👨‍🏫',
    isOnline: true,
    responseTime: '< 2 minutes',
    rating: 4.9
  },
  {
    id: 'teacher-2',
    name: 'Sister Fatima',
    expertise: 'Beginner to Intermediate',
    avatar: '👩‍🏫',
    isOnline: true,
    responseTime: '< 5 minutes',
    rating: 4.8
  }
];

export const TeacherSupportChat: React.FC<TeacherSupportChatProps> = ({
  studentId,
  studentName,
  studentProgress,
  onNewMessage
}) => {
  const { isDark } = useTheme();
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-0',
      sender: 'teacher',
      senderName: 'System',
      content: 'Welcome to Teacher Support! Select a teacher to get started.',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [conversationOpen, setConversationOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setConversationOpen(true);

    const greeting: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'teacher',
      senderName: teacher.name,
      content: `Assalamu Alaikum ${studentName}! How can I help you with your Tajweed learning today?`,
      timestamp: new Date()
    };
    setMessages([greeting]);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const studentMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'student',
      senderName: studentName,
      content: inputValue,
      timestamp: new Date()
    };

    setMessages([...messages, studentMsg]);
    setInputValue('');
    onNewMessage();

    setTimeout(() => {
      const teacherResponse: ChatMessage = {
        id: `msg-${Date.now()}-response`,
        sender: 'teacher',
        senderName: selectedTeacher?.name || 'Teacher',
        content: 'Thank you for your question. Keep practicing!',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, teacherResponse]);
    }, 1500);
  };

  if (!conversationOpen || !selectedTeacher) {
    return (
      <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg`}>
        <div className={`${isDark ? 'bg-slate-700 border-slate-600' : 'bg-blue-50 border-blue-200'} border-b p-6`}>
          <h2 className={`text-2xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <MessageSquare className="w-6 h-6 text-blue-500" />
            Teacher Support Chat
          </h2>
          <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Connect with expert Tajweed teachers for guidance and feedback
          </p>
        </div>

        <div className="p-6">
          <div className={`${isDark ? 'bg-slate-700 border-slate-600' : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'} border rounded-lg p-6 mb-8`}>
            <h3 className={`font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Your Learning Journey
            </h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-500">{studentProgress.lessonsCompleted}</p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Lessons Done</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-500">{studentProgress.rulesLearned.length}</p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Rules Learned</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-500">{studentProgress.exercisesCompleted}</p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Exercises Done</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-500">{studentProgress.overallProgress}%</p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Progress</p>
              </div>
            </div>
          </div>

          <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Online Teachers
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SAMPLE_TEACHERS.map(teacher => (
              <button
                key={teacher.id}
                onClick={() => handleSelectTeacher(teacher)}
                className={`text-left p-4 rounded-lg border-2 transition-all hover:shadow-lg ${isDark ? 'bg-slate-700 border-slate-600 hover:border-blue-500' : 'bg-gray-50 border-gray-200 hover:border-blue-500'}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{teacher.avatar}</span>
                    <div>
                      <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {teacher.name}
                      </h4>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {teacher.expertise}
                      </p>
                    </div>
                  </div>
                  {teacher.isOnline && (
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                  )}
                </div>

                <div className={`text-xs space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span>Response: {teacher.responseTime}</span>
                  </div>
                  <div>⭐ {teacher.rating}/5</div>
                </div>

                {teacher.isOnline && (
                  <div className="mt-3 pt-3 border-t border-gray-300 dark:border-slate-600">
                    <button className="w-full py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold rounded hover:shadow-lg transition-all">
                      Chat Now
                    </button>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg flex flex-col h-[600px]`}>
      <div className={`${isDark ? 'bg-slate-700 border-slate-600' : 'bg-blue-50 border-blue-200'} border-b p-4 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{selectedTeacher.avatar}</span>
          <div>
            <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {selectedTeacher.name}
            </h3>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Online Now
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-slate-600' : 'hover:bg-gray-100'}`}>
            <Phone className="w-5 h-5 text-blue-500" />
          </button>
          <button
            onClick={() => setConversationOpen(false)}
            className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-slate-600' : 'hover:bg-gray-100'}`}
          >
            ✕
          </button>
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.sender === 'student'
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : `${isDark ? 'bg-slate-600 text-white' : 'bg-white text-gray-900'} rounded-bl-none border ${isDark ? 'border-slate-500' : 'border-gray-200'}`
              }`}
            >
              {msg.sender === 'teacher' && (
                <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  {msg.senderName}
                </p>
              )}
              <p className="text-sm">{msg.content}</p>
              <p className={`text-xs mt-1 ${msg.sender === 'student' ? 'text-blue-100' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className={`${isDark ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'} border-t p-4`}>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
            placeholder="Type your question..."
            className={`flex-1 px-3 py-2 rounded-lg border transition-all ${
              isDark ? 'bg-slate-800 border-slate-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:border-blue-500`}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
              inputValue.trim()
                ? 'bg-blue-500 text-white hover:shadow-lg'
                : `${isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-300 text-gray-600'} cursor-not-allowed`
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherSupportChat;
