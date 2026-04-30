import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, updateDoc, doc, addDoc, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { UserPlus, CheckCircle, XCircle, Clock, Search } from 'lucide-react';
import BackButton from '../../components/BackButton';

interface AdmissionRequest {
  id: string;
  studentName: string;
  age: number;
  parentName: string;
  phone: string;
  course: string;
  schedule: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  processedAt?: string;
}

const AdmissionRequests: React.FC = () => {
  const [requests, setRequests] = useState<AdmissionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const requestsQuery = query(
        collection(db, 'admissionRequests'),
        orderBy('submittedAt', 'desc')
      );
      const snapshot = await getDocs(requestsQuery);
      const requestsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdmissionRequest));
      setRequests(requestsData);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request: AdmissionRequest) => {
    if (!confirm(`Approve admission for ${request.studentName}?`)) return;

    setProcessing(request.id);
    try {
      // Create student record
      await addDoc(collection(db, 'students'), {
        userId: null,
        fullName: request.studentName,
        email: '',
        phone: request.phone,
        dateOfBirth: '',
        age: request.age,
        gender: 'male',
        parentName: request.parentName,
        parentPhone: request.phone,
        parentEmail: '',
        currentCourse: request.course,
        preferredSchedule: request.schedule,
        studentType: 'online',
        progress: {
          completedJuz: 0,
          currentSurah: '',
          lastLessonDate: new Date().toISOString().split('T')[0],
        },
        fees: {
          monthlyAmount: 50,
          lastPaymentDate: '',
          status: 'pending'
        },
        enrollmentDate: new Date().toISOString().split('T')[0],
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Update admission request status
      await updateDoc(doc(db, 'admissionRequests', request.id), {
        status: 'approved',
        processedAt: new Date().toISOString(),
      });

      alert(`${request.studentName} has been approved and added to students!`);
      fetchRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve request. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (request: AdmissionRequest) => {
    if (!confirm(`Reject admission for ${request.studentName}?`)) return;

    setProcessing(request.id);
    try {
      await updateDoc(doc(db, 'admissionRequests', request.id), {
        status: 'rejected',
        processedAt: new Date().toISOString(),
      });

      alert(`Admission for ${request.studentName} has been rejected.`);
      fetchRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      approved: 'bg-green-500/20 text-green-400 border-green-500/30',
      rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return styles[status as keyof typeof styles] || 'bg-slate-500/20 text-white border-slate-500/30';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="text-yellow-400" size={20} />;
      case 'approved':
        return <CheckCircle className="text-green-400" size={20} />;
      case 'rejected':
        return <XCircle className="text-red-400" size={20} />;
      default:
        return null;
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.phone.includes(searchTerm);
    const matchesStatus = statusFilter === '' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
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
      {/* Back Button */}
      <BackButton to="/admin" label="← Back to Dashboard" variant="secondary" />
      
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-white mb-2">Admission Requests</h1>
        <p className="text-white">Review and process student admission applications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm mb-1">Total Requests</p>
              <p className="text-3xl font-black text-white">{stats.total}</p>
            </div>
            <UserPlus className="text-white" size={40} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 backdrop-blur-xl border border-yellow-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-400 text-sm mb-1">Pending</p>
              <p className="text-3xl font-black text-white">{stats.pending}</p>
            </div>
            <Clock className="text-yellow-500" size={40} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-400 text-sm mb-1">Approved</p>
              <p className="text-3xl font-black text-white">{stats.approved}</p>
            </div>
            <CheckCircle className="text-green-500" size={40} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-400 text-sm mb-1">Rejected</p>
              <p className="text-3xl font-black text-white">{stats.rejected}</p>
            </div>
            <XCircle className="text-red-500" size={40} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white" size={20} />
            <input
              type="text"
              placeholder="Search by student name, parent, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-primary-500/50 text-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-6 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50 text-white"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Admission Applications</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Student</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Age</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Parent</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Phone</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Course</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Schedule</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Submitted</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-white">
                    No admission requests found.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                      {request.studentName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {request.age}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {request.parentName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {request.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {request.course}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {request.schedule}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {new Date(request.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(request.status)}`}>
                          {request.status.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {request.status === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(request)}
                            disabled={processing === request.id}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold transition-colors disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(request)}
                            disabled={processing === request.id}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold transition-colors disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-white">
                          {request.processedAt ? new Date(request.processedAt).toLocaleDateString() : '-'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdmissionRequests;
