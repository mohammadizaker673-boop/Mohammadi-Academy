// ============================================
// HIFZ QUR'AN COMPREHENSIVE TYPE DEFINITIONS
// ============================================

export type HifzStage = 'foundation' | 'structured' | 'mid-level' | 'completion';
export type HifzPath = 'backward' | 'forward'; // Backward: Juz 30→1, Forward: Juz 1→30
export type MemorizationType = 'new' | 'revision' | 'weak-page' | 'test';
export type PageDifficulty = 'easy' | 'medium' | 'hard' | 'very-hard';
export type RetentionLevel = 'excellent' | 'good' | 'fair' | 'weak' | 'forgotten';
export type TestType = 'random-ayah' | 'continue-middle' | 'timed' | 'full-page' | 'juz' | 'live';
export type BadgeType = 'first-5-juz' | 'first-10-juz' | 'first-15-juz' | 'tajweed-master' | 'consistency' | 'ramadan-challenger';
export type UserRole = 'student' | 'teacher' | 'admin' | 'parent';

// ============================================
// CORE MODELS
// ============================================

export interface HifzUser {
  id: string;
  userId: string;
  role: UserRole;
  enrolledCourses: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  parentEmail?: string;
  enrollmentDate: Date;
  
  // Memorization Progress
  currentJuz: number; // 1-30
  currentPage: number; // 1-604
  totalPagesMemoized: number;
  hifzStage: HifzStage;
  hifzPath: HifzPath;
  
  // Retention Metrics
  retentionScore: number; // 0-100
  streakDays: number;
  lastActiveDate: Date;
  
  // Teacher Assignment
  assignedTeacher?: string; // Teacher ID
  
  // Settings
  preferredReciter: string; // e.g., "mishary-rashid-alafasy"
  dailyNewPageTarget: number; // Default: 0.5-2 pages
  
  // Metadata
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeacherProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  qualifications: string; // e.g., "Hafiz with Ijazah"
  experience: number; // Years
  assignedStudents: string[]; // Student IDs
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// MEMORIZATION RECORDS
// ============================================

export interface MemorizationRecord {
  id: string;
  studentId: string;
  juzNumber: number; // 1-30
  pageNumber: number; // 1-604
  surahName: string;
  ayahStart: number;
  ayahEnd: number;
  
  type: MemorizationType;
  status: 'pending' | 'in-progress' | 'completed' | 'needs-review';
  
  dateMemorized: Date;
  duration: number; // In minutes
  
  // Audio recording
  recordingUrl?: string;
  recordingDuration?: number;
  
  // Teacher feedback
  teacherFeedback?: string;
  teacherScore?: number; // 1-10
  teacherNotations?: string[];
  
  mistakes: Mistake[];
  retryCount: number;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface Mistake {
  id: string;
  ayahNumber: number;
  type: 'pronunciation' | 'skip' | 'wrong-word' | 'hesitation';
  description: string;
  frequency: number; // How many times this mistake appears
  correctionAttempts: number;
}

// ============================================
// REVISION SYSTEM
// ============================================

export interface RevisionLog {
  id: string;
  studentId: string;
  pageNumber: number;
  layer: 1 | 2 | 3; // 1: Same-day, 2: Weekly, 3: Spaced Rotation
  
  scheduledDate: Date;
  completedDate?: Date;
  status: 'scheduled' | 'completed' | 'skipped' | 'overdue';
  
  recordingUrl?: string;
  performance: RetentionLevel;
  mistakesFound: number;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface RevisionSchedule {
  id: string;
  studentId: string;
  
  // Layer 1: Same-Day
  layer1Pages: number[]; // Yesterday's memorization
  layer1DueDate: Date;
  
  // Layer 2: 7-Day Cycle
  layer2Rotation: {
    day: number; // 1-7
    pages: number[];
    dueDate: Date;
  }[];
  
  // Layer 3: Spaced Rotation
  layer3Rotation: {
    pages: number[];
    lastReviewedDate: Date;
    daysUntilNextReview: number;
    priority: number; // Higher = weaker pages
  }[];
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// WEAK PAGE DETECTION
// ============================================

export interface WeakPage {
  id: string;
  studentId: string;
  pageNumber: number;
  juzNumber: number;
  
  failureCount: number;
  lastFailureDate: Date;
  
  commonMistakes: Mistake[];
  difficulty: PageDifficulty;
  
  mandatoryExtraRevisions: number;
  isActive: boolean; // Whether currently flagged as weak
  
  interventionStartDate?: Date;
  interventionEndDate?: Date;
  interventionNotes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface WeakPageAlert {
  id: string;
  studentId: string;
  teacherId?: string;
  pageNumber: number;
  severity: 'low' | 'medium' | 'high';
  reason: string;
  actionRequired: string;
  createdAt: Date;
  acknowledged: boolean;
}

// ============================================
// TESTING SYSTEM
// ============================================

export interface TestSession {
  id: string;
  studentId: string;
  teacherId?: string; // undefined for self-test
  
  type: TestType;
  testMode: 'auto' | 'live'; // auto = self-test, live = teacher-led
  
  juzNumber?: number; // For Juz tests
  pageNumber?: number; // For page tests
  ayahStart?: number;
  ayahEnd?: number;
  
  startTime: Date;
  endTime?: Date;
  duration?: number; // In minutes
  
  totalAyahs: number;
  correctAyahs: number;
  missedAyahs: number;
  haltingPoints: number;
  
  score: number; // 0-100
  resultStatus: 'passed' | 'needs-improvement' | 'failed';
  
  recordingUrl?: string;
  teacherNotes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface TestResult {
  id: string;
  testSessionId: string;
  studentId: string;
  
  scorePercentage: number;
  accuracy: number; // 0-100
  fluidency: number; // 0-100
  tajweed: number; // 0-100
  
  strengths: string[];
  areasForImprovement: string[];
  
  createdAt: Date;
}

// ============================================
// PROGRESS TRACKING
// ============================================

export interface ProgressSnapshot {
  id: string;
  studentId: string;
  
  dateSnapshot: Date;
  
  currentJuz: number;
  currentPage: number;
  totalPagesMemoized: number;
  
  juzCompletionPercentage: number;
  overallProgress: number; // 0-100
  
  retentionScore: number; // 0-100
  streakDays: number;
  
  weakPages: number[];
  strongPages: number[];
  
  lastReviewDates: { [pageNumber: number]: Date };
  mistakeFrequency: { [pageNumber: number]: number };
  
  createdAt: Date;
}

export interface MilestoneAchieved {
  id: string;
  studentId: string;
  
  milestone: 'first-juz' | '5-juz' | '10-juz' | '15-juz' | '20-juz' | '25-juz' | 'all-30-juz';
  juzNumber?: number;
  
  achievements: string[];
  certificateGenerated: boolean;
  certificateUrl?: string;
  
  achievedDate: Date;
  celebrationMessage: string;
  
  createdAt: Date;
}

// ============================================
// GAMIFICATION
// ============================================

export interface Badge {
  id: string;
  studentId: string;
  
  badgeType: BadgeType;
  name: string;
  description: string;
  icon: string;
  
  earnedDate: Date;
  isDisplayed: boolean;
  
  createdAt: Date;
}

export interface StreakRecord {
  id: string;
  studentId: string;
  
  currentStreak: number; // Days
  bestStreak: number; // Longest streak ever
  
  lastActivityDate: Date;
  streakStartDate: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface Leaderboard {
  id: string;
  studentId: string;
  
  rank: number;
  studentName: string;
  
  totalPagesMemoized: number;
  retentionScore: number;
  currentStreak: number;
  
  combinedScore: number; // Calculated from above
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// TEACHER FEEDBACK & COMMENTS
// ============================================

export interface TeacherFeedback {
  id: string;
  studentId: string;
  teacherId: string;
  
  pageNumber: number;
  feedbackType: 'positive' | 'correction' | 'encouragement' | 'warning';
  
  content: string;
  recordingUrl?: string; // Teacher's voice feedback
  
  actionItems?: string[];
  nextLessonRecommendation?: string;
  
  createdAt: Date;
  readByStudent: boolean;
  readDate?: Date;
}

export interface StudentReport {
  id: string;
  studentId: string;
  reportPeriod: 'weekly' | 'monthly';
  
  generatedDate: Date;
  reportStartDate: Date;
  reportEndDate: Date;
  
  newPagesMemoized: number;
  totalPagesMemoized: number;
  
  retentionScore: number;
  streakDays: number;
  testsPassed: number;
  
  weakPages: number[];
  strength: string;
  areaForImprovement: string;
  
  teacherComments: string;
  
  createdAt: Date;
}

// ============================================
// ATTENDANCE & ENGAGEMENT
// ============================================

export interface AttendanceRecord {
  id: string;
  studentId: string;
  teacherId?: string;
  
  sessionDate: Date;
  sessionType: 'new-memorization' | 'revision' | 'test' | 'group-class';
  
  status: 'present' | 'absent' | 'excused' | 'late';
  
  duration: number; // In minutes
  topicCovered: string;
  
  createdAt: Date;
}

export interface StudentEngagement {
  id: string;
  studentId: string;
  
  totalSessions: number;
  averageSessionDuration: number;
  attendanceRate: number; // 0-100
  
  commitmentLevel: 'high' | 'moderate' | 'low';
  riskeOfDropout: boolean;
  
  lastEngagementDate: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// QUR'AN METADATA
// ============================================

export interface QuranicPage {
  id: string;
  pageNumber: number; // 1-604
  juzNumber: number; // 1-30
  juzPart?: number; // For pages spanning multiple Juz
  
  surahName: string;
  surahNumber: number;
  
  ayahStart: number;
  ayahEnd: number;
  
  difficulty: PageDifficulty; // Based on length and content complexity
  estimatedMemorizationTime: number; // In minutes
  
  transcript: string; // Quranic text
  transliteration: string;
  translation: string;
  
  createdAt: Date;
}

export interface JuzMetadata {
  juzNumber: number; // 1-30
  totalPages: number;
  totalAyahs: number;
  
  startSurah: string;
  endSurah: string;
  
  estimatedCompletionTime: number; // Days for Light/Standard/Intensive tracks
  
  createdAt: Date;
}

// ============================================
// ADMIN ANALYTICS
// ============================================

export interface AcademyAnalytics {
  id: string;
  
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  completedHifz: number;
  
  averagePagesMemoized: number;
  averageRetentionScore: number;
  averageStreakDays: number;
  
  dropoutRate: number;
  completionRate: number;
  
  weakPagePatterns: { pageNumber: number; frequency: number }[];
  commonMistakePatterns: { type: string; frequency: number }[];
  
  teacherPerformanceOverview: TeacherPerformanceMetric[];
  
  generatedDate: Date;
}

export interface TeacherPerformanceMetric {
  teacherId: string;
  teacherName: string;
  
  studentCount: number;
  averageStudentRetentionScore: number;
  studentCompletionRate: number;
  feedbackQuality: number; // 1-10
  
  studentsImproving: number;
  studentsAtRisk: number;
  
  createdAt: Date;
}

// ============================================
// SYSTEM CONFIGURATION
// ============================================

export interface HifzSystemConfig {
  id: string;
  
  // Revision Configuration
  layer1RevisionHours: number; // Hours after memorization for Layer 1
  layer2RevisionDays: number; // 7 days default
  layer3SpacedIntervals: number[]; // [1, 3, 7, 14, 30] days
  
  // Weak Page Thresholds
  failureThresholdForWeakFlag: number; // 3 failures = weak
  mistakeFrequencyThreshold: number; // 5+ mistakes = weak
  testScoreThreshold: number; // Below 70% = weak
  
  // Gamification
  streakResetAfterDays: number; // 2 days without activity = reset
  badgeAchievementRequirements: { [key: string]: number };
  
  // Memorization Targets
  defaultDailyNewPageTarget: number; // 0.5-2 pages
  maximumNewPagesPerDay: number; // Safety limit
  
  // System Features
  enableAITajweedCorrection: boolean;
  enableParentAccess: boolean;
  enableGroupCompetition: boolean;
  
  updatedDate: Date;
}

// ============================================
// STATISTICAL MODELS
// ============================================

export interface StudentStatistics {
  studentId: string;
  
  totalMemorizations: number;
  totalRevisions: number;
  totalTests: number;
  
  averageMemorizationTime: number;
  averageRevisionTime: number;
  
  bestTestScore: number;
  averageTestScore: number;
  
  consistencyScore: number; // Based on streak and adherence
  progressTrend: 'increasing' | 'stable' | 'decreasing';
  
  estimatedCompletionDate: Date;
  
  createdAt: Date;
  updatedAt: Date;
}
