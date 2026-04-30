# ðŸ•Œ Mohammadi Online Quran Academy - Complete LMS System

A comprehensive Learning Management System (LMS) for Islamic education with multi-portal architecture, built with React, TypeScript, Firebase, and Tailwind CSS.

## ðŸš€ Features Overview

### ðŸ“š Complete Course Management
- **Create & Manage Courses**: Full CRUD operations for course creation with rich metadata
- **Lesson Management**: Organize lessons with video content, PDFs, and homework assignments
- **Media Library**: Upload and manage educational resources
- **Course Enrollment**: Track student enrollments and progress

### ðŸ‘¥ Student Management
- **Student Registration**: Add students with complete profile information
- **Progress Tracking**: Monitor student performance across courses
- **Attendance Records**: Digital attendance marking and reporting
- **Fee Management**: Track payments, invoices, and financial records

### ðŸ‘¨â€ðŸ« Teacher Management
- **Teacher Profiles**: Comprehensive teacher information with qualifications
- **Course Assignments**: Assign teachers to specific courses
- **Schedule Management**: Manage teacher schedules and availability
- **Performance Tracking**: Monitor teaching effectiveness

### ðŸ“ Academic Features
- **Homework Management**: Create, assign, and grade homework assignments
- **Exams & Quizzes**: Build assessments with multiple question types
- **Results Dashboard**: Publish and manage student results
- **Attendance System**: Mark and track daily attendance

### ðŸ’° Finance Module
- **Invoice Generation**: Automatic invoice creation for fees
- **Payment Tracking**: Record and track all payments
- **Financial Reports**: Generate monthly/yearly revenue reports
- **Discount Codes**: Create and manage promotional discounts

### ðŸ“¢ Communication
- **Announcements**: Broadcast messages to students, teachers, or all users
- **Internal Messaging**: Direct communication between users
- **Email Templates**: Pre-designed templates for common communications

### ðŸŒ Website CMS
- **Content Management**: Edit homepage and courses page from admin panel
- **Media Manager**: Upload banners and promotional images
- **Pricing Management**: Update course pricing dynamically

## ðŸ—ï¸ Architecture

### Multi-Portal System
1. **Public Website** - Marketing and course information
2. **Admin Portal** - Complete system management
3. **Teacher Portal** - Teaching tools and student management
4. **Student Portal** - Course access and progress tracking

### Tech Stack
- **Frontend**: React 19.2.3 + TypeScript
- **Build Tool**: Vite 6.4.1
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Routing**: React Router v6
- **Icons**: Lucide React

## ðŸ“ Project Structure

```
mohammadi-academy/
â”œâ”€â”€ components/
â”‚   â”œâ”€â”€ admin/
â”‚   â”‚   â””â”€â”€ AdminLayout.tsx          # Admin navigation with expandable menus
â”‚   â”œâ”€â”€ teacher/
â”‚   â”‚   â””â”€â”€ TeacherLayout.tsx        # Teacher portal layout
â”‚   â”œâ”€â”€ student/
â”‚   â”‚   â””â”€â”€ StudentLayout.tsx        # Student portal layout
â”‚   â”œâ”€â”€ AdmissionForm.tsx            # Public admission form
â”‚   â””â”€â”€ ChatWidget.tsx               # AI-powered chat support
â”œâ”€â”€ pages/
â”‚   â”œâ”€â”€ admin/
â”‚   â”‚   â”œâ”€â”€ courses/
â”‚   â”‚   â”‚   â”œâ”€â”€ CreateCourse.tsx     # Course creation form
â”‚   â”‚   â”‚   â””â”€â”€ CourseList.tsx       # All courses management
â”‚   â”‚   â”œâ”€â”€ students/
â”‚   â”‚   â”‚   â””â”€â”€ AddStudent.tsx       # Student registration
â”‚   â”‚   â”œâ”€â”€ teachers/
â”‚   â”‚   â”‚   â””â”€â”€ AddTeacher.tsx       # Teacher registration
â”‚   â”‚   â”œâ”€â”€ academic/
â”‚   â”‚   â”‚   â”œâ”€â”€ CreateHomework.tsx   # Homework assignment
â”‚   â”‚   â”‚   â””â”€â”€ HomeworkList.tsx     # Homework management
â”‚   â”‚   â”œâ”€â”€ communication/
â”‚   â”‚   â”‚   â””â”€â”€ AnnouncementsPage.tsx # Announcements system
â”‚   â”‚   â”œâ”€â”€ AdminDashboard.tsx       # Main dashboard with stats
â”‚   â”‚   â”œâ”€â”€ StudentManagement.tsx
â”‚   â”‚   â”œâ”€â”€ TeacherManagement.tsx
â”‚   â”‚   â”œâ”€â”€ AttendanceManagement.tsx
â”‚   â”‚   â”œâ”€â”€ FeeManagement.tsx
â”‚   â”‚   â””â”€â”€ AdmissionRequests.tsx
â”‚   â”œâ”€â”€ teacher/
â”‚   â”œâ”€â”€ student/
â”‚   â”œâ”€â”€ HomePage.tsx                 # Public landing page
â”‚   â”œâ”€â”€ CoursesPage.tsx              # Public courses listing
â”‚   â””â”€â”€ CourseDetailPage.tsx         # Individual course details
â”œâ”€â”€ types/
â”‚   â”œâ”€â”€ course-management.types.ts   # Course system interfaces
â”‚   â”œâ”€â”€ academic.types.ts            # Academic module interfaces
â”‚   â”œâ”€â”€ finance.types.ts             # Finance system interfaces
â”‚   â””â”€â”€ communication.types.ts       # Communication interfaces
â”œâ”€â”€ services/
â”‚   â”œâ”€â”€ firebase.ts                  # Firebase configuration
â”‚   â””â”€â”€ geminiService.ts             # AI chat integration
â”œâ”€â”€ data/
â”‚   â””â”€â”€ courses.ts                   # Course content data
â””â”€â”€ App.tsx                          # Main application routing
```

## ðŸ—„ï¸ Database Schema

### Collections

#### `courses`
```typescript
{
  id: string;
  title: string;
  description: string;
  category: 'quran' | 'arabic' | 'islamic-studies' | 'other';
  type: 'online' | 'offline' | 'both';
  price: number;
  teacherId?: string;
  status: 'draft' | 'published' | 'archived';
  thumbnailUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### `students`
```typescript
{
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: 'male' | 'female';
  address: string;
  guardianName?: string;
  guardianPhone?: string;
  enrollmentType: 'online' | 'offline' | 'both';
  status: 'active' | 'inactive';
  enrolledAt: Date;
  createdAt: Date;
}
```

#### `teachers`
```typescript
{
  id: string;
  name: string;
  email: string;
  phone: string;
  qualification: string;
  specialization: 'quran' | 'arabic' | 'islamic-studies' | 'other';
  experience: number;
  salary: number;
  joiningDate: Date;
  status: 'active' | 'inactive';
  createdAt: Date;
}
```

#### `homework`
```typescript
{
  id: string;
  courseId: string;
  lessonId?: string;
  title: string;
  description: string;
  dueDate: Date;
  assignedTo: string[];
  status: 'active' | 'expired';
  createdBy: string;
  createdAt: Date;
}
```

#### `announcements`
```typescript
{
  id: string;
  title: string;
  content: string;
  targetAudience: 'all' | 'students' | 'teachers' | 'parents';
  priority: 'low' | 'medium' | 'high';
  publishedAt: Date;
  createdBy: string;
  status: 'draft' | 'published' | 'archived';
}
```

## ðŸŽ¯ Admin Portal Navigation

### Main Sections (8 Major Modules)

1. **ðŸ“Š Dashboard** - Real-time statistics and quick actions
2. **ðŸ“š Courses** (Expandable)
   - Create Course
   - Course List
   - Lessons Manager
   - Media Library
3. **ðŸ‘¥ Students** (Expandable)
   - Add Student
   - All Students
   - Progress Records
   - Admissions
4. **ðŸ‘¨â€ðŸ« Teachers** (Expandable)
   - Add Teacher
   - Teacher List
   - Schedule
5. **ðŸ“ Academic** (Expandable)
   - Attendance
   - Homework
   - Exams & Quizzes
   - Results
6. **ðŸ’° Finance** (Expandable)
   - Fees
   - Invoices
   - Payments
   - Reports
7. **ðŸ“¢ Communication** (Expandable)
   - Announcements
   - Messages
8. **ðŸŒ Website CMS** (Expandable)
   - Home Page
   - Courses Page
   - Media & Banners

## ðŸš¦ Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Firebase account with Firestore enabled
- Firebase configuration credentials

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd mohammadi-academy
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Firebase**
Create a `.env` file in the root directory:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

4. **Start development server**
```bash
npm run dev
```

The application will be available at `http://localhost:3001`

## ðŸ” Authentication & Roles

### User Roles
- **Admin**: Full system access with all management capabilities
- **Teacher**: Access to assigned courses, attendance, and student management
- **Student**: Access to enrolled courses, homework, and personal records

### Login Credentials (Default)
```
Admin: admin@mohammadiacademy.com / admin123
Teacher: teacher@mohammadiacademy.com / teacher123
Student: student@mohammadiacademy.com / student123
```

## ðŸ“± Responsive Design

The system is fully responsive and optimized for:
- ðŸ“± Mobile devices (320px+)
- ðŸ“± Tablets (768px+)
- ðŸ’» Desktops (1024px+)
- ðŸ–¥ï¸ Large screens (1920px+)

## ðŸŽ¨ Design System

### Color Palette
- **Primary Gradient**: Sky-500 to Purple-400
- **Background**: #0a0f2b (Deep Navy)
- **Surfaces**: Slate-800/900 with backdrop blur
- **Text**: White with slate variants for hierarchy

### Typography
- **Headings**: Font-black (900 weight) for emphasis
- **Body**: Font-semibold for labels, regular for content
- **Sizes**: Responsive scaling with Tailwind classes

## ðŸ”„ Current Implementation Status

### âœ… Completed
- [x] Complete admin navigation structure (8 sections, 30+ menu items)
- [x] Expandable menu system with active state detection
- [x] Course Management (Create, List, View)
- [x] Student Management (Add, List)
- [x] Teacher Management (Add, List)
- [x] Homework System (Create, Assign, List)
- [x] Announcements System (Create, Broadcast, View)
- [x] Attendance Tracking
- [x] Fee Management
- [x] Admission Workflow
- [x] Public course pages with detailed syllabi
- [x] Real-time dashboard with statistics
- [x] Firebase Firestore integration
- [x] TypeScript interfaces for all modules

### ðŸ”„ In Progress
- [ ] Lessons Manager with video/PDF upload
- [ ] Media Library with file management
- [ ] Exams & Quizzes builder
- [ ] Invoice generation system
- [ ] Payment tracking with receipts
- [ ] Internal messaging system
- [ ] Website CMS editor
- [ ] Progress tracking dashboard
- [ ] Certificate generation

### ðŸ“‹ Planned Features
- [ ] Email notification system
- [ ] SMS integration
- [ ] Mobile app (React Native)
- [ ] Video conferencing integration
- [ ] Automated backup system
- [ ] Multi-language support (Arabic/English)
- [ ] Advanced analytics and reporting
- [ ] Parent portal access

## ðŸ¤ Contributing

This is a private academy project. For questions or support, contact the development team.

## ðŸ“„ License

Proprietary - Mohammadi Online Quran Academy Â© 2024

## ðŸ“ž Support

For technical support or inquiries:
- Email: support@mohammadiacademy.com
- Phone: [Contact Number]
- Website: https://mohammadiacademy.com

---

**Built with â¤ï¸ for Islamic Education** ðŸ•Œ

