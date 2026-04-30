import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, query, where, orderBy, Timestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { CreditCard, DollarSign, Plus, Search, CheckCircle, Upload, FileText, RefreshCw } from 'lucide-react';

interface Payment {
  id?: string;
  paymentNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  studentId: string;
  studentName: string;
  studentType: 'online' | 'offline';
  
  // Payment details
  amount: number;
  paymentMethod: 'gateway' | 'cash' | 'bank-transfer' | 'cheque';
  paymentDate: string;
  
  // For offline payments
  receiptNumber?: string;
  proofUrl?: string;
  chequeNumber?: string;
  bankName?: string;
  transactionId?: string;
  
  // Status
  status: 'pending' | 'completed' | 'refunded';
  isPartial: boolean;
  
  // Auto-generated receipt
  receiptGenerated: boolean;
  receiptUrl?: string;
  
  notes?: string;
  createdAt?: any;
  updatedAt?: any;
}

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<Payment>>({
    paymentMethod: 'cash',
    paymentDate: new Date().toISOString().split('T')[0],
    amount: 0,
    status: 'completed',
    isPartial: false,
    receiptGenerated: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [paymentsSnap, invoicesSnap] = await Promise.all([
        getDocs(query(collection(db, 'payments'), orderBy('createdAt', 'desc'))),
        getDocs(collection(db, 'invoices')),
      ]);

      setPayments(paymentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payment)));
      setInvoices(invoicesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePaymentNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000);
    return `PAY-${year}${month}-${random}`;
  };

  const handleInvoiceChange = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      setFormData({
        ...formData,
        invoiceId,
        invoiceNumber: invoice.invoiceNumber,
        studentId: invoice.studentId,
        studentName: invoice.studentName,
        studentType: invoice.studentType,
        amount: invoice.balance || invoice.total,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.invoiceId || !formData.amount || formData.amount <= 0) {
      alert('Please select an invoice and enter a valid payment amount');
      return;
    }
    
    const invoice = invoices.find(inv => inv.id === formData.invoiceId);
    if (!invoice) {
      alert('Invoice not found');
      return;
    }
    
    if (formData.amount > invoice.balance) {
      if (!confirm(`Payment amount ($${formData.amount}) exceeds invoice balance ($${invoice.balance}). Continue?`)) {
        return;
      }
    }
    
    try {
      const paymentData = {
        ...formData,
        paymentNumber: generatePaymentNumber(),
        receiptNumber: `REC-${Date.now()}`,
        receiptGenerated: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // Add payment
      await addDoc(collection(db, 'payments'), paymentData);

      // Update invoice
      const newAmountPaid = (invoice.amountPaid || 0) + (formData.amount || 0);
      const newBalance = invoice.total - newAmountPaid;
      const newStatus = newBalance <= 0 ? 'paid' : newBalance < invoice.total ? 'partially-paid' : 'unpaid';

      await updateDoc(doc(db, 'invoices', invoice.id), {
        amountPaid: newAmountPaid,
        balance: newBalance,
        status: newStatus,
        paidDate: newBalance <= 0 ? formData.paymentDate : invoice.paidDate,
        updatedAt: Timestamp.now(),
      });

      resetForm();
      fetchData();
      alert(`Payment recorded successfully! Invoice status: ${newStatus.toUpperCase()}`);
    } catch (error) {
      console.error('Error recording payment:', error);
      alert('Failed to record payment');
    }
  };

  const handleRefund = async (paymentId: string) => {
    if (!confirm('Are you sure you want to refund this payment?')) return;
    
    try {
      await updateDoc(doc(db, 'payments', paymentId), {
        status: 'refunded',
        updatedAt: Timestamp.now(),
      });
      
      fetchData();
      alert('Payment refunded successfully');
    } catch (error) {
      console.error('Error refunding payment:', error);
      alert('Failed to refund payment');
    }
  };

  const resetForm = () => {
    setFormData({
      paymentMethod: 'cash',
      paymentDate: new Date().toISOString().split('T')[0],
      amount: 0,
      status: 'completed',
      isPartial: false,
      receiptGenerated: false,
    });
    setShowModal(false);
  };

  const filteredPayments = payments.filter(payment =>
    payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.paymentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const todayCollection = payments
    .filter(p => p.paymentDate === new Date().toISOString().split('T')[0] && p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalCollection = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const getPaymentMethodBadge = (method: Payment['paymentMethod']) => {
    const styles = {
      'gateway': 'bg-blue-100 text-blue-700',
      'cash': 'bg-green-100 text-green-700',
      'bank-transfer': 'bg-purple-100 text-purple-700',
      'cheque': 'bg-orange-100 text-orange-700',
    };
    return styles[method];
  };

  const getStatusBadge = (status: Payment['status']) => {
    const styles = {
      'pending': 'bg-yellow-100 text-yellow-700',
      'completed': 'bg-green-100 text-green-700',
      'refunded': 'bg-red-100 text-red-700',
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <CreditCard className="text-primary-500" size={32} />
            Payments
          </h1>
          <p className="text-white mt-2">Record and manage payment collections</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg hover:from-primary-600 hover:to-blue-700 transition font-semibold"
        >
          <Plus size={20} />
          Record Payment
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-white/80 text-sm font-medium">Today's Collection</p>
          <p className="text-3xl font-bold mt-2">${todayCollection.toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-white/80 text-sm font-medium">Total Collection</p>
          <p className="text-3xl font-bold mt-2">${totalCollection.toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-white/80 text-sm font-medium">Total Payments</p>
          <p className="text-3xl font-bold mt-2">{payments.filter(p => p.status === 'completed').length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white" size={20} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by student, payment number, or invoice..."
          className="w-full pl-10 pr-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white text-white"
        />
      </div>

      {/* Payments Table */}
      <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-900 border-b border-white/10 text-white text-white">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Payment #</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Student</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Invoice #</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Amount</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Method</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Date</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredPayments.map((payment) => (
              <tr key={payment.id} className="hover:bg-slate-900 transition text-white">
                <td className="px-6 py-4">
                  <p className="font-semibold text-white">{payment.paymentNumber}</p>
                  {payment.receiptNumber && (
                    <p className="text-xs text-white">Receipt: {payment.receiptNumber}</p>
                  )}
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium text-white">{payment.studentName}</p>
                  <p className="text-xs text-white capitalize">{payment.studentType}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-white">{payment.invoiceNumber}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="font-bold text-white">${payment.amount}</p>
                  {payment.isPartial && (
                    <span className="text-xs text-blue-600">Partial</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentMethodBadge(payment.paymentMethod)}`}>
                    {payment.paymentMethod.replace('-', ' ').toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-white">{payment.paymentDate}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(payment.status)}`}>
                    {payment.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {payment.receiptGenerated && (
                      <button className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition" title="View Receipt">
                        <FileText size={18} />
                      </button>
                    )}
                    {payment.status === 'completed' && (
                      <button
                        onClick={() => handleRefund(payment.id!)}
                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition"
                        title="Refund"
                      >
                        <RefreshCw size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Record Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 border-b border-white/10 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Record Payment</h2>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <DollarSign size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-white mb-2">Select Invoice *</label>
                  <select
                    value={formData.invoiceId || ''}
                    onChange={(e) => handleInvoiceChange(e.target.value)}
                    className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white text-white"
                    required
                  >
                    <option value="">Choose an invoice</option>
                    {invoices
                      .filter(inv => inv.status !== 'paid' && inv.balance > 0)
                      .sort((a, b) => new Date(b.createdAt?.seconds || 0).getTime() - new Date(a.createdAt?.seconds || 0).getTime())
                      .map((invoice) => (
                        <option key={invoice.id} value={invoice.id}>
                          {invoice.invoiceNumber} - {invoice.studentName} - Balance: ${invoice.balance} ({invoice.status.toUpperCase()})
                        </option>
                      ))}
                  </select>
                  <p className="text-xs text-white mt-1">Only showing unpaid and partially-paid invoices</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Amount ($) *</label>
                  <input
                    type="number"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Payment Date *</label>
                  <input
                    type="date"
                    value={formData.paymentDate || ''}
                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                    className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white text-white"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-white mb-2">Payment Method *</label>
                  <select
                    value={formData.paymentMethod || ''}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                    className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white text-white"
                    required
                  >
                    <option value="cash">Cash</option>
                    <option value="bank-transfer">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                    <option value="gateway">Online Gateway</option>
                  </select>
                </div>

                {formData.paymentMethod === 'bank-transfer' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Bank Name</label>
                      <input
                        type="text"
                        value={formData.bankName || ''}
                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                        className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
                        placeholder="e.g., ABC Bank"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Transaction ID</label>
                      <input
                        type="text"
                        value={formData.transactionId || ''}
                        onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                        className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
                        placeholder="TXN123456"
                      />
                    </div>
                  </>
                )}

                {formData.paymentMethod === 'cheque' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-white mb-2">Cheque Number</label>
                    <input
                      type="text"
                      value={formData.chequeNumber || ''}
                      onChange={(e) => setFormData({ ...formData, chequeNumber: e.target.value })}
                      className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
                      placeholder="CHQ123456"
                    />
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-white mb-2">Notes</label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
                    placeholder="Additional payment details..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.isPartial}
                      onChange={(e) => setFormData({ ...formData, isPartial: e.target.checked })}
                      className="w-5 h-5 text-primary-500 rounded focus:ring-2 focus:ring-sky-500"
                    />
                    <span className="text-sm font-semibold text-white">This is a partial payment</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/10">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg hover:from-primary-600 hover:to-blue-700 transition font-semibold"
                >
                  <CheckCircle size={20} />
                  Record Payment
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
