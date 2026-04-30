export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'pending';

export interface Subscription {
  id: string;
  userId: string;
  courseId: string;
  startAt: Date;
  endAt: Date;
  status: SubscriptionStatus;
  price: number;
}
