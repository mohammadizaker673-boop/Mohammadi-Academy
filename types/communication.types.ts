// Communication System Types

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetAudience: 'all' | 'students' | 'teachers' | 'parents';
  priority: 'low' | 'medium' | 'high';
  publishedAt: Date;
  expiresAt?: Date;
  createdBy: string;
  status: 'draft' | 'published' | 'archived';
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  subject: string;
  content: string;
  attachments?: string[];
  isRead: boolean;
  sentAt: Date;
  readAt?: Date;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[]; // e.g., {{studentName}}, {{courseName}}
  category: 'admission' | 'payment' | 'reminder' | 'general';
  createdAt: Date;
  updatedAt: Date;
}
