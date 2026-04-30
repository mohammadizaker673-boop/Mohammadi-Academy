export type PaymentStatus = 'paid' | 'pending' | 'overdue' | 'partial';
export type PaymentMethod = 'cash' | 'card' | 'bank-transfer' | 'online';

export interface FeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  month: string; // Format: YYYY-MM
  amount: number;
  amountPaid: number;
  status: PaymentStatus;
  dueDate: string;
  paidDate?: string;
  paymentMethod?: PaymentMethod;
  receiptNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeePaymentData {
  feeRecordId: string;
  amountPaid: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  receiptNumber?: string;
  notes?: string;
}
