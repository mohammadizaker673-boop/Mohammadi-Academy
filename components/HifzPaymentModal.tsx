import React, { useState } from 'react';
import { X, Check, Lock, Zap } from 'lucide-react';
import { paymentPlans } from '../services/paymentService';
import { PaymentPlan } from '../types/payment.types';

interface HifzPaymentModalProps {
  onClose: () => void;
  onPaymentComplete: (planId: string) => void;
  isLoading?: boolean;
  courseName?: string;
}

const HifzPaymentModal: React.FC<HifzPaymentModalProps> = ({
  onClose,
  onPaymentComplete,
  isLoading = false,
  courseName = 'Hifz-ul-Quran System'
}) => {
  const [selectedPlan, setSelectedPlan] = useState<string>('hifz-3-months');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  const plans = Object.values(paymentPlans);
  const selectedPlanData = paymentPlans[selectedPlan];

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessingPayment(true);

    try {
      // Simulate payment processing
      // In production, integrate with Stripe or PayPal
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Call the completion callback
      onPaymentComplete(selectedPlan);
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <div className="sticky top-0 bg-slate-900/95 border-b border-slate-700/30 flex items-center justify-between p-6 z-10">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 flex items-center gap-2">
            <Lock size={24} />
            Premium Access Required
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          {!showPaymentForm ? (
            <>
              {/* Info Section */}
              <div className="mb-8">
                <p className="text-slate-300 text-center mb-4">
                  {courseName} is a premium course. Choose your subscription plan to unlock full access.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-cyan-900/20 border border-cyan-400/30 rounded-lg p-4">
                    <Zap className="text-cyan-400 mb-2" size={20} />
                    <p className="text-sm text-slate-300"><strong>What's Included:</strong></p>
                    <ul className="text-xs text-slate-400 mt-2 space-y-1">
                      <li>✓ Full memorization system</li>
                      <li>✓ Revision scheduler</li>
                      <li>✓ Progress tracking</li>
                      <li>✓ Test modules</li>
                      <li>✓ Analytics dashboard</li>
                    </ul>
                  </div>
                  <div className="bg-blue-900/20 border border-blue-400/30 rounded-lg p-4">
                    <Check className="text-blue-400 mb-2" size={20} />
                    <p className="text-sm text-slate-300"><strong>Benefits:</strong></p>
                    <ul className="text-xs text-slate-400 mt-2 space-y-1">
                      <li>✓ Lifetime learning journey</li>
                      <li>✓ Mobile-friendly interface</li>
                      <li>✓ Regular updates</li>
                      <li>✓ Email support</li>
                      <li>✓ Downloadable resources</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Plans Grid */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">Select Your Plan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {plans.map((plan: PaymentPlan) => (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedPlan === plan.id
                          ? 'border-cyan-400 bg-cyan-900/30 shadow-lg shadow-cyan-500/20'
                          : 'border-slate-600/40 bg-slate-800/20 hover:border-slate-500/60'
                      }`}
                    >
                      <h4 className="font-bold text-white mb-2">{plan.name}</h4>
                      <p className="text-2xl font-bold text-cyan-400 mb-1">${plan.price}</p>
                      <p className="text-xs text-slate-400 mb-3">{plan.duration}</p>
                      {selectedPlan === plan.id && (
                        <div className="bg-cyan-500/20 border border-cyan-400/50 rounded p-2 mb-2">
                          <Check className="text-cyan-400" size={16} />
                        </div>
                      )}
                      <p className="text-xs text-slate-300">{plan.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Plan Details */}
              {selectedPlanData && (
                <div className="mb-8 bg-gradient-to-r from-slate-800/50 to-slate-700/30 border border-slate-600/30 rounded-lg p-6">
                  <h4 className="text-white font-semibold mb-4">{selectedPlanData.name} - What's Included:</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedPlanData.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-300 text-sm">
                        <Check size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Button */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowPaymentForm(true)}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition"
                >
                  {isLoading ? 'Processing...' : `Pay $${selectedPlanData?.price}`}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Payment Form */}
              <form onSubmit={handlePaymentSubmit} className="max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-white mb-6">Payment Details</h3>

                <div className="space-y-4">
                  {/* Order Summary */}
                  <div className="bg-slate-700/20 border border-slate-600/30 rounded-lg p-4 mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-300">{selectedPlanData?.name}</span>
                      <span className="text-white font-semibold">${selectedPlanData?.price}</span>
                    </div>
                    <div className="border-t border-slate-600/30 pt-2 mt-2 flex justify-between">
                      <span className="text-white font-semibold">Total</span>
                      <span className="text-cyan-400 font-bold text-lg">${selectedPlanData?.price}</span>
                    </div>
                  </div>

                  {/* Cardholder Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="John Doe"
                      required
                      className="w-full bg-slate-700/30 border border-slate-600/30 rounded px-4 py-2 text-white placeholder-slate-500 focus:border-cyan-400/50 focus:outline-none"
                    />
                  </div>

                  {/* Card Number */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, '').slice(0, 16))}
                      placeholder="4242 4242 4242 4242"
                      required
                      maxLength={16}
                      className="w-full bg-slate-700/30 border border-slate-600/30 rounded px-4 py-2 text-white placeholder-slate-500 focus:border-cyan-400/50 focus:outline-none"
                    />
                  </div>

                  {/* Expiry and CVV */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value.slice(0, 5))}
                        placeholder="MM/YY"
                        required
                        className="w-full bg-slate-700/30 border border-slate-600/30 rounded px-4 py-2 text-white placeholder-slate-500 focus:border-cyan-400/50 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.slice(0, 3))}
                        placeholder="123"
                        required
                        maxLength={3}
                        className="w-full bg-slate-700/30 border border-slate-600/30 rounded px-4 py-2 text-white placeholder-slate-500 focus:border-cyan-400/50 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <p className="text-xs text-slate-400 text-center mt-4">
                    💳 Your payment information is encrypted and secure. We use industry-standard SSL encryption.
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowPaymentForm(false)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold transition"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={processingPayment || !cardNumber || !expiryDate || !cvv || !cardName}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                  >
                    {processingPayment ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Check size={18} />
                        Complete Payment
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HifzPaymentModal;
