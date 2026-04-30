import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Phone, Calendar, MapPin, BookOpen, Edit2, Save, X } from 'lucide-react';
import BackButton from '../../components/BackButton';

interface StudentProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  currentCourse: string;
  enrollmentDate: string;
  status: string;
  profileImage?: string;
}

const StudentProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [formData, setFormData] = useState<Partial<StudentProfile>>({});

  useEffect(() => {
    if (user?.email) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const studentsQuery = query(
        collection(db, 'students'),
        where('email', '==', user?.email)
      );
      const studentsSnap = await getDocs(studentsQuery);
      
      if (!studentsSnap.empty) {
        const studentData = {
          id: studentsSnap.docs[0].id,
          ...studentsSnap.docs[0].data()
        } as StudentProfile;
        setProfile(studentData);
        setFormData(studentData);
      } else {
        // Create mock profile if not found
        const mockProfile: StudentProfile = {
          id: user?.uid || 'student-001',
          fullName: user?.email?.split('@')[0] || 'Student Name',
          email: user?.email || '',
          phone: '+1-XXX-XXX-XXXX',
          dateOfBirth: '2000-01-01',
          gender: 'Male',
          address: '123 Main Street, City, Country',
          guardianName: 'Parent/Guardian Name',
          guardianPhone: '+1-XXX-XXX-XXXX',
          guardianEmail: 'guardian@example.com',
          currentCourse: 'Tajweed',
          enrollmentDate: new Date().toISOString().split('T')[0],
          status: 'active'
        };
        setProfile(mockProfile);
        setFormData(mockProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Create mock profile as fallback
      const mockProfile: StudentProfile = {
        id: user?.uid || 'student-001',
        fullName: user?.email?.split('@')[0] || 'Student Name',
        email: user?.email || '',
        phone: '+1-XXX-XXX-XXXX',
        dateOfBirth: '2000-01-01',
        gender: 'Male',
        address: '123 Main Street, City, Country',
        guardianName: 'Parent/Guardian Name',
        guardianPhone: '+1-XXX-XXX-XXXX',
        guardianEmail: 'guardian@example.com',
        currentCourse: 'Tajweed',
        enrollmentDate: new Date().toISOString().split('T')[0],
        status: 'active'
      };
      setProfile(mockProfile);
      setFormData(mockProfile);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile?.id) return;

    try {
      await updateDoc(doc(db, 'students', profile.id), {
        phone: formData.phone,
        address: formData.address,
        guardianName: formData.guardianName,
        guardianPhone: formData.guardianPhone,
        guardianEmail: formData.guardianEmail,
        updatedAt: new Date().toISOString(),
      });
      
      await fetchProfile();
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setFormData(profile || {});
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center">
          <p className="text-white text-xl">Profile not found</p>
          <p className="text-white/60 mt-2">Please contact administration</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <BackButton to="/student" label="← Back to Dashboard" variant="secondary" />
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">My Profile</h1>
          <p className="text-white">View and manage your personal information</p>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-bold hover:from-primary-400 hover:to-accent-400 transition-all shadow-lg"
          >
            <Edit2 size={20} />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-colors"
            >
              <X size={20} />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:from-green-400 hover:to-emerald-400 transition-all shadow-lg"
            >
              <Save size={20} />
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <User className="text-white" size={48} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white">{profile.fullName}</h2>
            <p className="text-white/60">Student ID: {profile.id.slice(0, 8).toUpperCase()}</p>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-bold ${
              profile.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
            }`}>
              {profile.status === 'active' ? 'Active Student' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Personal Information */}
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
              <User size={20} className="text-primary-400" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-white mb-2">Full Name</label>
                <div className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white">
                  {profile.fullName}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">Email</label>
                <div className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white flex items-center gap-2">
                  <Mail size={16} className="text-primary-400" />
                  {profile.email}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">Phone</label>
                {editing ? (
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50"
                  />
                ) : (
                  <div className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white flex items-center gap-2">
                    <Phone size={16} className="text-primary-400" />
                    {profile.phone}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">Date of Birth</label>
                <div className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white flex items-center gap-2">
                  <Calendar size={16} className="text-primary-400" />
                  {new Date(profile.dateOfBirth).toLocaleDateString()}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">Gender</label>
                <div className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white">
                  {profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">Address</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50"
                  />
                ) : (
                  <div className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white flex items-center gap-2">
                    <MapPin size={16} className="text-primary-400" />
                    {profile.address || 'Not provided'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Guardian Information */}
          <div className="border-t border-white/10 pt-6">
            <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
              <User size={20} className="text-accent-400" />
              Guardian Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-white mb-2">Guardian Name</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.guardianName || ''}
                    onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50"
                  />
                ) : (
                  <div className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white">
                    {profile.guardianName || 'Not provided'}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">Guardian Phone</label>
                {editing ? (
                  <input
                    type="tel"
                    value={formData.guardianPhone || ''}
                    onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50"
                  />
                ) : (
                  <div className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white flex items-center gap-2">
                    <Phone size={16} className="text-accent-400" />
                    {profile.guardianPhone || 'Not provided'}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">Guardian Email</label>
                {editing ? (
                  <input
                    type="email"
                    value={formData.guardianEmail || ''}
                    onChange={(e) => setFormData({ ...formData, guardianEmail: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50"
                  />
                ) : (
                  <div className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white flex items-center gap-2">
                    <Mail size={16} className="text-accent-400" />
                    {profile.guardianEmail || 'Not provided'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="border-t border-white/10 pt-6">
            <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
              <BookOpen size={20} className="text-green-400" />
              Academic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-white mb-2">Current Course</label>
                <div className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white">
                  {profile.currentCourse || 'Not assigned'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">Enrollment Date</label>
                <div className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white flex items-center gap-2">
                  <Calendar size={16} className="text-green-400" />
                  {new Date(profile.enrollmentDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
