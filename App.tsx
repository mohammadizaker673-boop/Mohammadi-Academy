import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import AdminLayout from './components/admin/AdminLayout';
import TeacherLayout from './components/teacher/TeacherLayout';
import StudentLayout from './components/student/StudentLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ScrollRevealInit from './components/motion/ScrollRevealInit';

const HomePage = React.lazy(() => import('./pages/HomePage'));
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage'));
const CompleteProfilePage = React.lazy(() => import('./pages/auth/CompleteProfilePage'));
const QuickStudentLogin = React.lazy(() => import('./pages/auth/QuickStudentLogin'));
const QuickTeacherLogin = React.lazy(() => import('./pages/auth/QuickTeacherLogin'));
const RegisterPage = React.lazy(() => import('./pages/auth/RegisterPage'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const TeacherDashboard = React.lazy(() => import('./pages/teacher/TeacherDashboard'));
const StudentDashboard = React.lazy(() => import('./pages/student/StudentDashboard'));
const StudentProgress = React.lazy(() => import('./pages/student/StudentProgress'));
const StudentAttendance = React.lazy(() => import('./pages/student/StudentAttendance'));
const StudentFees = React.lazy(() => import('./pages/student/StudentFees'));
const StudentAnnouncements = React.lazy(() => import('./pages/student/StudentAnnouncements'));
const StudentProfile = React.lazy(() => import('./pages/student/StudentProfile'));
const AutomatedCoursePlayer = React.lazy(() => import('./pages/student/AutomatedCoursePlayer'));
const CoursesPage = React.lazy(() => import('./pages/CoursesPage'));
const CourseDetailPage = React.lazy(() => import('./pages/CourseDetailPage'));
const AboutUs = React.lazy(() => import('./pages/AboutUs'));
const ContactUs = React.lazy(() => import('./pages/ContactUs'));
const ArticlesPage = React.lazy(() => import('./pages/ArticlesPage'));
const ArticleDetailPage = React.lazy(() => import('./pages/ArticleDetailPage'));
const FAQPage = React.lazy(() => import('./pages/FAQPage'));
const StudentProgressPage = React.lazy(() => import('./pages/StudentProgressPage'));
const AdminAnalyticsPage = React.lazy(() => import('./pages/AdminAnalyticsPage'));
const StartLearningPage = React.lazy(() => import('./pages/StartLearningPage'));
const AutomatedCourseDetailPage = React.lazy(() => import('./pages/AutomatedCourseDetailPage'));
const ParentDashboard = React.lazy(() => import('./pages/parent/ParentDashboard'));
const KnowledgeStoreHome = React.lazy(() => import('./pages/store/KnowledgeStoreHome'));
const KnowledgeStoreCategory = React.lazy(() => import('./pages/store/KnowledgeStoreCategory'));
const KnowledgeStoreProduct = React.lazy(() => import('./pages/store/KnowledgeStoreProduct'));
const KnowledgeStoreDashboard = React.lazy(() => import('./pages/store/KnowledgeStoreDashboard'));

// Hifz Qur'an Memorization System
const HifzCoursePage = React.lazy(() => import('./pages/HifzCoursePage'));
const HifzDebug = React.lazy(() => import('./pages/HifzDebug'));

// Arabic Learning Platform
const ArabicLearningPlatform = React.lazy(() => import('./pages/student/ArabicLearningPlatform'));

// Quran Tajweed Learning Platform
const QuranTajweedPlatform = React.lazy(() => import('./pages/student/QuranTajweedPlatform'));

const QuranTranslationCoursePage = React.lazy(() => import('./pages/student/QuranTranslationCoursePage'));
const StudentQuranTranslationPage = React.lazy(() => import('./pages/student/StudentQuranTranslationPage'));
const IslamicStudiesCoursePage = React.lazy(() => import('./pages/student/IslamicStudiesCoursePage'));
const StudentIslamicStudiesPage = React.lazy(() => import('./pages/student/StudentIslamicStudiesPage'));
const NooraniQaidaCoursePage = React.lazy(() => import('./pages/student/NooraniQaidaCoursePage'));
const StudentNooraniQaidaPage = React.lazy(() => import('./pages/student/StudentNooraniQaidaPage'));

// Teacher Pages
const MyStudents = React.lazy(() => import('./pages/teacher/MyStudents'));
const TeacherAttendance = React.lazy(() => import('./pages/teacher/TeacherAttendance'));
const Lessons = React.lazy(() => import('./pages/teacher/Lessons'));
const TeacherAnnouncements = React.lazy(() => import('./pages/teacher/TeacherAnnouncements'));
const TeacherQuranTranslationPage = React.lazy(() => import('./pages/teacher/TeacherQuranTranslationPage'));
const TeacherIslamicStudiesPage = React.lazy(() => import('./pages/teacher/TeacherIslamicStudiesPage'));
const TeacherNooraniQaidaPage = React.lazy(() => import('./pages/teacher/TeacherNooraniQaidaPage'));

// Admin Pages
const CreateNewCourse = React.lazy(() => import('./pages/admin/courses/CreateNewCourse'));
const CreateCourse = React.lazy(() => import('./pages/admin/courses/CreateCourse'));
const CourseDetails = React.lazy(() => import('./pages/admin/courses/CourseDetails'));
const CourseList = React.lazy(() => import('./pages/admin/courses/CourseList'));
const LessonsManager = React.lazy(() => import('./pages/admin/courses/LessonsManager'));
const MediaLibrary = React.lazy(() => import('./pages/admin/courses/MediaLibrary'));
const NooraniQaidaManagement = React.lazy(() => import('./pages/admin/courses/NooraniQaidaManagement'));
const AddStudent = React.lazy(() => import('./pages/admin/students/AddStudent'));
const StudentManagement = React.lazy(() => import('./pages/admin/StudentManagement'));
const ProgressRecords = React.lazy(() => import('./pages/admin/students/ProgressRecords'));
const AdmissionRequests = React.lazy(() => import('./pages/admin/AdmissionRequests'));
const AddTeacher = React.lazy(() => import('./pages/admin/teachers/AddTeacher'));
const TeacherManagement = React.lazy(() => import('./pages/admin/TeacherManagement'));
const TeacherSchedule = React.lazy(() => import('./pages/admin/teachers/TeacherSchedule'));
const Attendance = React.lazy(() => import('./pages/admin/Attendance'));
const HomeworkList = React.lazy(() => import('./pages/admin/academic/HomeworkList'));
const ExamsAndQuizzes = React.lazy(() => import('./pages/admin/academic/ExamsAndQuizzes'));
const Results = React.lazy(() => import('./pages/admin/academic/Results'));
const FeeManagement = React.lazy(() => import('./pages/admin/FeeManagement'));
const FeePlans = React.lazy(() => import('./pages/admin/fees/FeePlans'));
const Invoices = React.lazy(() => import('./pages/admin/fees/Invoices'));
const Payments = React.lazy(() => import('./pages/admin/fees/Payments'));
const FinancialReports = React.lazy(() => import('./pages/admin/fees/FinancialReports'));
const AnnouncementsPage = React.lazy(() => import('./pages/admin/communication/AnnouncementsPage'));
const Messages = React.lazy(() => import('./pages/admin/communication/Messages'));
const HomePageCMS = React.lazy(() => import('./pages/admin/cms/HomePageCMS'));
const CoursesPageCMS = React.lazy(() => import('./pages/admin/cms/CoursesPageCMS'));
const MediaBannersCMS = React.lazy(() => import('./pages/admin/cms/MediaBannersCMS'));
const AdminManagement = React.lazy(() => import('./pages/admin/settings/AdminManagement'));
const SeedData = React.lazy(() => import('./pages/admin/settings/SeedData'));
const PricingPackages = React.lazy(() => import('./pages/admin/packages/PackageManagement'));
const AdminFeaturesPage = React.lazy(() => import('./pages/admin/AdminFeaturesPage'));
const AdminStoreDashboard = React.lazy(() => import('./pages/admin/store/StoreDashboard'));
const SettingsDashboard = React.lazy(() => import('./pages/admin/settings/SettingsDashboard'));
const AICopilot = React.lazy(() => import('./pages/admin/AICopilot'));

// AI Center & Feature Pages
const AICenterDashboard = React.lazy(() => import('./pages/admin/AICenterDashboard'));
const AITutorChat = React.lazy(() => import('./components/ai/AITutorChat'));
const AIRecitationCoach = React.lazy(() => import('./components/ai/AIRecitationCoach'));
const AIHifzTracker = React.lazy(() => import('./components/ai/AIHifzTracker'));
const AIQuizGenerator = React.lazy(() => import('./components/ai/AIQuizGenerator'));
const AIQuranExplainer = React.lazy(() => import('./components/ai/AIQuranExplainer'));
const AILearningPath = React.lazy(() => import('./components/ai/AILearningPath'));
const AIParentReport = React.lazy(() => import('./components/ai/AIParentReport'));
const AIRecommendations = React.lazy(() => import('./components/ai/AIRecommendations'));
const AITeacherTools = React.lazy(() => import('./components/ai/AITeacherTools'));
const AITutorPage = React.lazy(() => import('./pages/AITutorPage'));
const CourseLearningPage = React.lazy(() => import('./pages/CourseLearningPage'));
const CreateCoursePage = React.lazy(() => import('./pages/CreateCoursePage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

// Error Boundary component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: 'white', padding: '40px', textAlign: 'center', backgroundColor: '#050a12', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '64px' }}>⚠️</div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Something went wrong</h1>
          <p style={{ color: '#94a3b8', maxWidth: '400px' }}>An unexpected error occurred. Please refresh the page or try again later.</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: '12px', padding: '12px 32px', background: 'linear-gradient(to right, #3b82f6, #f59e0b)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Scroll to top on route change
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  React.useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const LoadingFallback = () => {
  console.log('LoadingFallback shown - app is loading...');
  return (
    <div style={{ color: 'white', padding: '40px', textAlign: 'center', backgroundColor: '#0a0f2b', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      <div style={{ fontSize: '18px', marginBottom: '20px' }}>Loading...</div>
      <div style={{ width: '40px', height: '40px', border: '4px solid #38bdf8', borderTop: '4px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <SettingsProvider>
            <ErrorBoundary>
            <ScrollToTop />
            <ScrollRevealInit />
            <React.Suspense fallback={<LoadingFallback />}>
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/complete-profile" element={<CompleteProfilePage />} />
            <Route path="/quick-admin" element={<Navigate to="/login" replace />} />
            <Route path="/quick-admin-login" element={<Navigate to="/login" replace />} />
            <Route path="/quick-student" element={<QuickStudentLogin />} />
            <Route path="/quick-student-login" element={<QuickStudentLogin />} />
            <Route path="/quick-teacher" element={<QuickTeacherLogin />} />
            <Route path="/quick-teacher-login" element={<QuickTeacherLogin />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/noorani-qaida" element={<NooraniQaidaCoursePage />} />
            <Route path="/courses/quran-translation" element={<Navigate to="/quran-translation" replace />} />
            <Route path="/courses/islamic-studies" element={<Navigate to="/islamic-studies" replace />} />
            <Route path="/courses/:courseId" element={<CourseDetailPage />} />
            <Route path="/automated/:courseId" element={<AutomatedCourseDetailPage />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/ai-tutor" element={<AITutorPage />} />
            <Route path="/learn/:courseId" element={<CourseLearningPage />} />
            <Route path="/create-course" element={<CreateCoursePage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/articles" element={<ArticlesPage />} />
            <Route path="/articles/:id" element={<ArticleDetailPage />} />
            <Route path="/progress" element={<StudentProgressPage />} />
            <Route path="/analytics" element={<AdminAnalyticsPage />} />
            <Route path="/start" element={<StartLearningPage />} />
            <Route path="/parent" element={<ParentDashboard />} />
            <Route path="/store" element={<KnowledgeStoreHome />} />
            <Route path="/store/category/:categoryId" element={<KnowledgeStoreCategory />} />
            <Route path="/store/product/:productId" element={<KnowledgeStoreProduct />} />
            <Route path="/store/dashboard" element={<KnowledgeStoreDashboard />} />
            
            {/* Arabic Learning Platform */}
            <Route path="/learn-arabic" element={<ArabicLearningPlatform />} />
            
            {/* Quran Tajweed Learning Platform */}
            <Route path="/quran-tajweed" element={<QuranTajweedPlatform />} />
            
            <Route path="/quran-translation" element={<QuranTranslationCoursePage />} />
            <Route path="/islamic-studies" element={<IslamicStudiesCoursePage />} />
            
            {/* Debug Routes */}
            <Route path="/hifz-debug/:courseId" element={<HifzDebug />} />
            
            {/* Hifz Qur'an Memorization System Routes */}
            <Route path="/hifz" element={<HifzCoursePage userRole="student" />} />
            <Route path="/hifz/teacher" element={<HifzCoursePage userRole="teacher" />} />
            <Route path="/hifz/admin" element={<HifzCoursePage userRole="admin" />} />
            <Route path="/hifz/:courseId" element={<HifzCoursePage userRole="student" />} />
            <Route path="/hifz/teacher/:courseId" element={<HifzCoursePage userRole="teacher" />} />
            <Route path="/hifz/admin/:courseId" element={<HifzCoursePage userRole="admin" />} />
            
            {/* Admin Dashboard with Layout and Nested Routes */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="copilot" element={<AICopilot />} />
              <Route path="analytics" element={<AdminAnalyticsPage />} />
              <Route path="courses/create" element={<CreateNewCourse />} />
              <Route path="courses/view/:id" element={<CourseDetails />} />
              <Route path="courses/edit/:id" element={<CreateCourse />} />
              <Route path="courses/list" element={<CourseList />} />
              <Route path="courses/lessons" element={<LessonsManager />} />
              <Route path="courses/media" element={<MediaLibrary />} />
              <Route path="courses/noorani" element={<NooraniQaidaManagement />} />
              {/* Students Routes */}
              <Route path="students/add" element={<AddStudent />} />
              <Route path="students" element={<StudentManagement />} />
              <Route path="students/progress" element={<ProgressRecords />} />
              <Route path="admissions" element={<AdmissionRequests />} />
              {/* Teachers Routes */}
              <Route path="teachers/add" element={<AddTeacher />} />
              <Route path="teachers" element={<TeacherManagement />} />
              <Route path="teachers/schedule" element={<TeacherSchedule />} />
              {/* Academic Routes */}
              <Route path="attendance" element={<Attendance />} />
              <Route path="homework" element={<HomeworkList />} />
              <Route path="exams" element={<ExamsAndQuizzes />} />
              <Route path="results" element={<Results />} />
              {/* Finance Routes */}
              <Route path="fees" element={<FeeManagement />} />
              <Route path="fees/plans" element={<FeePlans />} />
              <Route path="fees/invoices" element={<Invoices />} />
              <Route path="fees/payments" element={<Payments />} />
              <Route path="fees/reports" element={<FinancialReports />} />
              {/* Communication Routes */}
              <Route path="announcements" element={<AnnouncementsPage />} />
              <Route path="messages" element={<Messages />} />
              {/* CMS Routes */}
              <Route path="cms/home" element={<HomePageCMS />} />
              <Route path="cms/courses" element={<CoursesPageCMS />} />
              <Route path="cms/media" element={<MediaBannersCMS />} />
              {/* Features Routes */}
              <Route path="features" element={<AdminFeaturesPage />} />
              {/* Settings Routes */}
              <Route path="settings" element={<SettingsDashboard />} />
              <Route path="settings/admins" element={<AdminManagement />} />
              <Route path="settings/seed-data" element={<SeedData />} />
              {/* Packages Routes */}
              <Route path="packages" element={<PricingPackages />} />
              {/* Knowledge Store */}
              <Route path="store" element={<AdminStoreDashboard />} />
              {/* Hifz System */}
              <Route path="hifz" element={<HifzCoursePage userRole="admin" />} />
              <Route path="hifz/:courseId" element={<HifzCoursePage userRole="admin" />} />
              {/* AI Center Routes */}
              <Route path="ai" element={<AICenterDashboard />} />
              <Route path="ai/tutor" element={<AITutorChat />} />
              <Route path="ai/recitation" element={<AIRecitationCoach />} />
              <Route path="ai/hifz" element={<AIHifzTracker />} />
              <Route path="ai/quiz" element={<AIQuizGenerator />} />
              <Route path="ai/quran-explainer" element={<AIQuranExplainer />} />
              <Route path="ai/learning-path" element={<AILearningPath />} />
              <Route path="ai/parent-reports" element={<AIParentReport />} />
              <Route path="ai/recommendations" element={<AIRecommendations />} />
              <Route path="ai/teacher-tools" element={<AITeacherTools />} />
            </Route>
            
            {/* Also support /admin-dashboard for backward compatibility */}
            <Route path="/admin-dashboard" element={<Navigate to="/admin" replace />} />
            
            {/* Teacher Dashboard with Layout */}
            <Route path="/teacher" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherLayout /></ProtectedRoute>}>
              <Route index element={<TeacherDashboard />} />
              <Route path="courses/:courseId" element={<AutomatedCoursePlayer />} />
              <Route path="noorani-qaida-player" element={<TeacherNooraniQaidaPage />} />
              <Route path="quran-translation-player" element={<TeacherQuranTranslationPage />} />
              <Route path="islamic-studies-player" element={<TeacherIslamicStudiesPage />} />
              <Route path="students" element={<MyStudents />} />
              <Route path="attendance" element={<TeacherAttendance />} />
              <Route path="lessons" element={<Lessons />} />
              <Route path="announcements" element={<TeacherAnnouncements />} />
              {/* Hifz System */}
              <Route path="hifz" element={<HifzCoursePage userRole="teacher" />} />
              <Route path="hifz/:courseId" element={<HifzCoursePage userRole="teacher" />} />
            </Route>
            
            {/* Student Dashboard with Layout */}
            <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><StudentLayout /></ProtectedRoute>}>
              <Route index element={<StudentDashboard />} />
              <Route path="courses/:courseId" element={<AutomatedCoursePlayer />} />
              <Route path="progress" element={<StudentProgress />} />
              <Route path="attendance" element={<StudentAttendance />} />
              <Route path="fees" element={<StudentFees />} />
              <Route path="announcements" element={<StudentAnnouncements />} />
              <Route path="profile" element={<StudentProfile />} />
              <Route path="noorani-qaida-player" element={<StudentNooraniQaidaPage />} />
              <Route path="quran-translation-player" element={<StudentQuranTranslationPage />} />
              <Route path="islamic-studies-player" element={<StudentIslamicStudiesPage />} />
              {/* Hifz System */}
              <Route path="hifz" element={<HifzCoursePage userRole="student" />} />
              <Route path="hifz/:courseId" element={<HifzCoursePage userRole="student" />} />
            </Route>
            
            <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </React.Suspense>
          </ErrorBoundary>
          </SettingsProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;

