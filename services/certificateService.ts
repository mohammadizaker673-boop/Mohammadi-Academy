import { addDoc, collection, getDocs, query, Timestamp, where } from 'firebase/firestore';
import { db } from './firebase';
import { CertificateRecord } from '../types/certificate.types';

export const issueCertificate = async (params: {
  userId: string;
  studentId: string;
  courseTitle: string;
  achievement: string;
}) => {
  const docRef = await addDoc(collection(db, 'certificates'), {
    userId: params.userId,
    studentId: params.studentId,
    courseTitle: params.courseTitle,
    achievement: params.achievement,
    status: 'issued',
    issuedAt: Timestamp.now()
  });
  return docRef.id;
};

export const listCertificatesForStudent = async (studentId: string): Promise<CertificateRecord[]> => {
  const certificatesRef = collection(db, 'certificates');
  const certificatesQuery = query(certificatesRef, where('studentId', '==', studentId));
  const snapshot = await getDocs(certificatesQuery);
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      userId: data.userId,
      studentId: data.studentId,
      courseTitle: data.courseTitle,
      achievement: data.achievement,
      status: data.status,
      issuedAt: data.issuedAt?.toDate?.() || new Date()
    } as CertificateRecord;
  });
};
