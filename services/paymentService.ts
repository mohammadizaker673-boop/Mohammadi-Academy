import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { CoursePayment, StudentEnrollment, PaymentPlan } from '../types/payment.types';

export const paymentPlans: Record<string, PaymentPlan> = {
  'hifz-3-months': {
    id: 'hifz-3-months',
    name: '3-Month Access',
    price: 99,
    currency: 'USD',
    duration: '3 months',
    durationMonths: 3,
    description: 'Full access to Hifz system for 3 months',
    features: [
      'Complete Hifz memorization interface',
      'Revision tracking system',
      '3-layer revision scheduling',
      'Progress analytics',
      'Test modules',
      'Email support'
    ]
  },
  'hifz-6-months': {
    id: 'hifz-6-months',
    name: '6-Month Access',
    price: 179,
    currency: 'USD',
    duration: '6 months',
    durationMonths: 6,
    description: 'Full access to Hifz system for 6 months',
    features: [
      'Everything in 3-month plan',
      'Priority email support',
      'Teacher feedback access',
      'Advanced analytics'
    ]
  },
  'hifz-lifetime': {
    id: 'hifz-lifetime',
    name: 'Lifetime Access',
    price: 499,
    currency: 'USD',
    duration: 'Lifetime',
    durationMonths: 999,
    description: 'Lifetime access to Hifz system with all future updates',
    features: [
      'Everything in 6-month plan',
      'Lifetime updates',
      'Priority support',
      'Community access',
      'One-on-one guidance (limited)',
      'Certificate upon completion'
    ]
  },
  'hifz-monthly': {
    id: 'hifz-monthly',
    name: 'Monthly Access',
    price: 39,
    currency: 'USD',
    duration: '1 month',
    durationMonths: 1,
    description: 'Monthly access to Hifz system',
    features: [
      'Full Hifz system access',
      'Revision tracking',
      'Progress analytics',
      'Test modules',
      'Email support'
    ]
  }
};

class PaymentService {
  /**
   * Record a new payment transaction
   */
  async recordPayment(
    userId: string,
    courseId: string,
    courseName: string,
    paymentPlanId: string,
    amount: number
  ): Promise<CoursePayment> {
    try {
      const plan = paymentPlans[paymentPlanId];
      if (!plan) throw new Error('Invalid payment plan');

      // Calculate expiry date
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + plan.durationMonths);

      const paymentData: Omit<CoursePayment, 'id'> = {
        userId,
        courseId,
        courseName,
        paymentPlanId,
        amount: plan.price,
        currency: plan.currency,
        status: 'pending',
        paymentMethod: 'card',
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt
      };

      const docRef = await addDoc(collection(db, 'payments'), paymentData);
      return { id: docRef.id, ...paymentData } as CoursePayment;
    } catch (error) {
      console.error('Error recording payment:', error);
      throw error;
    }
  }

  /**
   * Complete a payment transaction
   */
  async completePayment(paymentId: string, transactionId: string): Promise<void> {
    try {
      const paymentRef = doc(db, 'payments', paymentId);
      await updateDoc(paymentRef, {
        status: 'completed',
        transactionId,
        paidAt: new Date(),
        updatedAt: new Date()
      });

      // Get payment details to create enrollment
      const paymentDoc = await getDoc(paymentRef);
      const payment = paymentDoc.data() as CoursePayment;

      // Create student enrollment
      await this.createEnrollment(
        payment.userId,
        payment.courseId,
        paymentId,
        payment.expiresAt
      );
    } catch (error) {
      console.error('Error completing payment:', error);
      throw error;
    }
  }

  /**
   * Create student enrollment record
   */
  async createEnrollment(
    userId: string,
    courseId: string,
    paymentId: string,
    expiresAt?: Date
  ): Promise<StudentEnrollment> {
    try {
      const enrollmentData: Omit<StudentEnrollment, 'id'> = {
        userId,
        courseId,
        enrolledAt: new Date(),
        paymentId,
        isPaid: true,
        expiresAt,
        accessLevel: expiresAt && expiresAt.getTime() > 999999999999 ? 'lifetime' : 'premium'
      };

      const docRef = await addDoc(collection(db, 'enrollments'), enrollmentData);
      return { id: docRef.id, ...enrollmentData } as StudentEnrollment;
    } catch (error) {
      console.error('Error creating enrollment:', error);
      throw error;
    }
  }

  /**
   * Check if user has paid for course
   */
  async hasAccessToCourse(userId: string, courseId: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, 'enrollments'),
        where('userId', '==', userId),
        where('courseId', '==', courseId),
        where('isPaid', '==', true)
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) return false;

      // Check if enrollment is still valid (not expired)
      for (const doc of querySnapshot.docs) {
        const enrollment = doc.data() as StudentEnrollment;
        if (!enrollment.expiresAt || new Date(enrollment.expiresAt) > new Date()) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error checking course access:', error);
      return false;
    }
  }

  /**
   * Get user's enrollment for a course
   */
  async getEnrollment(userId: string, courseId: string): Promise<StudentEnrollment | null> {
    try {
      const q = query(
        collection(db, 'enrollments'),
        where('userId', '==', userId),
        where('courseId', '==', courseId),
        where('isPaid', '==', true)
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) return null;

      const enrollment = querySnapshot.docs[0].data() as StudentEnrollment;
      
      // Check if still valid
      if (enrollment.expiresAt && new Date(enrollment.expiresAt) < new Date()) {
        return null;
      }

      return enrollment;
    } catch (error) {
      console.error('Error getting enrollment:', error);
      return null;
    }
  }

  /**
   * Get all user's course enrollments
   */
  async getUserEnrollments(userId: string): Promise<StudentEnrollment[]> {
    try {
      const q = query(
        collection(db, 'enrollments'),
        where('userId', '==', userId),
        where('isPaid', '==', true)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs
        .map(doc => doc.data() as StudentEnrollment)
        .filter(e => !e.expiresAt || new Date(e.expiresAt) > new Date());
    } catch (error) {
      console.error('Error getting enrollments:', error);
      return [];
    }
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(userId: string): Promise<CoursePayment[]> {
    try {
      const q = query(
        collection(db, 'payments'),
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as CoursePayment);
    } catch (error) {
      console.error('Error getting payment history:', error);
      return [];
    }
  }
}

export const paymentService = new PaymentService();
