
export type Language = 'en' | 'ar' | 'fa' | 'ps';

export interface Course {
  id: string;
  icon: string;
  // Localized fields are now handled via a translation mapping
}

export interface PricingPlan {
  id: string;
  recommended?: boolean;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'image' | 'text';
  mediaUrl?: string;
  content?: string;
  publishDate: Date;
  createdAt: Date;
  updatedAt: Date;
}export interface AdmissionForm {
  studentName: string;
  age: string;
  parentName: string;
  phone: string;
  course: string;
  schedule: string;
  gender: 'male' | 'female' | '';
  preferredTeacherGender: 'male' | 'female' | 'no-preference' | '';
  studentAge: number | '';
  country: string;
  timezone: string;
  quranLevel: 'beginner' | 'can-read' | 'tajweed' | 'hifz' | '';
  availableDays: string[];
  preferredTime: string;
  parentEmail: string;
  consentGenderSeparated: boolean;
  consentParentObserve: boolean;
  consentRespectPolicy: boolean;
}

export interface TeacherApplication {
  fullName: string;
  gender: 'male' | 'female' | '';
  email: string;
  phone: string;
  country: string;
  tajweedDetails: string;
  experienceYears: number | '';
  languagesTaught: string[];
  teachingPreference: 'kids' | 'adults' | 'both' | '';
  availableDays: string[];
  availableTimes: string;
  consentQuranicManners: boolean;
  consentNoPrivateChat: boolean;
  consentAcademyPolicy: boolean;
}

// Quran Platform Types
export interface QuranSurah {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
}

export interface QuranAyah {
  number: number;
  text: string;
  numberInSurah: number;
  translation?: string;
  tafsir?: string;
  audio?: string;
}

export interface QuranTranslation {
  text: string;
  source: string;
  translator: string;
}

export interface QuranTafsir {
  text: string;
  source: string;
  scholar: string;
}

export interface ReciterInfo {
  id: string;
  name: string;
  riwayah: string;
}

export interface QuranPlayerState {
  isPlaying: boolean;
  currentAyah: number;
  currentSurah: number;
  volume: number;
  repeat: number;
  reciter: string;
}

export interface QuranState {
  currentSurah: number;
  currentAyah: number;
  selectedTranslations: string[];
  displayMode: 'reading' | 'word-by-word' | 'memorization';
  showTafsir: boolean;
  showTransliteration: boolean;
  audioPlayer: QuranPlayerState;
}

export interface BookmarkedAyah {
  surah: number;
  ayah: number;
  note?: string;
  timestamp: Date;
}

export interface ReadingHistoryEntry {
  surah: number;
  ayah: number;
  timestamp: Date;
}

export interface UserPreferences {
  bookmarks: BookmarkedAyah[];
  notes: Record<string, string>;
  readingHistory: ReadingHistoryEntry[];
  lastPosition: { surah: number; ayah: number };
  favoriteReciters: string[];
}

export interface WordAnalysis {
  arabic: string;
  transliteration: string;
  root: string;
  meaning: string;
  grammar: string;
}

export interface QuranTopic {
  id: string;
  name: string;
  description: string;
  ayahs: { surah: number; ayah: number }[];
}
