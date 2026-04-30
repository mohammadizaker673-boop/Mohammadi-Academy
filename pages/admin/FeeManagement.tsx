import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, addDoc, updateDoc, doc, orderBy, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { FeeRecord, PaymentStatus, PaymentMethod } from '../../types/fee.types';
import { DollarSign, Search, CheckCircle, Clock, AlertTriangle, X } from 'lucide-react';
import BackButton from '../../components/BackButton';

const FeeManagement: React.FC = () => {
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [filteredFees, setFilteredFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | 'all'>('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState<FeeRecord | null>(null);
  const [paymentData, setPaymentData] = useState({
    amountPaid: 0,
    paymentMethod: 'cash' as PaymentMethod,
    paymentDate: new Date().toISOString().split('T')[0],
    receiptNumber: '',
    notes: '',
  });

  useEffect(() => {
    fetchFees();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterStatus, fees]);

  const fetchFees = async () => {
    try {
      const feesQuery = query(collection(db, 'fees'), orderBy('month', 'desc'));
      const snapshot = await getDocs(feesQuery);
      const feesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as FeeRecord[];
      setFees(feesData);
      setFilteredFees(feesData);
    } catch (error) {
      console.error('Error fetching fees:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...fees];

    if (searchTerm) {
      filtered = filtered.filter(fee =>
        fee.studentName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(fee => fee.status === filterStatus);
    }

    setFilteredFees(filtered);
  };

  const handleRecordPayment = (fee: FeeRecord) => {
    setSelectedFee(fee);
    setPaymentData({
      amountPaid: fee.amount - fee.amountPaid,
      paymentMethod: 'cash',
      paymentDate: new Date().toISOString().split('T')[0],
      receiptNumber: `REC-${Date.now()}`,
      notes: '',
    });
    setShowPaymentModal(true);
  };

  const handleSubmitPayment = async () => {
    if (!selectedFee) return;

    try {
      const newAmountPaid = selectedFee.amountPaid + paymentData.amountPaid;
      const newStatus: PaymentStatus = 
        newAmountPaid >= selectedFee.amount ? 'paid' :
        newAmountPaid > 0 ? 'partial' : 'pending';

      await updateDoc(doc(db, 'fees', selectedFee.id), {
        amountPaid: newAmountPaid,
        status: newStatus,
        paidDate: paymentData.paymentDate,
        paymentMethod: paymentData.paymentMethod,
        receiptNumber: paymentData.receiptNumber,
        notes: paymentData.notes,
        updatedAt: new Date().toISOString(),
      });

      setShowPaymentModal(false);
      setSelectedFee(null);
      fetchFees();
    } catch (error) {
      console.error('Error recording payment:', error);
      alert('Error recording payment. Please try again.');
    }
  };

  const getStatusBadge = (status: PaymentStatus) => {
    const styles = {
      paid: 'bg-green-500/10 text-green-400 border-green-500/20',
      pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      overdue: 'bg-red-500/10 text-red-400 border-red-500/20',
      partial: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    };

    const icons = {
      paid: <CheckCircle size={14} />,
      pending: <Clock size={14} />,
      overdue: <AlertTriangle size={14} />,
      partial: <Clock size={14} />,
    };

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${styles[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const stats = {
    total: fees.reduce((sum, fee) => sum + fee.amount, 0),
    collected: fees.reduce((sum, fee) => sum + fee.amountPaid, 0),
    pending: fees.filter(f => f.status === 'pending' || f.status === 'partial').reduce((sum, fee) => sum + (fee.amount - fee.amountPaid), 0),
    overdue: fees.filter(f => f.status === 'overdue').reduce((sum, fee) => sum + (fee.amount - fee.amountPaid), 0),
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
        <h1 className="text-4xl font-black text-white mb-2">Fee Management</h1>
        <p className="text-white">Track and manage student fee payments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white">Total Expected</p>
              <p className="text-2xl font-black text-white">${stats.total}</p>
            </div>
            <DollarSign className="text-primary-400" size={32} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white">Collected</p>
              <p className="text-2xl font-black text-green-400">${stats.collected}</p>
            </div>
            <CheckCircle className="text-green-400" size={32} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white">Pending</p>
              <p className="text-2xl font-black text-yellow-400">${stats.pending}</p>
            </div>
            <Clock className="text-yellow-400" size={32} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white">Overdue</p>
              <p className="text-2xl font-black text-red-400">${stats.overdue}</p>
            </div>
            <AlertTriangle className="text-red-400" size={32} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white" size={20} />
          <input
            type="text"
            placeholder="Search by student name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-primary-500/50"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as PaymentStatus | 'all')}
          className="px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50"
        >
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
          <option value="partial">Partial</option>
        </select>
      </div>

      {/* Fee Table */}
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-left text-xs font-black text-white uppercase">Student</th>
                <th className="px-6 py-4 text-left text-xs font-black text-white uppercase">Month</th>
                <th className="px-6 py-4 text-left text-xs font-black text-white uppercase">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-black text-white uppercase">Paid</th>
                <th className="px-6 py-4 text-left text-xs font-black text-white uppercase">Due Date</th>
                <th className="px-6 py-4 text-left text-xs font-black text-white uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-black text-white uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredFees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <DollarSign className="mx-auto text-white mb-4" size={48} />
                    <p className="text-white">No fee records found</p>
                  </td>
                </tr>
              ) : (
                filteredFees.map((fee) => (
                  <tr key={fee.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-white">{fee.studentName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-white">{fee.month}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-white">${fee.amount}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-green-400">${fee.amountPaid}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-white">{new Date(fee.dueDate).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(fee.status)}
                    </td>
                    <td className="px-6 py-4">
                      {fee.status !== 'paid' && (
                        <button
                          onClick={() => handleRecordPayment(fee)}
                          className="px-3 py-1 bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 rounded-lg text-xs font-bold transition-colors"
                        >
                          Record Payment
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedFee && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-2xl font-black text-white">Record Payment</h2>
              <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="text-white" size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-white mb-1">Student</p>
                <p className="text-lg font-bold text-white">{selectedFee.studentName}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-white mb-1">Total Amount</p>
                  <p className="text-lg font-bold text-white">${selectedFee.amount}</p>
                </div>
                <div>
                  <p className="text-sm text-white mb-1">Already Paid</p>
                  <p className="text-lg font-bold text-green-400">${selectedFee.amountPaid}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">Payment Amount *</label>
                <input
                  type="number"
                  min="0"
                  max={selectedFee.amount - selectedFee.amountPaid}
                  value={paymentData.amountPaid}
                  onChange={(e) => setPaymentData({ ...paymentData, amountPaid: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">Payment Method *</label>
                <select
                  value={paymentData.paymentMethod}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value as PaymentMethod })}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50 text-white"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank-transfer">Bank Transfer</option>
                  <option value="online">Online Payment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">Payment Date *</label>
                <input
                  type="date"
                  value={paymentData.paymentDate}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">Receipt Number</label>
                <input
                  type="text"
                  value={paymentData.receiptNumber}
                  onChange={(e) => setPaymentData({ ...paymentData, receiptNumber: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">Notes</label>
                <textarea
                  rows={3}
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50 text-white"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitPayment}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-400 hover:to-accent-400 text-white rounded-xl font-bold transition-all shadow-lg"
                >
                  Record Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeManagement;
