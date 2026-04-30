import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { DollarSign, Plus, Edit2, Trash2, X, Save } from 'lucide-react';

interface FeePlan {
  id?: string;
  name: string;
  studentType: 'online' | 'offline';
  planType: 'one-time' | 'monthly' | 'installment';
  
  // Base fees
  coursePrice?: number;
  admissionFee?: number;
  materialFee?: number;
  transportFee?: number;
  
  // Add-ons (for online)
  certificateFee?: number;
  examFee?: number;
  extraCourseFee?: number;
  
  // Installment settings
  installmentCount?: number;
  installmentAmount?: number;
  
  // Discount
  discountPercent?: number;
  discountAmount?: number;
  
  // Late fee
  lateFeeEnabled: boolean;
  lateFeeAmount?: number;
  lateFeeDaysAfter?: number;
  
  // Status
  isActive: boolean;
  description?: string;
  createdAt?: any;
  updatedAt?: any;
}

export default function FeePlans() {
  const [plans, setPlans] = useState<FeePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<FeePlan | null>(null);
  const [formData, setFormData] = useState<FeePlan>({
    name: '',
    studentType: 'online',
    planType: 'monthly',
    coursePrice: 0,
    lateFeeEnabled: false,
    isActive: true,
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'feePlans'));
      const plansData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as FeePlan[];
      setPlans(plansData);
    } catch (error) {
      console.error('Error fetching fee plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const planData = {
        ...formData,
        updatedAt: Timestamp.now(),
      };

      if (editingPlan?.id) {
        await updateDoc(doc(db, 'feePlans', editingPlan.id), planData);
      } else {
        await addDoc(collection(db, 'feePlans'), {
          ...planData,
          createdAt: Timestamp.now(),
        });
      }

      resetForm();
      fetchPlans();
    } catch (error) {
      console.error('Error saving fee plan:', error);
      alert('Failed to save fee plan');
    }
  };

  const handleEdit = (plan: FeePlan) => {
    setEditingPlan(plan);
    setFormData(plan);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this fee plan?')) return;
    try {
      await deleteDoc(doc(db, 'feePlans', id));
      fetchPlans();
    } catch (error) {
      console.error('Error deleting fee plan:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      studentType: 'online',
      planType: 'monthly',
      coursePrice: 0,
      lateFeeEnabled: false,
      isActive: true,
    });
    setEditingPlan(null);
    setShowModal(false);
  };

  const calculateTotalAmount = (plan: FeePlan): number => {
    let total = 0;
    
    // Base fees
    total += plan.coursePrice || 0;
    total += plan.admissionFee || 0;
    total += plan.materialFee || 0;
    total += plan.transportFee || 0;
    
    // Add-ons
    total += plan.certificateFee || 0;
    total += plan.examFee || 0;
    total += plan.extraCourseFee || 0;
    
    // Apply discount
    if (plan.discountPercent) {
      total -= total * (plan.discountPercent / 100);
    }
    if (plan.discountAmount) {
      total -= plan.discountAmount;
    }
    
    return Math.max(0, total);
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
            <DollarSign className="text-primary-500" size={32} />
            Fee Plans
          </h1>
          <p className="text-slate-300 mt-2">Define pricing structure for online and offline students</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg hover:from-primary-600 hover:to-blue-700 transition font-semibold"
        >
          <Plus size={20} />
          Create Fee Plan
        </button>
      </div>

      {/* System Connectivity Info */}
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-xl p-6 border border-primary-500/20">
        <h3 className="font-bold text-white mb-3 flex items-center gap-2">
          <DollarSign size={20} className="text-primary-400" />
          Financial System Workflow
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-700/40 rounded-lg p-4 border border-primary-500/20">
            <div className="font-semibold text-primary-300 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs">1</span>
              Fee Plans
            </div>
            <p className="text-xs text-slate-300">Define pricing structure for online/offline students</p>
          </div>
          <div className="bg-slate-700/40 rounded-lg p-4 border border-blue-500/20">
            <div className="font-semibold text-blue-300 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">2</span>
              Invoices
            </div>
            <p className="text-xs text-slate-300">Create payment requests using fee plans or manual entry</p>
          </div>
          <div className="bg-slate-700/40 rounded-lg p-4 border border-accent-500/20">
            <div className="font-semibold text-accent-300 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 bg-accent-500 text-white rounded-full flex items-center justify-center text-xs">3</span>
              Payments
            </div>
            <p className="text-xs text-slate-300">Record money collected, auto-updates invoice status</p>
          </div>
          <div className="bg-slate-700/40 rounded-lg p-4 border border-green-500/20">
            <div className="font-semibold text-green-300 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">4</span>
              Reports
            </div>
            <p className="text-xs text-slate-300">View analytics, income breakdown, and overdue list</p>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-3">💡 All modules are connected: Fee Plans → Invoices → Payments → Reports</p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-slate-800 rounded-xl shadow-lg border border-white/10 overflow-hidden">
            <div className={`p-4 ${plan.studentType === 'online' ? 'bg-gradient-to-r from-primary-500 to-accent-500' : 'bg-gradient-to-r from-purple-500 to-pink-600'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <p className="text-white/80 text-sm mt-1 capitalize">
                    {plan.studentType} • {plan.planType}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${plan.isActive ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}`}>
                  {plan.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {/* Pricing Details */}
              <div className="space-y-2 text-sm">
                {plan.studentType === 'online' ? (
                  <>
                    {plan.coursePrice > 0 && (
                      <div className="flex justify-between">
                        <span className="text-white">Course Price:</span>
                        <span className="font-semibold text-white">${plan.coursePrice}</span>
                      </div>
                    )}
                    {plan.certificateFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-white">Certificate:</span>
                        <span className="font-semibold text-white">+${plan.certificateFee}</span>
                      </div>
                    )}
                    {plan.examFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-white">Exam Fee:</span>
                        <span className="font-semibold text-white">+${plan.examFee}</span>
                      </div>
                    )}
                    {plan.extraCourseFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-white">Extra Course:</span>
                        <span className="font-semibold text-white">+${plan.extraCourseFee}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {plan.admissionFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-white">Admission Fee:</span>
                        <span className="font-semibold text-white">${plan.admissionFee}</span>
                      </div>
                    )}
                    {plan.coursePrice > 0 && (
                      <div className="flex justify-between">
                        <span className="text-white">Course Fee:</span>
                        <span className="font-semibold text-white">${plan.coursePrice}</span>
                      </div>
                    )}
                    {plan.materialFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-white">Material Fee:</span>
                        <span className="font-semibold text-white">${plan.materialFee}</span>
                      </div>
                    )}
                    {plan.transportFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-white">Transport Fee:</span>
                        <span className="font-semibold text-white">${plan.transportFee}</span>
                      </div>
                    )}
                  </>
                )}

                {/* Discount */}
                {(plan.discountPercent > 0 || plan.discountAmount > 0) && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span className="font-semibold">
                      -{plan.discountPercent > 0 ? `${plan.discountPercent}%` : `$${plan.discountAmount}`}
                    </span>
                  </div>
                )}

                {/* Installment */}
                {plan.planType === 'installment' && plan.installmentCount > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>Installments:</span>
                    <span className="font-semibold">{plan.installmentCount} × ${plan.installmentAmount}</span>
                  </div>
                )}

                {/* Late Fee */}
                {plan.lateFeeEnabled && (
                  <div className="flex justify-between text-red-600">
                    <span>Late Fee:</span>
                    <span className="font-semibold">${plan.lateFeeAmount} after {plan.lateFeeDaysAfter} days</span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="pt-3 border-t border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-white">Total:</span>
                  <span className="text-2xl font-black text-primary-600">${calculateTotalAmount(plan)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3">
                <button
                  onClick={() => handleEdit(plan)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border bg-slate-900 border-white/10 text-white rounded-lg hover:bg-slate-900 transition text-white text-white text-white"
                >
                  <Edit2 size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(plan.id!)}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 border-b border-white/10 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">
                {editingPlan ? 'Edit Fee Plan' : 'Create Fee Plan'}
              </h2>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-white mb-2">Plan Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
                    placeholder="e.g., Basic Online Course Plan"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Student Type *</label>
                  <select
                    value={formData.studentType}
                    onChange={(e) => setFormData({ ...formData, studentType: e.target.value as 'online' | 'offline' })}
                    className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white text-white"
                    required
                  >
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Plan Type *</label>
                  <select
                    value={formData.planType}
                    onChange={(e) => setFormData({ ...formData, planType: e.target.value as any })}
                    className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white text-white"
                    required
                  >
                    <option value="one-time">One-Time Payment</option>
                    <option value="monthly">Monthly Subscription</option>
                    <option value="installment">Installment Plan</option>
                  </select>
                </div>
              </div>

              {/* Fees Section */}
              <div className="border-t border-white/10 pt-6">
                <h3 className="text-lg font-bold text-white mb-4">Fee Structure</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.studentType === 'online' ? (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">Course Price</label>
                        <input
                          type="number"
                          value={formData.coursePrice || ''}
                          onChange={(e) => setFormData({ ...formData, coursePrice: Number(e.target.value) })}
                          className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">Certificate Fee</label>
                        <input
                          type="number"
                          value={formData.certificateFee || ''}
                          onChange={(e) => setFormData({ ...formData, certificateFee: Number(e.target.value) })}
                          className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">Exam Fee</label>
                        <input
                          type="number"
                          value={formData.examFee || ''}
                          onChange={(e) => setFormData({ ...formData, examFee: Number(e.target.value) })}
                          className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">Extra Course Fee</label>
                        <input
                          type="number"
                          value={formData.extraCourseFee || ''}
                          onChange={(e) => setFormData({ ...formData, extraCourseFee: Number(e.target.value) })}
                          className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">Admission Fee</label>
                        <input
                          type="number"
                          value={formData.admissionFee || ''}
                          onChange={(e) => setFormData({ ...formData, admissionFee: Number(e.target.value) })}
                          className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">Course Fee</label>
                        <input
                          type="number"
                          value={formData.coursePrice || ''}
                          onChange={(e) => setFormData({ ...formData, coursePrice: Number(e.target.value) })}
                          className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">Material Fee</label>
                        <input
                          type="number"
                          value={formData.materialFee || ''}
                          onChange={(e) => setFormData({ ...formData, materialFee: Number(e.target.value) })}
                          className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">Transport Fee</label>
                        <input
                          type="number"
                          value={formData.transportFee || ''}
                          onChange={(e) => setFormData({ ...formData, transportFee: Number(e.target.value) })}
                          className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Installment Section */}
              {formData.planType === 'installment' && (
                <div className="border-t border-white/10 pt-6">
                  <h3 className="text-lg font-bold text-white mb-4">Installment Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Number of Installments</label>
                      <input
                        type="number"
                        value={formData.installmentCount || ''}
                        onChange={(e) => setFormData({ ...formData, installmentCount: Number(e.target.value) })}
                        className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
                        placeholder="e.g., 3"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Amount Per Installment</label>
                      <input
                        type="number"
                        value={formData.installmentAmount || ''}
                        onChange={(e) => setFormData({ ...formData, installmentAmount: Number(e.target.value) })}
                        className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Discount Section */}
              <div className="border-t border-white/10 pt-6">
                <h3 className="text-lg font-bold text-white mb-4">Discount (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Discount Percentage (%)</label>
                    <input
                      type="number"
                      value={formData.discountPercent || ''}
                      onChange={(e) => setFormData({ ...formData, discountPercent: Number(e.target.value), discountAmount: 0 })}
                      className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
                      placeholder="e.g., 10"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">OR Fixed Discount ($)</label>
                    <input
                      type="number"
                      value={formData.discountAmount || ''}
                      onChange={(e) => setFormData({ ...formData, discountAmount: Number(e.target.value), discountPercent: 0 })}
                      className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
                      placeholder="e.g., 50"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Late Fee Section */}
              <div className="border-t border-white/10 pt-6">
                <h3 className="text-lg font-bold text-white mb-4">Late Fee Rule</h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.lateFeeEnabled}
                      onChange={(e) => setFormData({ ...formData, lateFeeEnabled: e.target.checked })}
                      className="w-5 h-5 text-primary-500 rounded focus:ring-2 focus:ring-sky-500"
                    />
                    <span className="text-sm font-semibold text-white">Enable late fee charges</span>
                  </label>

                  {formData.lateFeeEnabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-8">
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">Late Fee Amount ($)</label>
                        <input
                          type="number"
                          value={formData.lateFeeAmount || ''}
                          onChange={(e) => setFormData({ ...formData, lateFeeAmount: Number(e.target.value) })}
                          className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
                          placeholder="e.g., 20"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">Days After Due Date</label>
                        <input
                          type="number"
                          value={formData.lateFeeDaysAfter || ''}
                          onChange={(e) => setFormData({ ...formData, lateFeeDaysAfter: Number(e.target.value) })}
                          className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
                          placeholder="e.g., 7"
                          min="1"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Description (Optional)</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
                  placeholder="Add any additional notes about this fee plan..."
                />
              </div>

              {/* Status */}
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 text-primary-500 rounded focus:ring-2 focus:ring-sky-500"
                />
                <span className="text-sm font-semibold text-white">Plan is active and can be assigned to students</span>
              </label>

              {/* Submit */}
              <div className="flex gap-4 pt-6 border-t border-white/10">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg hover:from-primary-600 hover:to-blue-700 transition font-semibold"
                >
                  <Save size={20} />
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
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
