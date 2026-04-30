import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { MessageSquare, Send, Users, Search, Filter } from 'lucide-react';

interface Message {
  id: string;
  subject: string;
  content: string;
  from: string;
  fromName: string;
  to: string[];
  toNames: string[];
  recipientType: 'all' | 'students' | 'teachers' | 'specific';
  createdAt: string;
  read: boolean;
}

export default function Messages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    subject: '',
    content: '',
    recipientType: 'all' as 'all' | 'students' | 'teachers' | 'specific',
    recipients: [] as string[],
  });

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const messagesSnap = await getDocs(
        query(collection(db, 'messages'), orderBy('createdAt', 'desc'))
      );
      setMessages(
        messagesSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Message[]
      );
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'messages'), {
        ...formData,
        from: 'admin',
        fromName: 'Admin',
        to: formData.recipients,
        toNames: [],
        createdAt: new Date().toISOString(),
        read: false,
      });

      resetForm();
      fetchMessages();
      alert('Message sent successfully!');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      subject: '',
      content: '',
      recipientType: 'all',
      recipients: [],
    });
    setShowModal(false);
  };

  const filteredMessages = messages.filter(
    (msg) =>
      msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.fromName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">Messages</h1>
          <p className="text-white">{messages.length} total messages</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-bold hover:from-primary-400 hover:to-accent-400 transition-all shadow-lg"
        >
          <Send size={20} />
          Send Message
        </button>
      </div>

      {/* Search */}
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-900 text-white border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {filteredMessages.length > 0 ? (
          filteredMessages.map((message) => (
            <div
              key={message.id}
              className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-black text-white mb-1">{message.subject}</h3>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span>From: {message.fromName}</span>
                    <span>•</span>
                    <span>To: {message.recipientType.toUpperCase()}</span>
                    <span>•</span>
                    <span>{new Date(message.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    message.recipientType === 'all'
                      ? 'bg-accent-500/10 text-accent-400'
                      : message.recipientType === 'students'
                      ? 'bg-primary-500/10 text-primary-400'
                      : 'bg-green-500/10 text-green-400'
                  }`}
                >
                  {message.recipientType}
                </span>
              </div>
              <p className="text-white whitespace-pre-wrap">{message.content}</p>
            </div>
          ))
        ) : (
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
            <MessageSquare className="mx-auto text-slate-600 mb-4" size={64} />
            <h3 className="text-lg font-semibold text-white mb-2">No Messages</h3>
            <p className="text-slate-400">Send your first message to get started</p>
          </div>
        )}
      </div>

      {/* Send Message Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-2xl font-black text-white">Send Message</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-white mb-2">Recipients *</label>
                <select
                  required
                  value={formData.recipientType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      recipientType: e.target.value as 'all' | 'students' | 'teachers' | 'specific',
                    })
                  }
                  className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50"
                >
                  <option value="all">Everyone (Students & Teachers)</option>
                  <option value="students">All Students</option>
                  <option value="teachers">All Teachers</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">Subject *</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50"
                  placeholder="Enter message subject"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">Message *</label>
                <textarea
                  required
                  rows={6}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50"
                  placeholder="Type your message here..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-400 hover:to-accent-400 text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Send size={16} />
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
