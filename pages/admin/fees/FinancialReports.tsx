import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, AlertCircle, Users } from 'lucide-react';

export default function FinancialReports() {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  
  const [stats, setStats] = useState({
    todayCollection: 0,
    totalPending: 0,
    totalOverdue: 0,
    onlineIncome: 0,
    offlineIncome: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [paymentsSnap, invoicesSnap, studentsSnap] = await Promise.all([
        getDocs(collection(db, 'payments')),
        getDocs(collection(db, 'invoices')),
        getDocs(collection(db, 'students')),
      ]);

      const paymentsData = paymentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const invoicesData = invoicesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const studentsData = studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setPayments(paymentsData);
      setInvoices(invoicesData);
      setStudents(studentsData);

      calculateStats(paymentsData, invoicesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (paymentsData: any[], invoicesData: any[]) => {
    const today = new Date().toISOString().split('T')[0];
    
    const todayCollection = paymentsData
      .filter(p => p.paymentDate === today && p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalPending = invoicesData
      .filter(inv => inv.status === 'unpaid' || inv.status === 'partially-paid')
      .reduce((sum, inv) => sum + inv.balance, 0);

    const totalOverdue = invoicesData
      .filter(inv => inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.balance, 0);

    const onlineIncome = paymentsData
      .filter(p => p.studentType === 'online' && p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    const offlineIncome = paymentsData
      .filter(p => p.studentType === 'offline' && p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    setStats({
      todayCollection,
      totalPending,
      totalOverdue,
      onlineIncome,
      offlineIncome,
    });
  };

  const getCourseWiseIncome = () => {
    const courseIncome: { [key: string]: number } = {};
    
    payments
      .filter(p => p.status === 'completed')
      .forEach(payment => {
        const invoice = invoices.find(inv => inv.id === payment.invoiceId);
        if (invoice) {
          const courseName = invoice.courseName || 'Unknown';
          courseIncome[courseName] = (courseIncome[courseName] || 0) + payment.amount;
        }
      });

    return Object.entries(courseIncome)
      .map(([course, amount]) => ({ course, amount }))
      .sort((a, b) => b.amount - a.amount);
  };

  const getOverdueList = () => {
    return invoices
      .filter(inv => inv.status === 'overdue')
      .map(inv => {
        const student = students.find(s => s.id === inv.studentId);
        return {
          ...inv,
          studentPhone: student?.phone || 'N/A',
        };
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  };

  const getStudentFinancials = () => {
    return students.map(student => {
      const studentInvoices = invoices.filter(inv => inv.studentId === student.id);
      const totalFee = studentInvoices.reduce((sum, inv) => sum + inv.total, 0);
      const totalPaid = studentInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
      const balance = totalFee - totalPaid;
      const nextDue = studentInvoices
        .filter(inv => inv.balance > 0)
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];

      return {
        id: student.id,
        name: student.name,
        email: student.email,
        totalFee,
        totalPaid,
        balance,
        nextDue: nextDue?.dueDate || 'N/A',
      };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  const courseWiseIncome = getCourseWiseIncome();
  const overdueList = getOverdueList();
  const studentFinancials = getStudentFinancials();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <BarChart3 className="text-primary-500" size={32} />
          Financial Reports
        </h1>
        <p className="text-white mt-2">Comprehensive financial overview and analytics</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">Today's Collection</p>
              <p className="text-3xl font-bold mt-2">${stats.todayCollection.toFixed(2)}</p>
            </div>
            <TrendingUp size={32} className="text-white/60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">Total Pending</p>
              <p className="text-3xl font-bold mt-2">${stats.totalPending.toFixed(2)}</p>
            </div>
            <DollarSign size={32} className="text-white/60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">Total Overdue</p>
              <p className="text-3xl font-bold mt-2">${stats.totalOverdue.toFixed(2)}</p>
            </div>
            <AlertCircle size={32} className="text-white/60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">Total Students</p>
              <p className="text-3xl font-bold mt-2">{students.length}</p>
            </div>
            <Users size={32} className="text-white/60" />
          </div>
        </div>
      </div>

      {/* Online vs Offline Income */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl shadow-lg p-6 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4">Online vs Offline Income</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-white font-medium">Online Students</span>
                <span className="text-primary-600 font-bold">${stats.onlineIncome.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-primary-500 to-accent-500 h-3 rounded-full transition-all"
                  style={{
                    width: `${(stats.onlineIncome / (stats.onlineIncome + stats.offlineIncome)) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-white font-medium">Offline Students</span>
                <span className="text-accent-600 font-bold">${stats.offlineIncome.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-600 h-3 rounded-full transition-all"
                  style={{
                    width: `${(stats.offlineIncome / (stats.onlineIncome + stats.offlineIncome)) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex justify-between">
              <span className="text-white font-bold">Total Income:</span>
              <span className="text-xl font-black text-white">
                ${(stats.onlineIncome + stats.offlineIncome).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Course-wise Income */}
        <div className="bg-slate-800 rounded-xl shadow-lg p-6 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4">Course-wise Income</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {courseWiseIncome.slice(0, 10).map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-white text-sm">{item.course}</span>
                <span className="font-bold text-white">${item.amount.toFixed(2)}</span>
              </div>
            ))}
            {courseWiseIncome.length === 0 && (
              <p className="text-white text-center py-4">No income data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Overdue List */}
      <div className="bg-slate-800 rounded-xl shadow-lg p-6 border border-white/10">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <AlertCircle className="text-red-500" size={20} />
          Overdue Invoices ({overdueList.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900 border-b border-white/10 text-white text-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">Student</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">Invoice #</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">Due Date</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {overdueList.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-slate-900 text-white">
                  <td className="px-4 py-3 text-sm text-white">{invoice.studentName}</td>
                  <td className="px-4 py-3 text-sm text-white">{invoice.invoiceNumber}</td>
                  <td className="px-4 py-3 text-sm font-bold text-red-600">${invoice.balance}</td>
                  <td className="px-4 py-3 text-sm text-white">{invoice.dueDate}</td>
                  <td className="px-4 py-3 text-sm text-white">{invoice.studentPhone}</td>
                </tr>
              ))}
              {overdueList.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-white">
                    No overdue invoices 🎉
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Financial View */}
      <div className="bg-slate-800 rounded-xl shadow-lg p-6 border border-white/10">
        <h3 className="text-lg font-bold text-white mb-4">Student Financial Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900 border-b border-white/10 text-white text-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">Student</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">Total Fee</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">Paid</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">Balance</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">Next Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {studentFinancials.slice(0, 20).map((student) => (
                <tr key={student.id} className="hover:bg-slate-900 text-white">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-white">{student.name}</p>
                    <p className="text-xs text-white">{student.email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-white">${student.totalFee.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-green-600 font-semibold">
                    ${student.totalPaid.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-white">
                    ${student.balance.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-white">{student.nextDue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
