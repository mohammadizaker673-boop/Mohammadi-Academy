import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, KeyRound, ShieldCheck, Users } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { fetchAutomatedCourses } from '../../../services/automatedCourseService';
import { courses } from '../../../data/courses';
import { useAuth } from '../../../contexts/AuthContext';
import { CourseAccessRecord, CourseAccessSourceType } from '../../../types/course-access.types';
import {
  createDefaultCourseAccessRecord,
  getCourseAccessKey,
  listCourseAccessRecords,
  saveCourseAccessRecord
} from '../../../services/courseAccessService';
import { Student } from '../../../types/student.types';
import { Teacher } from '../../../types/teacher.types';

interface ManagedPremiumCourse {
  courseId: string;
  sourceType: CourseAccessSourceType;
  title: string;
  description: string;
  category: string;
  priceLabel: string;
}

type StudentRow = Student & { id: string };
type TeacherRow = Teacher & { id: string };

const PremiumCourseAccessManagement: React.FC = () => {
  const { user } = useAuth();
  const [coursesState, setCoursesState] = useState<ManagedPremiumCourse[]>([]);
  const [records, setRecords] = useState<Record<string, CourseAccessRecord>>({});
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [selectedCourseKey, setSelectedCourseKey] = useState('');
  const [allowAllStudents, setAllowAllStudents] = useState(false);
  const [allowAllTeachers, setAllowAllTeachers] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [teacherSearch, setTeacherSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [studentsSnapshot, teachersSnapshot, automatedCourses, accessRecords] = await Promise.all([
          getDocs(collection(db, 'students')),
          getDocs(collection(db, 'teachers')),
          fetchAutomatedCourses().catch(() => []),
          listCourseAccessRecords()
        ]);

        const premiumCatalog = courses
          .filter((course) => course.priceType === 'paid')
          .map((course) => ({
            courseId: course.id,
            sourceType: 'catalog' as const,
            title: course.title,
            description: course.description,
            category: course.category,
            priceLabel: course.pricing[0]?.pricePerMonth ? `$${course.pricing[0].pricePerMonth}/month` : 'Premium'
          }));

        const premiumAutomated = automatedCourses
          .filter((course) => course.priceType === 'paid' && course.isActive && course.status === 'published')
          .map((course) => ({
            courseId: course.id,
            sourceType: 'automated' as const,
            title: course.title,
            description: course.description,
            category: course.category,
            priceLabel: `$${course.price}`
          }));

        const mergedCourses = [...premiumCatalog, ...premiumAutomated].sort((left, right) => left.title.localeCompare(right.title));
        const recordMap = Object.fromEntries(accessRecords.map((record) => [record.courseKey, record]));

        setCoursesState(mergedCourses);
        setRecords(recordMap);
        setStudents(studentsSnapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })) as StudentRow[]);
        setTeachers(teachersSnapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })) as TeacherRow[]);

        if (mergedCourses.length > 0) {
          setSelectedCourseKey((current) => current || getCourseAccessKey(mergedCourses[0].sourceType, mergedCourses[0].courseId));
        }
      } catch (error) {
        console.error('Failed to load premium course access data', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const selectedCourse = useMemo(
    () => coursesState.find((course) => getCourseAccessKey(course.sourceType, course.courseId) === selectedCourseKey) || null,
    [coursesState, selectedCourseKey]
  );

  const selectedRecord = useMemo(() => {
    if (!selectedCourse) {
      return null;
    }

    return records[selectedCourseKey] || createDefaultCourseAccessRecord({
      courseId: selectedCourse.courseId,
      sourceType: selectedCourse.sourceType,
      courseTitle: selectedCourse.title
    });
  }, [records, selectedCourse, selectedCourseKey]);

  useEffect(() => {
    if (!selectedRecord) {
      return;
    }

    setAllowAllStudents(selectedRecord.allowAllStudents);
    setAllowAllTeachers(selectedRecord.allowAllTeachers);
    setSelectedStudentIds(selectedRecord.studentIds);
    setSelectedTeacherIds(selectedRecord.teacherIds);
  }, [selectedRecord]);

  const filteredStudents = students.filter((student) =>
    student.fullName.toLowerCase().includes(studentSearch.toLowerCase()) ||
    student.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredTeachers = teachers.filter((teacher) =>
    teacher.fullName.toLowerCase().includes(teacherSearch.toLowerCase()) ||
    teacher.email.toLowerCase().includes(teacherSearch.toLowerCase())
  );

  const toggleStudent = (principalId: string) => {
    setSelectedStudentIds((current) => current.includes(principalId)
      ? current.filter((id) => id !== principalId)
      : [...current, principalId]);
  };

  const toggleTeacher = (principalId: string) => {
    setSelectedTeacherIds((current) => current.includes(principalId)
      ? current.filter((id) => id !== principalId)
      : [...current, principalId]);
  };

  const handleSave = async () => {
    if (!selectedCourse) {
      return;
    }

    setSaving(true);
    try {
      await saveCourseAccessRecord({
        courseId: selectedCourse.courseId,
        sourceType: selectedCourse.sourceType,
        courseTitle: selectedCourse.title,
        allowAllStudents,
        allowAllTeachers,
        studentIds: selectedStudentIds,
        teacherIds: selectedTeacherIds,
        updatedBy: user?.uid
      });

      const refreshed = await listCourseAccessRecords();
      setRecords(Object.fromEntries(refreshed.map((record) => [record.courseKey, record])));
    } catch (error) {
      console.error('Failed to save premium course access', error);
      alert('Failed to save premium access changes. Please try again.');
    } finally {
      setSaving(false);
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-primary-300 font-black">Premium Access Control</p>
          <h1 className="text-4xl font-black text-white mt-2">Course Access Assignments</h1>
          <p className="text-slate-300 mt-2">Assign premium courses to specific students and teachers, or open them to all users in a role.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={!selectedCourse || saving}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-black hover:from-primary-400 hover:to-accent-400 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <ShieldCheck size={18} /> {saving ? 'Saving...' : 'Save Access Rules'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 border border-white/10 rounded-2xl p-5">
          <p className="text-sm text-slate-400">Premium Courses</p>
          <p className="text-3xl font-black text-white mt-2">{coursesState.length}</p>
        </div>
        <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 border border-white/10 rounded-2xl p-5">
          <p className="text-sm text-slate-400">Students with Portal Access</p>
          <p className="text-3xl font-black text-blue-400 mt-2">{students.filter((student) => Boolean(student.userId)).length}</p>
        </div>
        <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 border border-white/10 rounded-2xl p-5">
          <p className="text-sm text-slate-400">Teachers with Portal Access</p>
          <p className="text-3xl font-black text-green-400 mt-2">{teachers.filter((teacher) => Boolean(teacher.userId)).length}</p>
        </div>
        <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 border border-white/10 rounded-2xl p-5">
          <p className="text-sm text-slate-400">Current Selections</p>
          <p className="text-3xl font-black text-accent-300 mt-2">{selectedStudentIds.length + selectedTeacherIds.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[0.95fr,1.05fr] gap-6">
        <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <KeyRound className="text-primary-300" size={20} />
            <h2 className="text-xl font-black text-white">Premium Courses</h2>
          </div>
          <div className="space-y-3 max-h-[38rem] overflow-y-auto pr-1">
            {coursesState.map((course) => {
              const courseKey = getCourseAccessKey(course.sourceType, course.courseId);
              const record = records[courseKey];
              return (
                <button
                  key={courseKey}
                  onClick={() => setSelectedCourseKey(courseKey)}
                  className={`w-full text-left rounded-2xl border p-4 transition ${
                    selectedCourseKey === courseKey
                      ? 'border-primary-400 bg-primary-500/10'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-white font-bold">{course.title}</p>
                      <p className="text-xs text-slate-400 mt-1 uppercase tracking-[0.2em]">{course.sourceType} • {course.category}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-white/10 text-xs text-slate-300">{course.priceLabel}</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-3 line-clamp-2">{course.description}</p>
                  <div className="flex flex-wrap gap-2 mt-4 text-xs">
                    <span className="px-2 py-1 rounded-full bg-slate-900/70 text-slate-300">Students: {record?.studentIds.length ?? 0}</span>
                    <span className="px-2 py-1 rounded-full bg-slate-900/70 text-slate-300">Teachers: {record?.teacherIds.length ?? 0}</span>
                    {record?.allowAllStudents ? <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-300">All students</span> : null}
                    {record?.allowAllTeachers ? <span className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-300">All teachers</span> : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          {selectedCourse ? (
            <>
              <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 border border-white/10 rounded-2xl p-5">
                <h2 className="text-2xl font-black text-white">{selectedCourse.title}</h2>
                <p className="text-slate-300 mt-2">{selectedCourse.description}</p>
                <div className="flex flex-wrap gap-3 mt-4 text-sm">
                  <label className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-200">
                    <input type="checkbox" checked={allowAllStudents} onChange={(event) => setAllowAllStudents(event.target.checked)} />
                    Allow all students
                  </label>
                  <label className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-200">
                    <input type="checkbox" checked={allowAllTeachers} onChange={(event) => setAllowAllTeachers(event.target.checked)} />
                    Allow all teachers
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 border border-white/10 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="text-blue-300" size={20} />
                    <h3 className="text-xl font-black text-white">Specific Students</h3>
                  </div>
                  <input
                    value={studentSearch}
                    onChange={(event) => setStudentSearch(event.target.value)}
                    placeholder="Search students..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 mb-4"
                  />
                  <div className="space-y-3 max-h-[26rem] overflow-y-auto pr-1">
                    {filteredStudents.map((student) => {
                      const principalId = student.userId;
                      const checked = principalId ? selectedStudentIds.includes(principalId) : false;
                      return (
                        <label key={student.id} className={`flex items-start gap-3 rounded-xl border p-4 ${principalId ? 'border-white/10 bg-white/5 cursor-pointer' : 'border-white/5 bg-white/[0.03] opacity-70 cursor-not-allowed'}`}>
                          <input
                            type="checkbox"
                            disabled={allowAllStudents || !principalId}
                            checked={checked}
                            onChange={() => principalId && toggleStudent(principalId)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <p className="text-white font-bold">{student.fullName}</p>
                            <p className="text-sm text-slate-400 mt-1">{student.email}</p>
                            <p className="text-xs text-slate-500 mt-2">
                              {principalId ? `Portal account ready • ${student.level} ${student.currentCourse ? `• ${student.currentCourse}` : ''}` : 'No linked portal account yet'}
                            </p>
                          </div>
                          {checked ? <CheckCircle2 className="text-green-400" size={18} /> : null}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 border border-white/10 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <ShieldCheck className="text-emerald-300" size={20} />
                    <h3 className="text-xl font-black text-white">Specific Teachers</h3>
                  </div>
                  <input
                    value={teacherSearch}
                    onChange={(event) => setTeacherSearch(event.target.value)}
                    placeholder="Search teachers..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 mb-4"
                  />
                  <div className="space-y-3 max-h-[26rem] overflow-y-auto pr-1">
                    {filteredTeachers.map((teacher) => {
                      const principalId = teacher.userId;
                      const checked = principalId ? selectedTeacherIds.includes(principalId) : false;
                      return (
                        <label key={teacher.id} className={`flex items-start gap-3 rounded-xl border p-4 ${principalId ? 'border-white/10 bg-white/5 cursor-pointer' : 'border-white/5 bg-white/[0.03] opacity-70 cursor-not-allowed'}`}>
                          <input
                            type="checkbox"
                            disabled={allowAllTeachers || !principalId}
                            checked={checked}
                            onChange={() => principalId && toggleTeacher(principalId)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <p className="text-white font-bold">{teacher.fullName}</p>
                            <p className="text-sm text-slate-400 mt-1">{teacher.email}</p>
                            <p className="text-xs text-slate-500 mt-2">
                              {principalId ? `Portal account ready • ${teacher.specializations?.join(', ') || 'Teaching access'}` : 'No linked portal account yet'}
                            </p>
                          </div>
                          {checked ? <CheckCircle2 className="text-green-400" size={18} /> : null}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default PremiumCourseAccessManagement;