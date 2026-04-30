import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Bell, AlertCircle, Info, CheckCircle } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  targetAudience: 'all' | 'students' | 'teachers';
  priority: 'low' | 'medium' | 'high';
  publishedAt: Date;
  createdBy: string;
  status: string;
}

export default function TeacherAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const announcementsSnap = await getDocs(
        query(collection(db, 'announcements'), orderBy('publishedAt', 'desc'))
      );

      const allAnnouncements = announcementsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        publishedAt: doc.data().publishedAt?.toDate() || new Date(),
      })) as Announcement[];

      // Filter for teachers (targetAudience is 'all' or 'teachers')
      const teacherAnnouncements = allAnnouncements.filter(
        (ann) => ann.targetAudience === 'all' || ann.targetAudience === 'teachers'
      );

      setAnnouncements(teacherAnnouncements);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="text-red-400" size={20} />;
      case 'medium':
        return <Info className="text-yellow-400" size={20} />;
      case 'low':
        return <CheckCircle className="text-green-400" size={20} />;
      default:
        return <Info className="text-slate-400" size={20} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'low':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

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
      <div>
        <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
          <Bell className="text-primary-400" size={36} />
          Announcements
        </h1>
        <p className="text-white">Important updates and notifications</p>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.length > 0 ? (
          announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  {getPriorityIcon(announcement.priority)}
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-white mb-2">{announcement.title}</h3>
                    <p className="text-sm text-slate-400">
                      {announcement.publishedAt.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${getPriorityColor(
                    announcement.priority
                  )}`}
                >
                  {announcement.priority.toUpperCase()}
                </span>
              </div>
              <p className="text-white whitespace-pre-wrap leading-relaxed">{announcement.content}</p>
            </div>
          ))
        ) : (
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
            <Bell className="mx-auto text-slate-600 mb-4" size={64} />
            <h3 className="text-lg font-semibold text-white mb-2">No Announcements</h3>
            <p className="text-slate-400">There are no announcements at the moment</p>
          </div>
        )}
      </div>
    </div>
  );
}
