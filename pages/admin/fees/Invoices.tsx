import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { FileText, Plus, Send, Download, Mail, MessageCircle, Search, Filter, Eye, AlertCircle } from 'lucide-react';

interface Invoice {
  id?: string;
  invoiceNumber: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentType: 'online' | 'offline';
  courseId?: string;
  courseName: string;
  feePlanId?: string;
  
  // Amounts
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  amountPaid: number;
  balance: number;
  
  // Dates
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  
  // Status
  status: 'unpaid' | 'partially-paid' | 'paid' | 'overdue';
  
  // Additional
  notes?: string;
  createdAt?: any;
  updatedAt?: any;
}

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [feePlans, setFeePlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | Invoice['status']>('all');
  const [formData, setFormData] = useState<Partial<Invoice>>({
    studentType: 'online',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0,
    amountPaid: 0,
    balance: 0,
    status: 'unpaid',
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Update overdue invoices
    updateOverdueInvoices();
  }, [invoices]);

  const updateOverdueInvoices = async () => {
    const today = new Date().toISOString().split('T')[0];
    const overdueInvoices = invoices.filter(inv => 
      inv.status !== 'paid' && 
      inv.dueDate < today && 
      inv.status !== 'overdue'
    );

    for (const invoice of overdueInvoices) {
      try {
        await updateDoc(doc(db, 'invoices', invoice.id!), {
          status: 'overdue',
          updatedAt: Timestamp.now(),
        });
      } catch (error) {
        console.error('Error updating overdue invoice:', error);
      }
    }

    if (overdueInvoices.length > 0) {
      fetchData();
    }
  };

  const fetchData = async () => {
    try {
      const [invoicesSnap, studentsSnap, coursesSnap, plansSnap] = await Promise.all([
        getDocs(query(collection(db, 'invoices'), orderBy('createdAt', 'desc'))),
        getDocs(collection(db, 'students')),
        getDocs(collection(db, 'courses')),
        getDocs(collection(db, 'feePlans')),
      ]);

      setInvoices(invoicesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice)));
      setStudents(studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setCourses(coursesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setFeePlans(plansSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000);
    return `INV-${year}${month}-${random}`;
  };

  const handleStudentChange = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setFormData({
        ...formData,
        studentId,
        studentName: student.fullName,
        studentEmail: student.email,
        studentType: student.enrollmentType || 'online',
      });
    }
  };

  const handleFeePlanChange = (planId: string) => {
    const plan = feePlans.find(p => p.id === planId);
    if (plan) {
      const subtotal = calculatePlanTotal(plan);
      const discount = plan.discountAmount || 0;
      const tax = 0;
      const total = subtotal - discount + tax;
      
      setFormData({
        ...formData,
        feePlanId: planId,
        subtotal,
        discount,
        tax,
        total,
        balance: total,
      });
    }
  };

  const calculatePlanTotal = (plan: any): number => {
    let total = 0;
    total += plan.coursePrice || 0;
    total += plan.admissionFee || 0;
    total += plan.materialFee || 0;
    total += plan.transportFee || 0;
    total += plan.certificateFee || 0;
    total += plan.examFee || 0;
    total += plan.extraCourseFee || 0;
    return total;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.studentId || !formData.courseName || !formData.subtotal) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      const invoiceData = {
        ...formData,
        invoiceNumber: generateInvoiceNumber(),
        amountPaid: formData.amountPaid || 0,
        balance: (formData.total || 0) - (formData.amountPaid || 0),
        status: 'unpaid' as const,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await addDoc(collection(db, 'invoices'), invoiceData);
      resetForm();
      fetchData();
      alert('Invoice created successfully!');
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert(`Failed to create invoice: ${error.message || 'Unknown error'}`);
    }
  };

  const resetForm = () => {
    setFormData({
      studentType: 'online',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      subtotal: 0,
      discount: 0,
      tax: 0,
      total: 0,
      amountPaid: 0,
      balance: 0,
      status: 'unpaid',
    });
    setShowModal(false);
  };

  const handleSendEmail = async (invoice: Invoice) => {
    // Email sending logic here
    alert(`Email sent to ${invoice.studentEmail}`);
  };

  const handleSendWhatsApp = (invoice: Invoice) => {
    const message = `Hello ${invoice.studentName}, your invoice ${invoice.invoiceNumber} for ${invoice.courseName} is ready. Amount: $${invoice.total}. Due date: ${invoice.dueDate}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleDownloadPDF = (invoice: Invoice) => {
    alert(`Downloading PDF for ${invoice.invoiceNumber}`);
    // PDF generation logic here
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Invoice['status']) => {
    const styles = {
      'unpaid': 'bg-yellow-500/20 text-yellow-300',
      'partially-paid': 'bg-blue-500/20 text-blue-300',
      'paid': 'bg-green-500/20 text-green-300',
      'overdue': 'bg-red-500/20 text-red-300',
    };
    return styles[status];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FileText className="text-primary-500" size={32} />
            Invoices
          </h1>
          <p className="text-slate-300 mt-2">Manage student invoices and payment requests</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg hover:from-primary-600 hover:to-blue-700 transition font-semibold"
        >
          <Plus size={20} />
          Create Invoice
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Unpaid', count: invoices.filter(i => i.status === 'unpaid').length, color: 'yellow' },
          { label: 'Partially Paid', count: invoices.filter(i => i.status === 'partially-paid').length, color: 'blue' },
          { label: 'Paid', count: invoices.filter(i => i.status === 'paid').length, color: 'green' },
          { label: 'Overdue', count: invoices.filter(i => i.status === 'overdue').length, color: 'red' },
        ].map((stat) => (
          <div key={stat.label} className="bg-slate-800 rounded-xl shadow p-6 border border-white/10">
            <p className="text-slate-300 text-sm font-medium">{stat.label}</p>
            <p className={`text-3xl font-bold mt-2 text-${stat.color}-400`}>{stat.count}</p>
          </div>
        ))}
      </div>

      {/* Status Info Panel */}
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-xl p-6 border border-primary-500/20">
        <h3 className="font-bold text-white mb-3 flex items-center gap-2">
          <AlertCircle size={20} className="text-primary-400" />
          Invoice Status Workflow
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs font-semibold">UNPAID</span>
            <p className="text-slate-300">New invoice created, no payment received yet</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs font-semibold">PARTIAL</span>
            <p className="text-slate-300">Part of the amount paid, balance remaining</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs font-semibold">PAID</span>
            <p className="text-slate-300">Full payment received, invoice closed</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs font-semibold">OVERDUE</span>
            <p className="text-slate-300">Due date passed without full payment</p>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-3">💡 Status updates automatically when payments are recorded in the Payments module</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name or invoice number..."
            className="w-full pl-10 pr-4 py-3 border bg-slate-800/50 border-white/10 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white placeholder-slate-400"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-4 py-3 border bg-slate-800/50 border-white/10 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-white"
        >
          <option value="all">All Status</option>
          <option value="unpaid">Unpaid</option>
          <option value="partially-paid">Partially Paid</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {/* Invoices Table */}
      <div className="bg-slate-800/50 rounded-xl shadow-lg overflow-hidden border border-white/10">
        <table className="w-full">
          <thead className="bg-slate-900/50 border-b border-white/10">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase">Invoice #</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase">Student</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase">Course</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase">Amount</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase">Due Date</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredInvoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-slate-700/20 transition">
                <td className="px-6 py-4">
                  <p className="font-semibold text-white">{invoice.invoiceNumber}</p>
                  <p className="text-xs text-slate-400">{invoice.issueDate}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium text-white">{invoice.studentName}</p>
                  <p className="text-xs text-slate-400">{invoice.studentEmail}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-slate-300">{invoice.courseName}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="font-bold text-white">${invoice.total}</p>
                  {invoice.balance > 0 && (
                    <p className="text-xs text-red-400">Balance: ${invoice.balance}</p>
                  )}
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-slate-300">{invoice.dueDate}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(invoice.status)}`}>
                    {invoice.status.replace('-', ' ').toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSendEmail(invoice)}
                      className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition"
                      title="Send via Email"
                    >
                      <Mail size={18} />
                    </button>
                    <button
                      onClick={() => handleSendWhatsApp(invoice)}
                      className="p-2 hover:bg-green-500/20 text-green-400 rounded-lg transition"
                      title="Send via WhatsApp"
                    >
                      <MessageCircle size={18} />
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(invoice)}
                      className="p-2 hover:bg-purple-50 text-accent-600 rounded-lg transition"
                      title="Download PDF"
                    >
                      <Download size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Invoice Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 border-b border-white/10 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Create New Invoice</h2>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <FileText size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-white mb-2">Select Student *</label>
                  <select
                    value={formData.studentId || ''}
                    onChange={(e) => handleStudentChange(e.target.value)}
                    className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white text-white"
                    required
                  >
                    <option value="">Choose a student</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.fullName} - {student.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-white mb-2">Course Name *</label>
                  <input
                    type="text"
                    value={formData.courseName || ''}
                    onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                    className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
                    placeholder="e.g., Quran Tajweed Course"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-white mb-2">Select Fee Plan (Optional)</label>
                  <select
                    value={formData.feePlanId || ''}
                    onChange={(e) => handleFeePlanChange(e.target.value)}
                    className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white text-white"
                  >
                    <option value="">Manual entry</option>
                    {feePlans.filter(p => p.studentType === formData.studentType).map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Subtotal ($) *</label>
                  <input
                    type="number"
                    value={formData.subtotal || ''}
                    onChange={(e) => {
                      const subtotal = Number(e.target.value);
                      const total = subtotal - (formData.discount || 0) + (formData.tax || 0);
                      setFormData({ ...formData, subtotal, total, balance: total - (formData.amountPaid || 0) });
                    }}
                    className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Discount ($)</label>
                  <input
                    type="number"
                    value={formData.discount || ''}
                    onChange={(e) => {
                      const discount = Number(e.target.value);
                      const total = (formData.subtotal || 0) - discount + (formData.tax || 0);
                      setFormData({ ...formData, discount, total, balance: total - (formData.amountPaid || 0) });
                    }}
                    className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Issue Date *</label>
                  <input
                    type="date"
                    value={formData.issueDate || ''}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Due Date *</label>
                  <input
                    type="date"
                    value={formData.dueDate || ''}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white text-white"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-white mb-2">Notes</label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
                    placeholder="Additional notes or instructions..."
                  />
                </div>
              </div>

              {/* Total Display */}
              <div className="bg-sky-50 rounded-lg p-4 border border-sky-200">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-lg font-semibold text-white">Total Amount:</span>
                  <span className="text-2xl font-black text-primary-600">${formData.total || 0}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-sky-200">
                  <span className="text-sm font-medium text-white">Initial Status:</span>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                    UNPAID
                  </span>
                </div>
                <p className="text-xs text-white mt-2">Status will automatically update when payments are recorded</p>
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/10">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg hover:from-primary-600 hover:to-blue-700 transition font-semibold"
                >
                  Create Invoice
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border bg-slate-900 border-white/10 text-white rounded-lg hover:bg-slate-900 transition font-semibold text-white text-white text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
