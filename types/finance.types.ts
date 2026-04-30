// Finance System Types

export interface Invoice {
  id: string;
  studentId: string;
  invoiceNumber: string;
  amount: number;
  discountAmount: number;
  finalAmount: number;
  dueDate: Date;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
  createdAt: Date;
}

export interface InvoiceItem {
  id: string;
  description: string;
  courseId?: string;
  amount: number;
  quantity: number;
}

export interface Payment {
  id: string;
  invoiceId: string;
  studentId: string;
  amount: number;
  paymentMethod: 'cash' | 'bank-transfer' | 'card' | 'online';
  transactionId?: string;
  paymentDate: Date;
  receivedBy: string; // admin/staff ID
  notes?: string;
}

export interface Discount {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minAmount?: number;
  maxDiscount?: number;
  validFrom: Date;
  validUntil: Date;
  usageLimit?: number;
  usedCount: number;
  status: 'active' | 'expired' | 'disabled';
  createdAt: Date;
}

export interface FinanceReport {
  id: string;
  reportType: 'monthly' | 'yearly' | 'custom';
  startDate: Date;
  endDate: Date;
  totalRevenue: number;
  totalPending: number;
  totalOverdue: number;
  totalPaid: number;
  paymentBreakdown: {
    method: string;
    amount: number;
  }[];
  generatedAt: Date;
  generatedBy: string;
}
