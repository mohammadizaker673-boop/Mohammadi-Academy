import { 
  db
} from './firebase';
import {
  collection,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  QueryConstraint
} from 'firebase/firestore';
import * as HifzTypes from '../types/hifz.types';

/**
 * HifzDataService - Handles all Firebase Firestore operations for the Hifz system
 * Provides CRUD operations and complex queries for memorization tracking
 */

class HifzDataService {
  private readonly COLLECTIONS = {
    STUDENTS: 'hifz_students',
    TEACHERS: 'hifz_teachers',
    MEMORIZATION: 'hifz_memorization_records',
    REVISIONS: 'hifz_revision_logs',
    WEAK_PAGES: 'hifz_weak_pages',
    TESTS: 'hifz_test_sessions',
    PROGRESS: 'hifz_progress_snapshots',
    BADGES: 'hifz_badges',
    LEADERBOARD: 'hifz_leaderboard',
  };

  // ==================== STUDENT OPERATIONS ====================

  async createStudentProfile(userId: string, profile: Omit<HifzTypes.StudentProfile, 'userId'>): Promise<void> {
    try {
      await setDoc(doc(db, this.COLLECTIONS.STUDENTS, userId), {
        userId,
        ...profile,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error creating student profile:', error);
      throw error;
    }
  }

  async getStudentProfile(userId: string): Promise<HifzTypes.StudentProfile | null> {
    try {
      const docSnap = await getDoc(doc(db, this.COLLECTIONS.STUDENTS, userId));
      return docSnap.exists() ? (docSnap.data() as HifzTypes.StudentProfile) : null;
    } catch (error) {
      console.error('Error fetching student profile:', error);
      throw error;
    }
  }

  async updateStudentProgress(userId: string, updates: Partial<HifzTypes.StudentProfile>): Promise<void> {
    try {
      await updateDoc(doc(db, this.COLLECTIONS.STUDENTS, userId), {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating student progress:', error);
      throw error;
    }
  }

  // ==================== MEMORIZATION OPERATIONS ====================

  async recordMemorization(record: Omit<HifzTypes.MemorizationRecord, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.COLLECTIONS.MEMORIZATION), {
        ...record,
        timestamp: new Date(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error recording memorization:', error);
      throw error;
    }
  }

  async getStudentMemorizations(userId: string, limit: number = 50): Promise<HifzTypes.MemorizationRecord[]> {
    try {
      const q = query(
        collection(db, this.COLLECTIONS.MEMORIZATION),
        where('studentId', '==', userId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as HifzTypes.MemorizationRecord)).slice(-limit);
    } catch (error) {
      console.error('Error fetching memorizations:', error);
      throw error;
    }
  }

  // ==================== REVISION OPERATIONS ====================

  async logRevision(log: Omit<HifzTypes.RevisionLog, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.COLLECTIONS.REVISIONS), {
        ...log,
        timestamp: new Date(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error logging revision:', error);
      throw error;
    }
  }

  async getRevisionSchedule(userId: string): Promise<HifzTypes.RevisionSchedule | null> {
    try {
      const q = query(
        collection(db, this.COLLECTIONS.REVISIONS),
        where('studentId', '==', userId)
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      
      const latestRevision = snapshot.docs[snapshot.docs.length - 1].data();
      return {
        studentId: userId,
        ...latestRevision,
      } as HifzTypes.RevisionSchedule;
    } catch (error) {
      console.error('Error fetching revision schedule:', error);
      throw error;
    }
  }

  // ==================== WEAK PAGE OPERATIONS ====================

  async createWeakPageRecord(record: Omit<HifzTypes.WeakPage, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.COLLECTIONS.WEAK_PAGES), {
        ...record,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating weak page record:', error);
      throw error;
    }
  }

  async getWeakPages(userId: string): Promise<HifzTypes.WeakPage[]> {
    try {
      const q = query(
        collection(db, this.COLLECTIONS.WEAK_PAGES),
        where('studentId', '==', userId),
        where('resolved', '==', false)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as HifzTypes.WeakPage));
    } catch (error) {
      console.error('Error fetching weak pages:', error);
      throw error;
    }
  }

  async resolveWeakPage(weakPageId: string): Promise<void> {
    try {
      await updateDoc(doc(db, this.COLLECTIONS.WEAK_PAGES, weakPageId), {
        resolved: true,
        resolvedAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error resolving weak page:', error);
      throw error;
    }
  }

  // ==================== TEST OPERATIONS ====================

  async createTestSession(session: Omit<HifzTypes.TestSession, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.COLLECTIONS.TESTS), {
        ...session,
        startedAt: new Date(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating test session:', error);
      throw error;
    }
  }

  async updateTestResult(testId: string, result: Partial<HifzTypes.TestResult>): Promise<void> {
    try {
      await updateDoc(doc(db, this.COLLECTIONS.TESTS, testId), {
        ...result,
        completedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating test result:', error);
      throw error;
    }
  }

  async getStudentTestResults(userId: string): Promise<HifzTypes.TestSession[]> {
    try {
      const q = query(
        collection(db, this.COLLECTIONS.TESTS),
        where('studentId', '==', userId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as HifzTypes.TestSession));
    } catch (error) {
      console.error('Error fetching test results:', error);
      throw error;
    }
  }

  // ==================== PROGRESS SNAPSHOT OPERATIONS ====================

  async createProgressSnapshot(snapshot: Omit<HifzTypes.ProgressSnapshot, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.COLLECTIONS.PROGRESS), {
        ...snapshot,
        timestamp: new Date(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating progress snapshot:', error);
      throw error;
    }
  }

  async getProgressSnapshots(userId: string, days: number = 30): Promise<HifzTypes.ProgressSnapshot[]> {
    try {
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const q = query(
        collection(db, this.COLLECTIONS.PROGRESS),
        where('studentId', '==', userId),
        where('timestamp', '>=', cutoffDate)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as HifzTypes.ProgressSnapshot));
    } catch (error) {
      console.error('Error fetching progress snapshots:', error);
      throw error;
    }
  }

  // ==================== BADGE OPERATIONS ====================

  async awardBadge(userId: string, badge: Omit<HifzTypes.Badge, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.COLLECTIONS.BADGES), {
        userId,
        ...badge,
        awardedAt: new Date(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error awarding badge:', error);
      throw error;
    }
  }

  async getUserBadges(userId: string): Promise<HifzTypes.Badge[]> {
    try {
      const q = query(
        collection(db, this.COLLECTIONS.BADGES),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as HifzTypes.Badge));
    } catch (error) {
      console.error('Error fetching user badges:', error);
      throw error;
    }
  }

  // ==================== LEADERBOARD OPERATIONS ====================

  async updateLeaderboardEntry(userId: string, entry: Partial<HifzTypes.Leaderboard>): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTIONS.LEADERBOARD, userId);
      await setDoc(docRef, {
        userId,
        ...entry,
        updatedAt: new Date(),
      }, { merge: true });
    } catch (error) {
      console.error('Error updating leaderboard:', error);
      throw error;
    }
  }

  async getLeaderboard(limit: number = 100): Promise<HifzTypes.Leaderboard[]> {
    try {
      const snapshot = await getDocs(collection(db, this.COLLECTIONS.LEADERBOARD));
      const entries = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          studentId: doc.id,
          rank: data.rank || 0,
          studentName: data.studentName || 'Unknown',
          totalPagesMemoized: data.totalPagesMemoized || 0,
          retentionScore: data.retentionScore || 0,
          currentStreak: data.currentStreak || 0,
          combinedScore: data.combinedScore || 0,
          createdAt: data.createdAt || new Date(),
          updatedAt: data.updatedAt || new Date(),
        } as HifzTypes.Leaderboard;
      });
      
      return entries
        .sort((a, b) => (b.totalPagesMemoized || 0) - (a.totalPagesMemoized || 0))
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  }

  // ==================== BATCH OPERATIONS ====================

  async migrateLocalDataToFirebase(
    userId: string,
    memorizations: HifzTypes.MemorizationRecord[],
    revisions: HifzTypes.RevisionLog[],
    weakPages: HifzTypes.WeakPage[]
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    try {
      // Migrate memorizations
      for (const memo of memorizations) {
        try {
          await this.recordMemorization(memo);
          success++;
        } catch (e) {
          failed++;
        }
      }

      // Migrate revisions
      for (const rev of revisions) {
        try {
          await this.logRevision(rev);
          success++;
        } catch (e) {
          failed++;
        }
      }

      // Migrate weak pages
      for (const wp of weakPages) {
        try {
          await this.createWeakPageRecord(wp);
          success++;
        } catch (e) {
          failed++;
        }
      }

      return { success, failed };
    } catch (error) {
      console.error('Error during data migration:', error);
      throw error;
    }
  }

  // ==================== TEACHER OPERATIONS ====================

  async getTeacherStudents(teacherId: string): Promise<HifzTypes.StudentProfile[]> {
    try {
      const q = query(
        collection(db, this.COLLECTIONS.STUDENTS),
        where('assignedTeacherId', '==', teacherId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        userId: doc.id,
        ...doc.data(),
      } as HifzTypes.StudentProfile));
    } catch (error) {
      console.error('Error fetching teacher students:', error);
      throw error;
    }
  }

  // ==================== ANALYTICS OPERATIONS ====================

  async getAcademyStats(): Promise<{
    totalStudents: number;
    activeStudents: number;
    totalPagesMemoized: number;
    averageRetention: number;
  }> {
    try {
      const studentsSnapshot = await getDocs(collection(db, this.COLLECTIONS.STUDENTS));
      const students = studentsSnapshot.docs.map(doc => doc.data() as HifzTypes.StudentProfile);
      
      const totalStudents = students.length;
      const activeStudents = students.filter(s => {
        if (!s.lastActiveDate) return false;
        const daysSinceActive = (Date.now() - new Date(s.lastActiveDate).getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceActive < 7;
      }).length;

      const totalPagesMemoized = students.reduce((sum, s) => sum + (s.totalPagesMemoized || 0), 0);
      const averageRetention = students.length > 0
        ? students.reduce((sum, s) => sum + (s.retentionScore || 0), 0) / students.length
        : 0;

      return {
        totalStudents,
        activeStudents,
        totalPagesMemoized,
        averageRetention: Math.round(averageRetention),
      };
    } catch (error) {
      console.error('Error fetching academy stats:', error);
      throw error;
    }
  }

  async getAtRiskStudents(): Promise<HifzTypes.StudentProfile[]> {
    try {
      const snapshot = await getDocs(collection(db, this.COLLECTIONS.STUDENTS));
      const students = snapshot.docs.map(doc => ({
        userId: doc.id,
        ...doc.data(),
      } as HifzTypes.StudentProfile));

      return students.filter(student => {
        // At risk if: inactive >7 days, streak <2, or retention <60%
        if (student.lastActiveDate) {
          const daysSinceActive = (Date.now() - new Date(student.lastActiveDate).getTime()) / (1000 * 60 * 60 * 24);
          if (daysSinceActive > 7) return true;
        }
        if ((student.streakDays || 0) < 2) return true;
        if ((student.retentionScore || 100) < 60) return true;
        return false;
      });
    } catch (error) {
      console.error('Error fetching at-risk students:', error);
      throw error;
    }
  }
}

export default new HifzDataService();
