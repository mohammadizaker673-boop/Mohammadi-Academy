import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const TEST_STUDENT = {
  email: 'student@mohammadiacademy.com',
  password: 'student123456',
  displayName: 'Test Student',
  phone: '+1234567890',
  role: 'student' as const
};

export async function seedTestStudent() {
  try {
    console.log('Creating test student account...');

    // Create Firebase auth account
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      TEST_STUDENT.email,
      TEST_STUDENT.password
    );

    const userId = userCredential.user.uid;

    // Create user document in Firestore
    await setDoc(doc(db, 'users', userId), {
      email: TEST_STUDENT.email,
      displayName: TEST_STUDENT.displayName,
      phone: TEST_STUDENT.phone,
      role: TEST_STUDENT.role,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      isActive: true,
      lastLogin: Timestamp.now()
    });

    console.log('✓ Created user account with UID:', userId);

    // Create student document
    await setDoc(doc(db, 'students', userId), {
      userId: userId,
      fullName: TEST_STUDENT.displayName,
      email: TEST_STUDENT.email,
      phone: TEST_STUDENT.phone,
      studentType: 'online',
      currentCourse: 'quran-tajweed',
      level: 'beginner',
      enrollmentDate: new Date().toISOString(),
      assignedTeacherId: null,
      schedule: {
        days: ['Monday', 'Wednesday', 'Friday'],
        timeSlot: '10:00 AM - 11:00 AM',
        meetingLink: 'https://meet.google.com/test'
      },
      progress: {
        currentSurah: 'Al-Fatiha',
        currentAyah: 1,
        memorizedSurahs: [],
        completionPercentage: 0
      },
      monthlyFee: 50,
      status: 'active',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    console.log('✓ Created student profile');

    console.log('\n✅ Test student account created successfully!');
    console.log('Email:', TEST_STUDENT.email);
    console.log('Password:', TEST_STUDENT.password);
    console.log('\nYou can now:');
    console.log('1. Go to /quick-student-login for quick access');
    console.log('2. Or use /login with the credentials above');

  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('✓ Student account already exists!');
      console.log('Email:', TEST_STUDENT.email);
      console.log('Password:', TEST_STUDENT.password);
      console.log('\nUse /quick-student-login for quick access');
    } else {
      console.error('❌ Error creating test student:', error.message);
      throw error;
    }
  }
}
