/**
 * System Settings Types
 * Comprehensive configuration schema for the entire platform
 */

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  linkedin?: string;
  whatsapp?: string;
}

export interface PaymentConfig {
  currency: string;
  currencySymbol: string;
  symbolPosition: 'before' | 'after';
  enablePayments: boolean;
  paymentGateway: 'stripe' | 'paypal' | 'none';
  stripePublicKey?: string;
  stripeSecretKey?: string;
  paypalClientId?: string;
  paypalSecret?: string;
  enableInstallments: boolean;
  installmentPlans: string[];
  taxRate: number;
  enrollmentServiceFee: number;
  enableRefunds: boolean;
  refundWindowDays: number;
  refundPolicyText: string;
}

export interface CourseDefaults {
  defaultDurationDays: number;
  defaultAccessDurationDays: number;
  defaultLevel: 'beginner' | 'intermediate' | 'advanced';
  defaultPrice: number;
  enableFreeCourses: boolean;
  completionThresholdPercent: number;
  passingGradePercent: number;
  defaultLessonDurationMinutes: number;
  maxStudentsPerClass: number;
  enableCertificates: boolean;
  autoIssueCertificate: boolean;
  certificateTemplate: string;
  requireSequentialLessons: boolean;
  allowLessonRetakes: boolean;
  quizAttemptsAllowed: number | 'unlimited';
  showCorrectAnswersImmediately: boolean;
  showScoreToStudent: boolean;
  submissionDeadlineDays: number;
  gracePeriodDays: number;
  lateSubmissionPenaltyPercent: number;
}

export interface EmailConfig {
  smtpServer: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  senderEmail: string;
  senderName: string;
  enableWelcomeEmail: boolean;
  enablePasswordResetEmail: boolean;
  enableCourseReminderEmail: boolean;
  emailFrequency: 'daily' | 'weekly' | 'monthly';
  enableAssignmentSubmissionEmail: boolean;
  enableGradeNotificationEmail: boolean;
}

export interface NotificationConfig {
  enableInAppNotifications: boolean;
  enableBrowserNotifications: boolean;
  enableSmsNotifications: boolean;
  smsProvider?: 'twilio' | 'vonage';
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioPhoneNumber?: string;
  notifyNewAssignments: boolean;
  notifyGradePosted: boolean;
  notifyCourseReminder: boolean;
  enableNotificationSound: boolean;
  notificationSoundVolume: number;
  quietHoursStart: string;
  quietHoursEnd: string;
  allowUserDisableNotifications: boolean;
}

export interface AnnouncementConfig {
  enableAnnouncements: boolean;
  displayLocation: 'homepage' | 'academy-home' | 'both';
  autoArchiveAfterDays: number;
  requireApprovalBeforePublishing: boolean;
  showAnnouncementAuthor: boolean;
  allowPinImportantAnnouncements: boolean;
}

export interface ContentConfig {
  enableVideoLessons: boolean;
  maxVideoUploadSizeMB: number;
  videoQualityOptions: ('240p' | '360p' | '720p' | '1080p')[];
  autoPlayVideos: boolean;
  enableSubtitles: boolean;
  enableLessonDownloads: boolean;
  maxFileUploadSizeMB: number;
  allowedFileTypes: string[];
  enableRichTextEditor: boolean;
  allowCodeSnippets: boolean;
  enableExternalLinks: boolean;
}

export interface AssessmentConfig {
  enableQuizzes: boolean;
  enableAssignments: boolean;
  enableFinalExams: boolean;
  questionTypes: string[];
  showQuizTimer: boolean;
  shuffleQuestions: boolean;
  shuffleAnswerOptions: boolean;
  questionBankSize: number;
  allowTeachersCreateCustomQuestions: boolean;
  enablePeerReview: boolean;
  enablePlagiarismChecker: boolean;
}

export interface ProgressTrackingConfig {
  trackStudentAttendance: boolean;
  trackLessonCompletion: boolean;
  trackTimeSpentOnLesson: boolean;
  trackAssignmentSubmissionTime: boolean;
  generateProgressReports: boolean;
  reportFrequency: 'weekly' | 'monthly' | 'on-demand';
  exportReportFormats: ('pdf' | 'excel' | 'csv')[];
  showProgressToStudents: boolean;
}

export interface GamificationConfig {
  enablePointsSystem: boolean;
  pointsPerLessonCompletion: number;
  pointsPerQuizCompletion: number;
  pointsPerPerfectScore: number;
  enableBadges: boolean;
  badgeTypes: string[];
  enableLeaderboards: boolean;
  leaderboardType: 'global' | 'class' | 'monthly';
  showLeaderboardToStudents: boolean;
  enableAchievements: boolean;
  enableStreaks: boolean;
  enableLevels: boolean;
  rewardSystem: 'badges' | 'points' | 'certificates' | 'combined';
}

export interface AttendanceConfig {
  workingDays: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
  classScheduleFormat: 'time-slots' | 'periods';
  classTimeSlots: string[];
  breakTimes: string[];
  enableRecurringClasses: boolean;
  autoCreateAttendanceRecords: boolean;
  markLateAfterMinutes: number;
  attendanceRequirementPercent: number;
  autoMarkAttendance: boolean;
  requireManualAttendance: boolean;
  attendanceMarkDeadlineMinutes: number;
  allowAttendanceCorrection: boolean;
  attendanceCorrectionRequiresApproval: boolean;
  sendAttendanceReminderToTeacher: boolean;
  sendAttendanceReportToParent: boolean;
  showAttendanceToStudent: boolean;
}

export interface SecurityConfig {
  enableTwoFactorAuth: boolean;
  requireLoginTimeoutMinutes: number;
  sessionTimeoutMinutes: number;
  maxLoginAttempts: number;
  lockoutDurationMinutes: number;
  enableIpWhitelist: boolean;
  ipAddressesWhitelist: string[];
  enableHttps: boolean;
  enableSslCertificate: boolean;
  dataBackupFrequency: 'daily' | 'weekly' | 'monthly';
  backupRetentionDays: number;
  enableGdprCompliance: boolean;
}

export interface PerformanceConfig {
  cacheDurationHours: number;
  imageCompressionQuality: number;
  videoStreamingQualityDefault: '240p' | '360p' | '720p' | '1080p';
  maxConcurrentUsers: number;
  apiRateLimit: number;
  databaseOptimizationFrequency: 'daily' | 'weekly' | 'monthly';
  enableCdn: boolean;
  cdnProvider?: 'cloudflare' | 'bunnycdn' | 'aws-cloudfront';
  maxDatabaseConnections: number;
  resourceCleanupFrequency: 'daily' | 'weekly' | 'monthly';
}

export interface IntegrationConfig {
  enableGoogleAnalytics: boolean;
  googleAnalyticsId?: string;
  enableFacebookPixel: boolean;
  facebookPixelId?: string;
  enableZoomIntegration: boolean;
  zoomApiKey?: string;
  zoomApiSecret?: string;
  enableCalendarSync: boolean;
  calendarProvider?: 'google' | 'outlook';
  enableLmsIntegration: boolean;
  thirdPartyApiEndpoints: Record<string, string>;
  webhookUrls: Record<string, string>;
}

export interface LocalizationConfig {
  defaultLanguage: string;
  availableLanguages: string[];
  dateFormat: string;
  timeFormat: '12h' | '24h';
  currencyFormat: string;
  numberFormat: string;
  textDirection: 'ltr' | 'rtl';
  textAlignmentAutoAdjust: boolean;
  translationService: 'manual' | 'ai-powered';
  calendarSystem: 'gregorian' | 'hijri' | 'both';
}

export interface FeatureFlags {
  enableLiveClasses: boolean;
  enableRecordedClasses: boolean;
  enableChatMessaging: boolean;
  enableDiscussionForum: boolean;
  enableNotifications: boolean;
  enableMobileApp: boolean;
  enableStudentPortal: boolean;
  enableTeacherPortal: boolean;
  enableParentPortal: boolean;
  enableAdminDashboard: boolean;
  enableAnalyticsDashboard: boolean;
  enableCertificateSystem: boolean;
  enableMarketplace: boolean;
  enableFileStorage: boolean;
  enableApiAccess: boolean;
}

export interface DepartmentConfig {
  id: string;
  name: string;
  nameArabic?: string;
  description?: string;
  headEmail?: string;
  isActive: boolean;
}

export interface AcademicConfig {
  academicYearFormat: string;
  currentAcademicYear: string;
  semesterNames: string[];
  semesterStartDate: Date;
  semesterEndDate: Date;
  holidays: { name: string; startDate: Date; endDate: Date }[];
  schoolHoursStart: string;
  schoolHoursEnd: string;
  timezone: string;
  enableDepartments: boolean;
  departments?: DepartmentConfig[];
  courseCategories: string[];
  ageGroups: string[];
  courseLanguages: string[];
}

export interface UserRegistrationConfig {
  allowPublicRegistration: boolean;
  adminApprovalRequired: boolean;
  emailVerificationRequired: boolean;
  phoneVerificationRequired: boolean;
  allowProfilePictureUpload: boolean;
  allowCvResumeUpload: boolean;
  allowLinkedInLink: boolean;
  allowUserDeleteAccount: boolean;
  accountInactivityTimeoutDays: number;
  defaultRoleForNewUsers: 'student' | 'guest';
  minimumPasswordLength: number;
  requireSpecialCharactersInPassword: boolean;
  passwordExpiryPeriodDays: number;
}

export interface UserPermissionsConfig {
  teachersCanCreateCourses: boolean;
  studentsCanDownloadContent: boolean;
  studentsCanComment: boolean;
  studentsCanLeaveReviews: boolean;
  parentsCanViewChildProgress: boolean;
  allowMultipleChildProfiles: boolean;
}

export interface DashboardConfig {
  adminDashboardWidgets: string[];
  teacherDashboardWidgets: string[];
  studentDashboardWidgets: string[];
  defaultDashboardView: string;
  metricsToDisplay: string[];
  reportTypesAvailable: ('pdf' | 'excel' | 'charts')[];
  enableAutomatedReports: boolean;
  reportRecipientEmails: string[];
  reportFrequency: 'daily' | 'weekly' | 'monthly';
}

export interface SystemSettings {
  // Branding & Identity
  organizationName: string;
  organizationLogo: string;
  organizationLogoDarkUrl?: string;
  faviconUrl?: string;
  organizationTagline: string;
  organizationDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  websiteUrl: string;
  socialLinks: SocialLinks;

  // Theme & Appearance
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColorLight: string;
  textColorDark: string;
  successColor: string;
  errorColor: string;
  warningColor: string;
  infoColor: string;
  fontFamily: string;
  defaultTheme: 'light' | 'dark' | 'system';
  allowUserThemeToggle: boolean;
  headerBackgroundColor: string;
  footerBackgroundColor: string;
  sidebarBackgroundColor: string;
  cardBackgroundColorLight: string;
  cardBackgroundColorDark: string;
  borderColor: string;
  hoverEffects: 'subtle' | 'medium' | 'bold';
  animationSpeed: 'disabled' | 'slow' | 'normal' | 'fast';
  roundedCornerRadius: number;
  buttonStyle: 'filled' | 'outlined' | 'ghost';
  buttonRadius: 'sharp' | 'rounded' | 'pill';
  cardShadowStyle: 'none' | 'subtle' | 'medium' | 'bold';
  inputFieldStyle: 'outlined' | 'filled' | 'underline';
  notificationPosition: 'top' | 'bottom' | 'top-right' | 'bottom-right';

  // Configuration
  academic: AcademicConfig;
  courseDefaults: CourseDefaults;
  payment: PaymentConfig;
  email: EmailConfig;
  notification: NotificationConfig;
  announcement: AnnouncementConfig;
  content: ContentConfig;
  assessment: AssessmentConfig;
  progressTracking: ProgressTrackingConfig;
  gamification: GamificationConfig;
  attendance: AttendanceConfig;
  security: SecurityConfig;
  performance: PerformanceConfig;
  integration: IntegrationConfig;
  localization: LocalizationConfig;
  userRegistration: UserRegistrationConfig;
  userPermissions: UserPermissionsConfig;
  dashboard: DashboardConfig;

  // Feature Toggles
  features: FeatureFlags;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  updatedBy: string;
  updatedByUserEmail: string;
}

export interface SettingsUpdateLog {
  id: string;
  settingKey: string;
  oldValue: any;
  newValue: any;
  updatedBy: string;
  updatedByEmail: string;
  updatedAt: Date;
  reason?: string;
}

// Default settings template
export const DEFAULT_SETTINGS: SystemSettings = {
  organizationName: 'Mohammadi Academy',
  organizationLogo: '',
  organizationLogoDarkUrl: '',
  faviconUrl: '',
  organizationTagline: 'Excellence in Islamic Education',
  organizationDescription: 'Online Academy for Islamic Learning',
  contactEmail: 'info@mohammadi.academy',
  contactPhone: '+93-',
  address: '',
  websiteUrl: 'https://mohammadi.academy',
  socialLinks: {
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: '',
    linkedin: '',
    whatsapp: ''
  },

  primaryColor: '#3b82f6',
  secondaryColor: '#10b981',
  accentColor: '#f59e0b',
  textColorLight: '#ffffff',
  textColorDark: '#1f2937',
  successColor: '#10b981',
  errorColor: '#ef4444',
  warningColor: '#f59e0b',
  infoColor: '#3b82f6',
  fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
  defaultTheme: 'system',
  allowUserThemeToggle: true,
  headerBackgroundColor: '#1e293b',
  footerBackgroundColor: '#0f172a',
  sidebarBackgroundColor: '#1e293b',
  cardBackgroundColorLight: '#f8fafc',
  cardBackgroundColorDark: '#1e293b',
  borderColor: '#e2e8f0',
  hoverEffects: 'medium',
  animationSpeed: 'normal',
  roundedCornerRadius: 0.5,
  buttonStyle: 'filled',
  buttonRadius: 'rounded',
  cardShadowStyle: 'medium',
  inputFieldStyle: 'outlined',
  notificationPosition: 'bottom-right',

  academic: {
    academicYearFormat: 'YYYY-YYYY+1',
    currentAcademicYear: '2025-2026',
    semesterNames: ['Spring 2025', 'Summer 2025', 'Fall 2025', 'Winter 2025'],
    semesterStartDate: new Date('2025-03-01'),
    semesterEndDate: new Date('2025-06-30'),
    holidays: [],
    schoolHoursStart: '09:00',
    schoolHoursEnd: '17:00',
    timezone: 'Asia/Kabul',
    enableDepartments: true,
    courseCategories: ['quran', 'islamic-studies', 'general-knowledge', 'life-skills', 'digital-skills'],
    ageGroups: ['children', 'preteens', 'youth', 'adults'],
    courseLanguages: ['dari', 'pashto', 'english', 'arabic']
  },

  courseDefaults: {
    defaultDurationDays: 90,
    defaultAccessDurationDays: 180,
    defaultLevel: 'beginner',
    defaultPrice: 0,
    enableFreeCourses: true,
    completionThresholdPercent: 75,
    passingGradePercent: 60,
    defaultLessonDurationMinutes: 45,
    maxStudentsPerClass: 50,
    enableCertificates: true,
    autoIssueCertificate: true,
    certificateTemplate: 'default',
    requireSequentialLessons: false,
    allowLessonRetakes: true,
    quizAttemptsAllowed: 3,
    showCorrectAnswersImmediately: false,
    showScoreToStudent: true,
    submissionDeadlineDays: 7,
    gracePeriodDays: 2,
    lateSubmissionPenaltyPercent: 10
  },

  payment: {
    currency: 'USD',
    currencySymbol: '$',
    symbolPosition: 'before',
    enablePayments: false,
    paymentGateway: 'none',
    enableInstallments: false,
    installmentPlans: ['3 months', '6 months'],
    taxRate: 0,
    enrollmentServiceFee: 0,
    enableRefunds: true,
    refundWindowDays: 30,
    refundPolicyText: ''
  },

  email: {
    smtpServer: '',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    senderEmail: '',
    senderName: 'Mohammadi Academy',
    enableWelcomeEmail: true,
    enablePasswordResetEmail: true,
    enableCourseReminderEmail: true,
    emailFrequency: 'weekly',
    enableAssignmentSubmissionEmail: true,
    enableGradeNotificationEmail: true
  },

  notification: {
    enableInAppNotifications: true,
    enableBrowserNotifications: false,
    enableSmsNotifications: false,
    notifyNewAssignments: true,
    notifyGradePosted: true,
    notifyCourseReminder: true,
    enableNotificationSound: true,
    notificationSoundVolume: 100,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    allowUserDisableNotifications: true
  },

  announcement: {
    enableAnnouncements: true,
    displayLocation: 'both',
    autoArchiveAfterDays: 30,
    requireApprovalBeforePublishing: false,
    showAnnouncementAuthor: true,
    allowPinImportantAnnouncements: true
  },

  content: {
    enableVideoLessons: true,
    maxVideoUploadSizeMB: 500,
    videoQualityOptions: ['360p', '720p', '1080p'],
    autoPlayVideos: false,
    enableSubtitles: true,
    enableLessonDownloads: true,
    maxFileUploadSizeMB: 100,
    allowedFileTypes: ['.pdf', '.doc', '.docx', '.pptx', '.jpg', '.png', '.mp3', '.mp4'],
    enableRichTextEditor: true,
    allowCodeSnippets: false,
    enableExternalLinks: true
  },

  assessment: {
    enableQuizzes: true,
    enableAssignments: true,
    enableFinalExams: true,
    questionTypes: ['multiple-choice', 'essay', 'true-false', 'matching', 'short-answer'],
    showQuizTimer: true,
    shuffleQuestions: true,
    shuffleAnswerOptions: true,
    questionBankSize: 100,
    allowTeachersCreateCustomQuestions: true,
    enablePeerReview: false,
    enablePlagiarismChecker: false
  },

  progressTracking: {
    trackStudentAttendance: true,
    trackLessonCompletion: true,
    trackTimeSpentOnLesson: true,
    trackAssignmentSubmissionTime: true,
    generateProgressReports: true,
    reportFrequency: 'monthly',
    exportReportFormats: ['pdf', 'excel'],
    showProgressToStudents: true
  },

  gamification: {
    enablePointsSystem: true,
    pointsPerLessonCompletion: 10,
    pointsPerQuizCompletion: 20,
    pointsPerPerfectScore: 50,
    enableBadges: true,
    badgeTypes: ['participation', 'excellence', 'consistency', 'improvement'],
    enableLeaderboards: true,
    leaderboardType: 'class',
    showLeaderboardToStudents: true,
    enableAchievements: true,
    enableStreaks: true,
    enableLevels: true,
    rewardSystem: 'combined'
  },

  attendance: {
    workingDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
    classScheduleFormat: 'time-slots',
    classTimeSlots: ['09:00-10:00', '10:00-11:00', '11:00-12:00'],
    breakTimes: ['12:00-13:00'],
    enableRecurringClasses: true,
    autoCreateAttendanceRecords: true,
    markLateAfterMinutes: 15,
    attendanceRequirementPercent: 75,
    autoMarkAttendance: false,
    requireManualAttendance: true,
    attendanceMarkDeadlineMinutes: 30,
    allowAttendanceCorrection: true,
    attendanceCorrectionRequiresApproval: true,
    sendAttendanceReminderToTeacher: true,
    sendAttendanceReportToParent: false,
    showAttendanceToStudent: true
  },

  security: {
    enableTwoFactorAuth: false,
    requireLoginTimeoutMinutes: 30,
    sessionTimeoutMinutes: 60,
    maxLoginAttempts: 5,
    lockoutDurationMinutes: 15,
    enableIpWhitelist: false,
    ipAddressesWhitelist: [],
    enableHttps: true,
    enableSslCertificate: true,
    dataBackupFrequency: 'daily',
    backupRetentionDays: 30,
    enableGdprCompliance: true
  },

  performance: {
    cacheDurationHours: 24,
    imageCompressionQuality: 80,
    videoStreamingQualityDefault: '720p',
    maxConcurrentUsers: 1000,
    apiRateLimit: 100,
    databaseOptimizationFrequency: 'weekly',
    enableCdn: false,
    maxDatabaseConnections: 100,
    resourceCleanupFrequency: 'weekly'
  },

  integration: {
    enableGoogleAnalytics: false,
    enableFacebookPixel: false,
    enableZoomIntegration: false,
    enableCalendarSync: false,
    enableLmsIntegration: false,
    thirdPartyApiEndpoints: {},
    webhookUrls: {}
  },

  localization: {
    defaultLanguage: 'dari',
    availableLanguages: ['dari', 'pashto', 'english', 'arabic'],
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    currencyFormat: '###,##0.00',
    numberFormat: ',.2',
    textDirection: 'rtl',
    textAlignmentAutoAdjust: true,
    translationService: 'manual',
    calendarSystem: 'gregorian'
  },

  userRegistration: {
    allowPublicRegistration: true,
    adminApprovalRequired: false,
    emailVerificationRequired: true,
    phoneVerificationRequired: false,
    allowProfilePictureUpload: true,
    allowCvResumeUpload: false,
    allowLinkedInLink: true,
    allowUserDeleteAccount: true,
    accountInactivityTimeoutDays: 90,
    defaultRoleForNewUsers: 'student',
    minimumPasswordLength: 8,
    requireSpecialCharactersInPassword: true,
    passwordExpiryPeriodDays: 0
  },

  userPermissions: {
    teachersCanCreateCourses: true,
    studentsCanDownloadContent: true,
    studentsCanComment: true,
    studentsCanLeaveReviews: true,
    parentsCanViewChildProgress: true,
    allowMultipleChildProfiles: true
  },

  dashboard: {
    adminDashboardWidgets: ['revenue', 'students', 'courses', 'engagement', 'recent-enrollments'],
    teacherDashboardWidgets: ['my-courses', 'recent-assignments', 'student-progress', 'messages'],
    studentDashboardWidgets: ['my-courses', 'progress', 'upcoming-assignments', 'leaderboard'],
    defaultDashboardView: 'overview',
    metricsToDisplay: ['student-count', 'revenue', 'engagement', 'completion-rate'],
    reportTypesAvailable: ['pdf', 'excel'],
    enableAutomatedReports: true,
    reportRecipientEmails: [],
    reportFrequency: 'monthly'
  },

  features: {
    enableLiveClasses: true,
    enableRecordedClasses: true,
    enableChatMessaging: true,
    enableDiscussionForum: true,
    enableNotifications: true,
    enableMobileApp: false,
    enableStudentPortal: true,
    enableTeacherPortal: true,
    enableParentPortal: false,
    enableAdminDashboard: true,
    enableAnalyticsDashboard: true,
    enableCertificateSystem: true,
    enableMarketplace: false,
    enableFileStorage: true,
    enableApiAccess: false
  },

  createdAt: new Date(),
  updatedAt: new Date(),
  updatedBy: 'system',
  updatedByUserEmail: 'system@mohammadi.academy'
};
