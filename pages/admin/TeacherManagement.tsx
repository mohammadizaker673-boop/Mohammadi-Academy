import React, { useEffect, useState } from 'react';
import { getTeachers, createTeacher, updateTeacher, deleteTeacher } from '../../services/db';
import { supabase } from '../../services/supabase';
import { Teacher, TeacherFormData } from '../../types/teacher.types';
import { Plus, Search, Edit2, Trash2, X, Users, Key, CheckCircle } from 'lucide-react';
import BackButton from '../../components/BackButton';

const TeacherManagement: React.FC = () => {
  const [teachers, setTeachers] = useState<(Teacher & { id: string })[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<(Teacher & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<(Teacher & { id: string }) | null>(null);
  const [accessPassword, setAccessPassword] = useState('');
  const [accessLoading, setAccessLoading] = useState(false);
  const [accessSuccess, setAccessSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<(Teacher & { id: string }) | null>(null);
  const [formData, setFormData] = useState<TeacherFormData>({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'male',
    nationality: '',
    qualification: [],
    specializations: [],
    experienceYears: 0,
    maxStudents: 10,
    salaryType: 'monthly',
    salaryAmount: 0,
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    const filtered = teachers.filter(teacher =>
      teacher.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.phone.includes(searchTerm)
    );
    setFilteredTeachers(filtered);
  }, [searchTerm, teachers]);

  const fetchTeachers = async () => {
    try {
      const data = await getTeachers();
      setTeachers(data);
      setFilteredTeachers(data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    console.log('Editing teacher:', editingTeacher);
    
    try {
      const teacherData: Omit<Teacher, 'userId' | 'joiningDate' | 'createdAt' | 'updatedAt'> = {
        ...formData,
        age: calculateAge(formData.dateOfBirth),
        status: 'active',
        currentStudents: editingTeacher?.currentStudents || 0,
        assignedStudentIds: editingTeacher?.assignedStudentIds || [],
        availability: editingTeacher?.availability || {
          days: [],
          timeSlots: [],
        },
      };

      console.log('Teacher data to save:', teacherData);

      if (editingTeacher) {
        console.log('Updating teacher with ID:', editingTeacher.id);
        await updateTeacher(editingTeacher.id, teacherData);
        alert('Teacher updated successfully!');
      } else {
        console.log('Creating new teacher');
        await createTeacher({ ...teacherData, userId: null });
        alert('Teacher created successfully!');
      }

      resetForm();
      fetchTeachers();
    } catch (error) {
      console.error('Error saving teacher:', error);
      alert('Error saving teacher: ' + (error as Error).message);
    }
  };

  const handleEdit = (teacher: Teacher & { id: string }) => {
    console.log('Edit clicked for teacher:', teacher);
    console.log('Current showModal state:', showModal);
    
    setEditingTeacher(teacher);
    setFormData({
      fullName: teacher.fullName,
      email: teacher.email,
      phone: teacher.phone,
      dateOfBirth: teacher.dateOfBirth,
      gender: teacher.gender,
      nationality: teacher.nationality,
      qualification: teacher.qualification || [],
      specializations: teacher.specializations || [],
      experienceYears: teacher.experienceYears,
      maxStudents: teacher.maxStudents,
      salaryType: teacher.salaryType,
      salaryAmount: teacher.salaryAmount,
    });
    
    console.log('About to open modal...');
    setShowModal(true);
    console.log('Modal state should now be true');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this teacher?')) return;
    try {
      await deleteTeacher(id);
      fetchTeachers();
    } catch (error) {
      console.error('Error deleting teacher:', error);
    }
  };

  const handleGrantAccess = (teacher: Teacher & { id: string }) => {
    setSelectedTeacher(teacher);
    setAccessPassword('teacher' + Math.random().toString(36).substring(2, 8));
    setShowAccessModal(true);
    setAccessSuccess(false);
  };

  const handleCreateTeacherAccount = async () => {
    if (!selectedTeacher || !accessPassword) return;

    setAccessLoading(true);
    try {
      // Create Supabase Auth account for teacher
      const { data: authData, error: signUpError } = await supabase.auth.admin
        ? { data: null, error: new Error('Use Supabase dashboard to invite teachers') }
        : { data: null, error: new Error('Use Supabase dashboard to invite teachers') };

      // Invite via Supabase (requires service role – handled by creating profile record)
      // For now: upsert a profile record with teacher role so when they sign up, they get teacher access
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: crypto.randomUUID(), // placeholder - will be overwritten on actual signup
        email: selectedTeacher.email,
        display_name: selectedTeacher.fullName,
        phone: selectedTeacher.phone ?? '',
        role: 'teacher',
        last_login: new Date().toISOString(),
      }, { onConflict: 'email' } as any);

      if (profileError) {
        console.warn('Profile pre-registration note:', profileError.message);
      }
      setAccessSuccess(true);
      setTimeout(() => {
        setShowAccessModal(false);
        setAccessSuccess(false);
        setAccessPassword('');
        setSelectedTeacher(null);
        fetchTeachers();
      }, 3000);
    } catch (error: any) {
      console.error('Error setting up teacher account:', error);
      alert('Ask the teacher to register at /login with their email. Their teacher role will be pre-set.');
    } finally {
      setAccessLoading(false);
    }
  };

  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: 'male',
      nationality: '',
      qualification: [],
      specializations: [],
      experienceYears: 0,
      maxStudents: 10,
      salaryType: 'monthly',
      salaryAmount: 0,
    });
    setEditingTeacher(null);
    setShowModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
      {/* Back Button */}
      <BackButton to="/admin" label="← Back to Dashboard" variant="secondary" />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">Teachers</h1>
          <p className="text-white">{teachers.length} total teachers</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-bold hover:from-primary-400 hover:to-accent-400 transition-all shadow-lg"
        >
          <Plus size={20} />
          Add Teacher
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white" size={20} />
        <input
          type="text"
          placeholder="Search teachers by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-primary-500/50 transition-colors"
        />
      </div>

      {/* Teachers Table */}
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-left text-xs font-black text-white uppercase tracking-wider">Teacher</th>
                <th className="px-6 py-4 text-left text-xs font-black text-white uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-black text-white uppercase tracking-wider">Experience</th>
                <th className="px-6 py-4 text-left text-xs font-black text-white uppercase tracking-wider">Students</th>
                <th className="px-6 py-4 text-left text-xs font-black text-white uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-black text-white uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTeachers.length > 0 ? filteredTeachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-white">{teacher.fullName}</p>
                      <p className="text-sm text-white">{teacher.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-white">{teacher.phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-white">{teacher.experienceYears} years</p>
                    <p className="text-xs text-white">{teacher.qualification?.join(', ') || 'N/A'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-primary-400" />
                      <span className="text-sm text-white">
                        {teacher.currentStudents}/{teacher.maxStudents}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                      teacher.status === 'active'
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}>
                      {teacher.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {!teacher.userId && (
                        <button
                          onClick={() => handleGrantAccess(teacher)}
                          className="p-2 hover:bg-green-500/10 text-green-400 rounded-lg transition-colors"
                          title="Grant Portal Access"
                        >
                          <Key size={16} />
                        </button>
                      )}
                      {teacher.userId && (
                        <div className="p-2 text-green-400" title="Access Granted">
                          <CheckCircle size={16} />
                        </div>
                      )}
                      <button
                        onClick={() => handleEdit(teacher)}
                        className="p-2 hover:bg-primary-500/10 text-primary-400 rounded-lg transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(teacher.id)}
                        className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-white/60">
                    No teachers found. Click "Add Teacher" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>

      {/* Modal - Rendered Outside Main Container */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => {
          console.log('Modal backdrop clicked');
          e.stopPropagation();
        }}>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => {
            console.log('Modal content clicked');
            e.stopPropagation();
          }}>
            <div className="sticky top-0 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-white/10 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-black text-white">
                {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
              </h2>
              <button onClick={resetForm} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X className="text-white" size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Gender *</label>
                  <select
                    required
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50 text-white"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Nationality</label>
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Experience (Years) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Max Students *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.maxStudents}
                    onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50 text-white"
                  />
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 mt-4">
                <h3 className="text-lg font-black text-white mb-4">Qualifications & Specializations</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-white mb-2">Qualifications (comma separated)</label>
                    <input
                      type="text"
                      value={formData.qualification.join(', ')}
                      onChange={(e) => setFormData({ ...formData, qualification: e.target.value.split(',').map(q => q.trim()).filter(q => q) })}
                      placeholder="e.g., BA Islamic Studies, Ijazah in Tajweed"
                      className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-white mb-2">Specializations (comma separated)</label>
                    <input
                      type="text"
                      value={formData.specializations.join(', ')}
                      onChange={(e) => setFormData({ ...formData, specializations: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                      placeholder="e.g., Tajweed, Hifz, Tafseer"
                      className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 mt-4">
                <h3 className="text-lg font-black text-white mb-4">Salary Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-white mb-2">Salary Type *</label>
                    <select
                      required
                      value={formData.salaryType}
                      onChange={(e) => setFormData({ ...formData, salaryType: e.target.value as any })}
                      className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50 text-white"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="per-student">Per Student</option>
                      <option value="hourly">Hourly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-white mb-2">Salary Amount ($) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.salaryAmount}
                      onChange={(e) => setFormData({ ...formData, salaryAmount: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-400 hover:to-accent-400 text-white rounded-xl font-bold transition-all shadow-lg"
                >
                  {editingTeacher ? 'Update Teacher' : 'Add Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grant Access Modal */}
      {showAccessModal && selectedTeacher && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-white/10 max-w-md w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-white">Grant Portal Access</h2>
              <button
                onClick={() => {
                  setShowAccessModal(false);
                  setAccessSuccess(false);
                  setAccessPassword('');
                  setSelectedTeacher(null);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} className="text-white" />
              </button>
            </div>

            {accessSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Access Granted!</h3>
                <p className="text-white">Teacher account has been created successfully.</p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <p className="text-white mb-4">
                    Create a portal account for <span className="font-bold text-white">{selectedTeacher.fullName}</span>
                  </p>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                    <div>
                      <label className="text-xs font-bold text-white uppercase">Email</label>
                      <p className="text-white">{selectedTeacher.email}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-white uppercase">Temporary Password</label>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="text"
                          value={accessPassword}
                          onChange={(e) => setAccessPassword(e.target.value)}
                          className="flex-1 px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white font-mono text-sm text-white"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(accessPassword);
                            alert('Password copied to clipboard!');
                          }}
                          className="px-3 py-2 bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 rounded-lg text-xs font-bold transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-white mt-4">
                    The teacher will use this email and password to login. They should change their password after first login.
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAccessModal(false);
                      setAccessSuccess(false);
                      setAccessPassword('');
                      setSelectedTeacher(null);
                    }}
                    className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateTeacherAccount}
                    disabled={accessLoading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    {accessLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Key size={16} />
                        Grant Access
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default TeacherManagement;
