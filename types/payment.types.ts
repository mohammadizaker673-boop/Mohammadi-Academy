export interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  duration: string;
  durationMonths: number;
  description: string;
  features: string[];
}

export interface CoursePayment {
  id: string;
  userId: string;
  courseId: string;
  courseName: string;
  paymentPlanId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentMethod: 'card' | 'stripe' | 'bank-transfer' | 'crypto';
  transactionId?: string;
  paidAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentEnrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: Date;
  paymentId: string;
  isPaid: boolean;
  expiresAt?: Date;
  accessLevel: 'free' | 'premium' | 'lifetime';
}
