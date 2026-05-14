import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle, Clock, Search, ShieldCheck, XCircle } from 'lucide-react';
import BackButton from '../../components/BackButton';
import {
  getSignupApprovalRequests,
  SignupApprovalRequest,
  updateSignupApprovalStatus,
} from '../../services/db';

const SignupApprovals: React.FC = () => {
  const [requests, setRequests] = useState<SignupApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getSignupApprovalRequests();
      setRequests(data);
    } catch (error) {
      console.error('Failed to fetch signup approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = useMemo(() => {
    return requests.filter((item) => {
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.fullName.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.phone.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [requests, searchTerm, statusFilter]);

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    approved: requests.filter((r) => r.status === 'approved').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
  };

  const handleDecision = async (request: SignupApprovalRequest, status: 'approved' | 'rejected') => {
    const actionText = status === 'approved' ? 'approve' : 'reject';
    if (!window.confirm(`Are you sure you want to ${actionText} ${request.fullName}?`)) {
      return;
    }

    try {
      setProcessingId(request.id);
      await updateSignupApprovalStatus(request.id, status);
      await fetchRequests();
    } catch (error) {
      console.error(`Failed to ${actionText} signup request:`, error);
      alert(`Failed to ${actionText} signup request. Please try again.`);
    } finally {
      setProcessingId(null);
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
      <BackButton to="/admin" label="← Back to Dashboard" variant="secondary" />

      <div>
        <h1 className="text-4xl font-black text-white mb-2">Signup Approvals</h1>
        <p className="text-white">Review newly registered users and approve access to the app.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/80 border border-white/10 rounded-xl p-4">
          <p className="text-sm text-white">Total</p>
          <p className="text-2xl font-black text-white">{stats.total}</p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <p className="text-sm text-yellow-300">Pending</p>
          <p className="text-2xl font-black text-white">{stats.pending}</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <p className="text-sm text-green-300">Approved</p>
          <p className="text-2xl font-black text-white">{stats.approved}</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-sm text-red-300">Rejected</p>
          <p className="text-2xl font-black text-white">{stats.rejected}</p>
        </div>
      </div>

      <div className="bg-slate-800/80 border border-white/10 rounded-xl p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/70 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-primary-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'approved' | 'rejected')}
          className="px-4 py-2.5 bg-slate-900/70 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="bg-slate-800/80 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/60">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">Requested</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-300">
                    No signup requests found.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-white font-semibold">{request.fullName}</td>
                    <td className="px-4 py-3 text-slate-200">{request.email}</td>
                    <td className="px-4 py-3 text-slate-200">{request.phone || '-'}</td>
                    <td className="px-4 py-3 text-slate-200 capitalize">{request.role}</td>
                    <td className="px-4 py-3">
                      {request.status === 'pending' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                          <Clock size={13} />
                          Pending
                        </span>
                      )}
                      {request.status === 'approved' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-300 border border-green-500/30">
                          <CheckCircle size={13} />
                          Approved
                        </span>
                      )}
                      {request.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                          <XCircle size={13} />
                          Rejected
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{new Date(request.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {request.status === 'pending' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDecision(request, 'approved')}
                            disabled={processingId === request.id}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-bold disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleDecision(request, 'rejected')}
                            disabled={processingId === request.id}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-300 text-xs">
                          <ShieldCheck size={14} />
                          Processed
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

export default SignupApprovals;
