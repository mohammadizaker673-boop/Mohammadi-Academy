import { doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

/**
 * Create an admin user in Firestore
 * 
 * IMPORTANT: Run this function ONCE after registering an admin account through Firebase Auth
 * 
 * Steps:
 * 1. Go to Firebase Console > Authentication > Users
 * 2. Click "Add user"
 * 3. Email: admin@mohammadiacademy.com
 * 4. Password: (set a strong password)
 * 5. Copy the User UID from Firebase
 * 6. Call this function with the UID
 */
export const createAdminUser = async (userId: string, email: string, displayName: string) => {
  try {
    // Create user document
    await setDoc(doc(db, 'users', userId), {
      uid: userId,
      email: email,
      displayName: displayName,
      role: 'admin',
      phone: '',
      photoURL: null,
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    });

    console.log('✅ Admin user created successfully!');
    console.log('User ID:', userId);
    console.log('Email:', email);
    console.log('Role: admin');
    
    return { success: true, message: 'Admin user created successfully' };
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    return { success: false, message: error };
  }
};

/**
 * Quick function to promote an existing user to admin
 */
export const promoteToAdmin = async (userId: string) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      role: 'admin',
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    console.log('✅ User promoted to admin successfully!');
    return { success: true, message: 'User promoted to admin' };
  } catch (error) {
    console.error('❌ Error promoting user:', error);
    return { success: false, message: error };
  }
};
