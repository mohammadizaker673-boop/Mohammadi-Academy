import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { Shield, User, Search, CheckCircle, XCircle, Crown } from 'lucide-react';

interface UserData {
  id: string;
  fullName: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  type?: string;
  isFullAdmin?: boolean;
}

const AdminManagement = () => {
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<UserData[]>([]);
  const [admins, setAdmins] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTeachers, setFilteredTeachers] = useState<UserData[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = teachers.filter(teacher =>
      teacher.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTeachers(filtered);
  }, [searchTerm, teachers]);

  const fetchUsers = async () => {
    try {
      // Fetch all teachers
      const teachersSnap = await getDocs(collection(db, 'teachers'));
      const teachersList: UserData[] = teachersSnap.docs.map(doc => ({
        id: doc.id,
        fullName: doc.data().fullName,
        email: doc.data().email,
        role: 'teacher',
        isFullAdmin: doc.data().isFullAdmin || false,
      }));
      setTeachers(teachersList);
      setFilteredTeachers(teachersList);

      // Fetch all admins (users with role='admin')
      const usersQuery = query(
        collection(db, 'users'),
        where('role', '==', 'admin')
      );
      const usersSnap = await getDocs(usersQuery);
      const adminsList: UserData[] = usersSnap.docs.map(doc => ({
        id: doc.id,
        fullName: doc.data().fullName || doc.data().email,
        email: doc.data().email,
        role: 'admin',
      }));
      setAdmins(adminsList);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const grantAdminAccess = async (teacherId: string, teacherEmail: string) => {
    if (!confirm('Grant full admin access to this teacher? They will have access to all admin features.')) {
      return;
    }

    try {
      // Update teacher document
      await updateDoc(doc(db, 'teachers', teacherId), {
        isFullAdmin: true,
        updatedAt: new Date().toISOString(),
      });

      // Update or create user document with admin role
      const usersQuery = query(
        collection(db, 'users'),
        where('email', '==', teacherEmail)
      );
      const usersSnap = await getDocs(usersQuery);
      
      if (!usersSnap.empty) {
        const userId = usersSnap.docs[0].id;
        await updateDoc(doc(db, 'users', userId), {
          role: 'admin',
          originalRole: 'teacher',
          updatedAt: new Date().toISOString(),
        });
      }

      alert('Admin access granted successfully! The teacher can now access all admin features.');
      fetchUsers();
    } catch (error) {
      console.error('Error granting admin access:', error);
      alert('Error granting admin access. Please try again.');
    }
  };

  const revokeAdminAccess = async (teacherId: string, teacherEmail: string) => {
    if (!confirm('Revoke admin access from this teacher? They will return to regular teacher role.')) {
      return;
    }

    try {
      // Update teacher document
      await updateDoc(doc(db, 'teachers', teacherId), {
        isFullAdmin: false,
        updatedAt: new Date().toISOString(),
      });

      // Update user document back to teacher role
      const usersQuery = query(
        collection(db, 'users'),
        where('email', '==', teacherEmail)
      );
      const usersSnap = await getDocs(usersQuery);
      
      if (!usersSnap.empty) {
        const userId = usersSnap.docs[0].id;
        await updateDoc(doc(db, 'users', userId), {
          role: 'teacher',
          updatedAt: new Date().toISOString(),
        });
      }

      alert('Admin access revoked successfully!');
      fetchUsers();
    } catch (error) {
      console.error('Error revoking admin access:', error);
      alert('Error revoking admin access. Please try again.');
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
        <h1 className="text-4xl font-black text-white mb-2">Admin Management</h1>
        <p className="text-white">Manage admin access and permissions</p>
      </div>

      {/* Current Admins */}
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Crown className="text-yellow-400" size={24} />
            Current Administrators
          </h2>
        </div>
        <div className="p-6">
          {admins.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {admins.map((admin) => (
                <div key={admin.id} className="bg-slate-900/50 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                  <div className="p-3 bg-yellow-500/10 rounded-xl">
                    <Crown className="text-yellow-400" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white truncate">{admin.fullName}</p>
                    <p className="text-sm text-white/60 truncate">{admin.email}</p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 rounded-full text-xs font-bold">
                    Admin
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/60 text-center py-4">No administrators found</p>
          )}
        </div>
      </div>

      {/* Grant Admin Access to Teachers */}
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Shield className="text-primary-400" size={24} />
            Manage Teacher Admin Access
          </h2>
          <p className="text-white/60 mt-2">Grant or revoke full admin access to teachers</p>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white" size={20} />
            <input
              type="text"
              placeholder="Search teachers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary-500/50"
            />
          </div>
        </div>

        {/* Teachers List */}
        <div className="overflow-x-auto">
          {filteredTeachers.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-left text-xs font-black text-white uppercase">Teacher</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-white uppercase">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-white uppercase">Admin Status</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-white uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTeachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-500/10 rounded-lg">
                          <User className="text-primary-400" size={16} />
                        </div>
                        <p className="font-bold text-white">{teacher.fullName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-white">{teacher.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      {teacher.isFullAdmin ? (
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm font-bold">
                          <CheckCircle size={16} />
                          Full Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-slate-500/10 text-white/60 rounded-full text-sm font-bold">
                          <XCircle size={16} />
                          Regular Teacher
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {teacher.isFullAdmin ? (
                        <button
                          onClick={() => revokeAdminAccess(teacher.id, teacher.email)}
                          className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg font-bold transition-colors"
                        >
                          Revoke Admin Access
                        </button>
                      ) : (
                        <button
                          onClick={() => grantAdminAccess(teacher.id, teacher.email)}
                          className="px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-400 hover:to-accent-400 text-white rounded-lg font-bold transition-all"
                        >
                          Grant Admin Access
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-white/60">
              No teachers found
            </div>
          )}
        </div>
      </div>

      {/* Information Box */}
      <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6">
        <h3 className="text-lg font-black text-white mb-2 flex items-center gap-2">
          <Shield className="text-blue-400" size={20} />
          About Admin Access
        </h3>
        <ul className="space-y-2 text-white/80">
          <li className="flex items-start gap-2">
            <span className="text-primary-400 mt-1">•</span>
            <span><strong>Full Admin Access:</strong> Teachers with admin access can manage students, courses, fees, and all other administrative functions.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-400 mt-1">•</span>
            <span><strong>Regular Teacher:</strong> Can only access their assigned students, take attendance, and view lessons.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-400 mt-1">•</span>
            <span><strong>Security:</strong> Only grant admin access to trusted teachers. Admin users have full control over the system.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-400 mt-1">•</span>
            <span><strong>Login:</strong> Teachers with admin access can log in through both teacher portal and admin portal.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AdminManagement;
