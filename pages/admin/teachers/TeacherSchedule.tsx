import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { Calendar, Clock, User, MapPin, Video, Save, X, Edit2 } from 'lucide-react';

interface Teacher {
  id: string;
  fullName: string;
  email: string;
  availability: {
    days: string[];
    timeSlots: string[];
  };
  currentStudents: number;
  maxStudents: number;
  status: string;
}

interface Student {
  id: string;
  fullName: string;
  studentType: 'online' | 'offline';
  schedule?: {
    days: string[];
    timeSlot: string;
    meetingLink?: string;
  };
  assignedTeacherId: string | null;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = [
  '08:00 AM - 09:00 AM',
  '09:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 01:00 PM',
  '02:00 PM - 03:00 PM',
  '03:00 PM - 04:00 PM',
  '04:00 PM - 05:00 PM',
  '05:00 PM - 06:00 PM',
  '06:00 PM - 07:00 PM',
  '07:00 PM - 08:00 PM',
];

export default function TeacherSchedule() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [teachersSnap, studentsSnap] = await Promise.all([
        getDocs(collection(db, 'teachers')),
        getDocs(collection(db, 'students')),
      ]);

      setTeachers(
        teachersSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Teacher[]
      );

      setStudents(
        studentsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Student[]
      );
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSchedule = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setSelectedDays(teacher.availability?.days || []);
    setSelectedTimeSlots(teacher.availability?.timeSlots || []);
    setShowModal(true);
  };

  const handleSaveSchedule = async () => {
    if (!editingTeacher) return;

    try {
      await updateDoc(doc(db, 'teachers', editingTeacher.id), {
        availability: {
          days: selectedDays,
          timeSlots: selectedTimeSlots,
        },
        updatedAt: new Date().toISOString(),
      });

      await fetchData();
      setShowModal(false);
      setEditingTeacher(null);
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert('Error saving schedule. Please try again.');
    }
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const toggleTimeSlot = (slot: string) => {
    setSelectedTimeSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  const getAssignedStudents = (teacherId: string) => {
    return students.filter((s) => s.assignedTeacherId === teacherId);
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
        <h1 className="text-4xl font-black text-white mb-2">Teacher Schedules</h1>
        <p className="text-white">Manage teacher availability and class schedules</p>
      </div>

      {/* Teachers Schedule Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {teachers.map((teacher) => {
          const assignedStudents = getAssignedStudents(teacher.id);
          const onlineStudents = assignedStudents.filter((s) => s.studentType === 'online');
          const offlineStudents = assignedStudents.filter((s) => s.studentType === 'offline');

          return (
            <div
              key={teacher.id}
              className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              {/* Teacher Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                    <User className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">{teacher.fullName}</h3>
                    <p className="text-sm text-slate-400">{teacher.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleEditSchedule(teacher)}
                  className="p-2 hover:bg-primary-500/10 text-primary-400 rounded-lg transition-colors"
                >
                  <Edit2 size={16} />
                </button>
              </div>

              {/* Student Count */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1 bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-white font-bold mb-1">Students</p>
                  <p className="text-2xl font-black text-white">
                    {teacher.currentStudents}/{teacher.maxStudents}
                  </p>
                </div>
                <div className="flex-1 bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Video size={14} className="text-primary-400" />
                    <p className="text-xs text-white font-bold">Online</p>
                  </div>
                  <p className="text-2xl font-black text-white">{onlineStudents.length}</p>
                </div>
                <div className="flex-1 bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin size={14} className="text-accent-400" />
                    <p className="text-xs text-white font-bold">Offline</p>
                  </div>
                  <p className="text-2xl font-black text-white">{offlineStudents.length}</p>
                </div>
              </div>

              {/* Availability */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="text-primary-400" size={18} />
                    <h4 className="text-sm font-black text-white">Available Days</h4>
                  </div>
                  {teacher.availability?.days?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {teacher.availability.days.map((day) => (
                        <span
                          key={day}
                          className="px-3 py-1 bg-primary-500/10 text-primary-400 rounded-full text-xs font-bold"
                        >
                          {day}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm">No days set</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="text-accent-400" size={18} />
                    <h4 className="text-sm font-black text-white">Time Slots</h4>
                  </div>
                  {teacher.availability?.timeSlots?.length > 0 ? (
                    <div className="space-y-2">
                      {teacher.availability.timeSlots.map((slot) => (
                        <div
                          key={slot}
                          className="px-3 py-2 bg-accent-500/10 text-accent-400 rounded-lg text-xs font-bold"
                        >
                          {slot}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm">No time slots set</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* No Teachers */}
      {teachers.length === 0 && (
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
          <Calendar className="mx-auto text-slate-600 mb-4" size={64} />
          <h3 className="text-lg font-semibold text-white mb-2">No Teachers Found</h3>
          <p className="text-slate-400">Add teachers to manage their schedules</p>
        </div>
      )}

      {/* Edit Schedule Modal */}
      {showModal && editingTeacher && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-white/10 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-black text-white">
                Edit Schedule - {editingTeacher.fullName}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingTeacher(null);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="text-white" size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Days Selection */}
              <div>
                <label className="block text-sm font-black text-white mb-3">
                  Available Days *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {DAYS_OF_WEEK.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                        selectedDays.includes(day)
                          ? 'bg-primary-500 text-white'
                          : 'bg-slate-900/50 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {day.substring(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slots Selection */}
              <div>
                <label className="block text-sm font-black text-white mb-3">
                  Available Time Slots *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => toggleTimeSlot(slot)}
                      className={`px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                        selectedTimeSlots.includes(slot)
                          ? 'bg-accent-500 text-white'
                          : 'bg-slate-900/50 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTeacher(null);
                  }}
                  className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSchedule}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-400 hover:to-accent-400 text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  Save Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
