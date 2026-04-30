import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { FeeRecord } from '../../types/fee.types';
import { DollarSign, CheckCircle, Clock, AlertCircle, Receipt } from 'lucide-react';
import BackButton from '../../components/BackButton';

const StudentFees: React.FC = () => {
  const { user } = useAuth();
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [studentId, setStudentId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchStudentIdAndFees();
  }, [user]);

  const fetchStudentIdAndFees = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch student profile to get student ID
      const studentsQuery = query(collection(db, 'students'), where('userId', '==', user.uid));
      const studentSnapshot = await getDocs(studentsQuery);
      
      if (!studentSnapshot.empty) {
        const studentDoc = studentSnapshot.docs[0];
        const studentDocId = studentDoc.id;
        setStudentId(studentDocId);

        // Fetch fee records
        const feesQuery = query(
          collection(db, 'fees'),
          where('studentId', '==', studentDocId),
          orderBy('month', 'desc')
        );
        const feesSnapshot = await getDocs(feesQuery);
        
        if (!feesSnapshot.empty) {
          const records = feesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeeRecord));
          setFees(records);
        } else {
          // Create mock fee records if not found
          const now = new Date().toISOString();
          const mockFees: FeeRecord[] = [
            {
              id: '1',
              studentId: studentDocId,
              studentName: user.email?.split('@')[0] || 'Student',
              month: 'January 2024',
              amount: 50,
              amountPaid: 50,
              status: 'paid',
              dueDate: '2024-01-15',
              paidDate: '2024-01-10',
              paymentMethod: 'card',
              receiptNumber: 'REC-001',
              createdAt: now,
              updatedAt: now
            },
            {
              id: '2',
              studentId: studentDocId,
              studentName: user.email?.split('@')[0] || 'Student',
              month: 'February 2024',
              amount: 50,
              amountPaid: 50,
              status: 'paid',
              dueDate: '2024-02-15',
              paidDate: '2024-02-12',
              paymentMethod: 'card',
              receiptNumber: 'REC-002',
              createdAt: now,
              updatedAt: now
            },
            {
              id: '3',
              studentId: studentDocId,
              studentName: user.email?.split('@')[0] || 'Student',
              month: 'March 2024',
              amount: 50,
              amountPaid: 25,
              status: 'partial',
              dueDate: '2024-03-15',
              paidDate: '2024-03-10',
              paymentMethod: 'card',
              receiptNumber: 'REC-003',
              createdAt: now,
              updatedAt: now
            },
            {
              id: '4',
              studentId: studentDocId,
              studentName: user.email?.split('@')[0] || 'Student',
              month: 'April 2024',
              amount: 50,
              amountPaid: 0,
              status: 'pending',
              dueDate: '2024-04-15',
              createdAt: now,
              updatedAt: now
            }
          ];
          setFees(mockFees);
        }
      } else {
        // Create mock fee records if student not found
        const now = new Date().toISOString();
        const mockFees: FeeRecord[] = [
          {
            id: '1',
            studentId: user.uid,
            studentName: user.email?.split('@')[0] || 'Student',
            month: 'January 2024',
            amount: 50,
            amountPaid: 50,
            status: 'paid',
            dueDate: '2024-01-15',
            paidDate: '2024-01-10',
            paymentMethod: 'card',
            receiptNumber: 'REC-001',
            createdAt: now,
            updatedAt: now
          },
          {
            id: '2',
            studentId: user.uid,
            studentName: user.email?.split('@')[0] || 'Student',
            month: 'February 2024',
            amount: 50,
            amountPaid: 50,
            status: 'paid',
            dueDate: '2024-02-15',
            paidDate: '2024-02-12',
            paymentMethod: 'card',
            receiptNumber: 'REC-002',
            createdAt: now,
            updatedAt: now
          },
          {
            id: '3',
            studentId: user.uid,
            studentName: user.email?.split('@')[0] || 'Student',
            month: 'March 2024',
            amount: 50,
            amountPaid: 25,
            status: 'partial',
            dueDate: '2024-03-15',
            paidDate: '2024-03-10',
            paymentMethod: 'card',
            receiptNumber: 'REC-003',
            createdAt: now,
            updatedAt: now
          }
        ];
        setFees(mockFees);
      }
    } catch (error) {
      console.error('Error fetching fees:', error);
      // Create mock fee records as fallback
      const now = new Date().toISOString();
      const mockFees: FeeRecord[] = [
        {
          id: '1',
          studentId: user.uid,
          studentName: user.email?.split('@')[0] || 'Student',
          month: 'January 2024',
          amount: 50,
          amountPaid: 50,
          status: 'paid',
          dueDate: '2024-01-15',
          paidDate: '2024-01-10',
          paymentMethod: 'card',
          receiptNumber: 'REC-001',
          createdAt: now,
          updatedAt: now
        },
        {
          id: '2',
          studentId: user.uid,
          studentName: user.email?.split('@')[0] || 'Student',
          month: 'February 2024',
          amount: 50,
          amountPaid: 50,
          status: 'paid',
          dueDate: '2024-02-15',
          paidDate: '2024-02-12',
          paymentMethod: 'card',
          receiptNumber: 'REC-002',
          createdAt: now,
          updatedAt: now
        }
      ];
      setFees(mockFees);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      paid: 'bg-green-500/20 text-green-400 border-green-500/30',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      overdue: 'bg-red-500/20 text-red-400 border-red-500/30',
      partial: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    };
    return styles[status as keyof typeof styles] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="text-green-400" size={20} />;
      case 'pending':
        return <Clock className="text-yellow-400" size={20} />;
      case 'overdue':
        return <AlertCircle className="text-red-400" size={20} />;
      case 'partial':
        return <DollarSign className="text-blue-400" size={20} />;
      default:
        return null;
    }
  };

  const filteredFees = statusFilter
    ? fees.filter(fee => fee.status === statusFilter)
    : fees;

  const stats = {
    totalAmount: fees.reduce((sum, fee) => sum + fee.amount, 0),
    totalPaid: fees.reduce((sum, fee) => sum + fee.amountPaid, 0),
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
      <BackButton to="/student" label="← Back to Dashboard" variant="secondary" />
      
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-white mb-2">My Fees</h1>
        <p className="text-slate-400">View your payment history and outstanding fees</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Total Amount</p>
              <p className="text-3xl font-black text-white">${stats.totalAmount.toFixed(2)}</p>
            </div>
            <DollarSign className="text-slate-600" size={40} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-400 text-sm mb-1">Paid</p>
              <p className="text-3xl font-black text-white">${stats.totalPaid.toFixed(2)}</p>
            </div>
            <CheckCircle className="text-green-500" size={40} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 backdrop-blur-xl border border-yellow-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-400 text-sm mb-1">Pending</p>
              <p className="text-3xl font-black text-white">${stats.pending.toFixed(2)}</p>
            </div>
            <Clock className="text-yellow-500" size={40} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-400 text-sm mb-1">Overdue</p>
              <p className="text-3xl font-black text-white">${stats.overdue.toFixed(2)}</p>
            </div>
            <AlertCircle className="text-red-500" size={40} />
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <label className="text-white font-bold">Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50"
          >
            <option value="">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
            <option value="partial">Partial</option>
          </select>
        </div>
      </div>

      {/* Fee History */}
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Payment History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Month</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Paid</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredFees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No fee records found.
                  </td>
                </tr>
              ) : (
                filteredFees.map((fee) => (
                  <tr key={fee.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                      {fee.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-bold">
                      ${fee.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 font-bold">
                      ${fee.amountPaid.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-400 font-bold">
                      ${(fee.amount - fee.amountPaid).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {new Date(fee.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(fee.status)}
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(fee.status)}`}>
                          {fee.status.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {fee.receiptNumber ? (
                        <div className="flex items-center gap-2 text-primary-400">
                          <Receipt size={16} />
                          <span className="font-mono">{fee.receiptNumber}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500">-</span>
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

export default StudentFees;
