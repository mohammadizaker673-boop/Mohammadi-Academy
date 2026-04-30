import { addDoc, collection, getDocs, query, Timestamp, where } from 'firebase/firestore';
import { db } from './firebase';
import { Subscription } from '../types/subscription.types';

export const createSubscription = async (params: {
  userId: string;
  courseId: string;
  durationDays: number;
  price: number;
}) => {
  const startAt = new Date();
  const endAt = new Date();
  endAt.setDate(endAt.getDate() + params.durationDays);

  const docRef = await addDoc(collection(db, 'subscriptions'), {
    userId: params.userId,
    courseId: params.courseId,
    startAt: Timestamp.fromDate(startAt),
    endAt: Timestamp.fromDate(endAt),
    status: 'active',
    price: params.price
  });

  return docRef.id;
};

export const getActiveSubscription = async (userId: string, courseId: string): Promise<Subscription | null> => {
  const subscriptionsRef = collection(db, 'subscriptions');
  const subscriptionsQuery = query(
    subscriptionsRef,
    where('userId', '==', userId),
    where('courseId', '==', courseId),
    where('status', '==', 'active')
  );

  const snapshot = await getDocs(subscriptionsQuery);
  const now = new Date();

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const endAt = data.endAt?.toDate?.() as Date | undefined;
    const startAt = data.startAt?.toDate?.() as Date | undefined;
    if (endAt && endAt > now) {
      return {
        id: docSnap.id,
        userId: data.userId,
        courseId: data.courseId,
        startAt: startAt || now,
        endAt,
        status: data.status,
        price: data.price ?? 0
      };
    }
  }

  return null;
};

export const listUserSubscriptions = async (userId: string): Promise<Subscription[]> => {
  const subscriptionsRef = collection(db, 'subscriptions');
  const subscriptionsQuery = query(subscriptionsRef, where('userId', '==', userId));
  const snapshot = await getDocs(subscriptionsQuery);

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      userId: data.userId,
      courseId: data.courseId,
      startAt: data.startAt?.toDate?.(),
      endAt: data.endAt?.toDate?.(),
      status: data.status,
      price: data.price ?? 0
    } as Subscription;
  });
};
