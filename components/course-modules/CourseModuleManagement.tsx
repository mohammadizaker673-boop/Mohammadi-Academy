import React, { useMemo, useState } from 'react';
import { Edit2, Eye, Plus, Trash2, Users } from 'lucide-react';
import { DedicatedCourseModule } from '../../types/dedicated-course.types';

interface CourseModuleManagementProps {
  course: DedicatedCourseModule;
}

interface EditableLessonRow {
  id: string;
  title: string;
  section: string;
  order: number;
  estimatedTime: number;
  completionRate: number;
  studentCount: number;
  averageScore: number;
  notes: string;
  resourceUrl: string;
}

const CourseModuleManagement: React.FC<CourseModuleManagementProps> = ({ course }) => {
  const initialLessons = useMemo<EditableLessonRow[]>(() => {
    return course.sections.flatMap((section) =>
      section.lessons.map((lesson) => {
        const metric = course.lessonMetrics.find((item) => item.lessonId === lesson.id);
        return {
          id: lesson.id,
          title: lesson.title,
          section: section.title,
          order: lesson.order,
          estimatedTime: lesson.estimatedMinutes,
          completionRate: metric?.completionRate ?? 0,
          studentCount: metric?.studentCount ?? 0,
          averageScore: metric?.averageScore ?? 0,
          notes: lesson.staffNote ?? '',
          resourceUrl: ''
        };
      })
    );
  }, [course.lessonMetrics, course.sections]);

  const [selectedSection, setSelectedSection] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [lessons, setLessons] = useState(initialLessons);
  const [formData, setFormData] = useState({
    title: '',
    section: course.sections[0]?.title ?? 'General',
    estimatedTime: 20,
    notes: '',
    resourceUrl: ''
  });

  const sectionOptions = ['all', ...course.sections.map((section) => section.title)];
  const filteredLessons = selectedSection === 'all'
    ? lessons
    : lessons.filter((lesson) => lesson.section === selectedSection);

  const handleOpenCreate = () => {
    setEditingLessonId(null);
    setFormData({
      title: '',
      section: course.sections[0]?.title ?? 'General',
      estimatedTime: 20,
      notes: '',
      resourceUrl: ''
    });
    setShowForm(true);
  };

  const handleEdit = (lesson: EditableLessonRow) => {
    setEditingLessonId(lesson.id);
    setFormData({
      title: lesson.title,
      section: lesson.section,
      estimatedTime: lesson.estimatedTime,
      notes: lesson.notes,
      resourceUrl: lesson.resourceUrl
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      return;
    }

    if (editingLessonId) {
      setLessons((current) => current.map((lesson) => lesson.id === editingLessonId
        ? {
            ...lesson,
            title: formData.title,
            section: formData.section,
            estimatedTime: formData.estimatedTime,
            notes: formData.notes,
            resourceUrl: formData.resourceUrl
          }
        : lesson));
    } else {
      const newLesson: EditableLessonRow = {
        id: `${course.metadata.id}-draft-${Date.now()}`,
        title: formData.title,
        section: formData.section,
        order: lessons.filter((lesson) => lesson.section === formData.section).length + 1,
        estimatedTime: formData.estimatedTime,
        completionRate: 0,
        studentCount: 0,
        averageScore: 0,
        notes: formData.notes,
        resourceUrl: formData.resourceUrl
      };
      setLessons((current) => [...current, newLesson]);
    }

    setShowForm(false);
    setEditingLessonId(null);
  };

  const handleDelete = (lessonId: string) => {
    if (confirm('Delete this lesson from the admin draft list?')) {
      setLessons((current) => current.filter((lesson) => lesson.id !== lessonId));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-primary-300 font-black">Dedicated Course Management</p>
          <h1 className="text-4xl font-black text-white mt-2">{course.metadata.title}</h1>
          <p className="text-slate-300 mt-2">Manage section content, monitor progress, and review the course team setup.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-black hover:from-primary-400 hover:to-accent-400 transition flex items-center gap-2"
        >
          <Plus size={18} /> Add Lesson Draft
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 border border-white/10 rounded-2xl p-5">
          <p className="text-sm text-slate-400">Total Enrollments</p>
          <p className="text-3xl font-black text-white mt-2">{course.adminStats.totalEnrollments}</p>
        </div>
        <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 border border-white/10 rounded-2xl p-5">
          <p className="text-sm text-slate-400">Active Students</p>
          <p className="text-3xl font-black text-blue-400 mt-2">{course.adminStats.activeStudents}</p>
        </div>
        <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 border border-white/10 rounded-2xl p-5">
          <p className="text-sm text-slate-400">Completion Rate</p>
          <p className="text-3xl font-black text-green-400 mt-2">{course.adminStats.completionRate}%</p>
        </div>
        <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 border border-white/10 rounded-2xl p-5">
          <p className="text-sm text-slate-400">Average Score</p>
          <p className="text-3xl font-black text-accent-300 mt-2">{course.adminStats.averageScore}%</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 border border-white/10 rounded-2xl p-5">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-400 font-black mb-3">Filter by Section</p>
        <div className="flex flex-wrap gap-2">
          {sectionOptions.map((section) => (
            <button
              key={section}
              onClick={() => setSelectedSection(section)}
              className={`px-4 py-2 rounded-xl border transition ${
                selectedSection === section
                  ? 'border-primary-400 bg-primary-500/15 text-white'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {section === 'all' ? 'All Sections' : section}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px]">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.2em] text-white font-black">Lesson</th>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.2em] text-white font-black">Section</th>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.2em] text-white font-black">Duration</th>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.2em] text-white font-black">Students</th>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.2em] text-white font-black">Completion</th>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.2em] text-white font-black">Avg Score</th>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.2em] text-white font-black">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLessons.map((lesson) => (
                <tr key={lesson.id} className="hover:bg-white/5 transition">
                  <td className="px-6 py-4">
                    <p className="text-white font-bold">{lesson.title}</p>
                    <p className="text-xs text-slate-500 mt-1">Order {lesson.order}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full bg-primary-500/15 text-primary-200 text-xs border border-primary-500/20">
                      {lesson.section}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{lesson.estimatedTime} min</td>
                  <td className="px-6 py-4 text-slate-300">{lesson.studentCount}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-2 rounded-full bg-slate-700/80 overflow-hidden">
                        <div className="h-2 rounded-full bg-green-500" style={{ width: `${lesson.completionRate}%` }} />
                      </div>
                      <span className="text-sm text-slate-200 font-bold">{lesson.completionRate}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-accent-300 font-bold">{lesson.averageScore}%</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(lesson)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 transition">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(lesson.id)} className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-200 transition">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr,0.8fr] gap-6">
        <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="text-blue-300" size={20} />
            <h2 className="text-xl font-black text-white">Course Staff</h2>
          </div>
          <div className="space-y-4">
            {course.staff.map((member) => (
              <div key={member.id} className="rounded-2xl bg-white/5 border border-white/5 p-4">
                <p className="text-white font-bold">{member.name}</p>
                <p className="text-primary-300 text-sm mt-1">{member.role}</p>
                <p className="text-slate-300 text-sm mt-3">{member.bio}</p>
                <p className="text-slate-500 text-xs mt-3">{member.qualification}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Eye className="text-emerald-300" size={20} />
            <h2 className="text-xl font-black text-white">Materials Snapshot</h2>
          </div>
          <div className="space-y-4">
            {course.resourceHighlights.map((resource) => (
              <div key={resource.title} className="rounded-2xl bg-white/5 border border-white/5 p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-white font-bold">{resource.title}</p>
                  <span className="px-3 py-1 rounded-full bg-white/10 text-xs text-slate-300 uppercase tracking-[0.2em]">{resource.type}</span>
                </div>
                <p className="text-sm text-slate-300 mt-3">{resource.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showForm ? (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-[2rem] bg-slate-900 border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-black text-white">{editingLessonId ? 'Edit Lesson Draft' : 'Add Lesson Draft'}</h2>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl bg-white/10 text-slate-200 hover:bg-white/15 transition">
                Close
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="space-y-2">
                <span className="text-sm text-slate-300 font-bold">Lesson Title</span>
                <input
                  value={formData.title}
                  onChange={(event) => setFormData((current) => ({ ...current, title: event.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-slate-300 font-bold">Section</span>
                <select
                  value={formData.section}
                  onChange={(event) => setFormData((current) => ({ ...current, section: event.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
                >
                  {course.sections.map((section) => (
                    <option key={section.id} value={section.title} className="bg-slate-900">
                      {section.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm text-slate-300 font-bold">Estimated Time (minutes)</span>
                <input
                  type="number"
                  min={5}
                  value={formData.estimatedTime}
                  onChange={(event) => setFormData((current) => ({ ...current, estimatedTime: Number(event.target.value) || 0 }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-slate-300 font-bold">Resource URL</span>
                <input
                  value={formData.resourceUrl}
                  onChange={(event) => setFormData((current) => ({ ...current, resourceUrl: event.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </label>
            </div>
            <label className="space-y-2 block">
              <span className="text-sm text-slate-300 font-bold">Staff Notes</span>
              <textarea
                rows={4}
                value={formData.notes}
                onChange={(event) => setFormData((current) => ({ ...current, notes: event.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
              />
            </label>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="px-5 py-3 rounded-xl bg-white/10 text-slate-200 hover:bg-white/15 transition">
                Cancel
              </button>
              <button onClick={handleSave} className="px-5 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold hover:from-primary-400 hover:to-accent-400 transition">
                Save Draft
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default CourseModuleManagement;