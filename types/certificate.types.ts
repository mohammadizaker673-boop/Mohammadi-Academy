export type CertificateStatus = 'issued' | 'revoked';

export interface CertificateRecord {
  id: string;
  userId: string;
  studentId: string;
  courseTitle: string;
  achievement: string;
  issuedAt: Date;
  status: CertificateStatus;
}
