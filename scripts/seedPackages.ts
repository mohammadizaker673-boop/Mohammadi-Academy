import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

const DEFAULT_PACKAGES = [
  {
    name: 'Basic Package',
    price: 15,
    duration: 'month',
    classesPerWeek: 2,
    sessionDuration: 30,
    displayOrder: 1,
    isActive: true,
    features: [
      { text: '2 Classes Per Week', included: true },
      { text: '30-Minute Sessions', included: true },
      { text: 'Qualified Teacher', included: true },
      { text: 'Progress Reports', included: false },
      { text: 'Recorded Lessons', included: false }
    ]
  },
  {
    name: 'Standard Package',
    price: 25,
    duration: 'month',
    classesPerWeek: 3,
    sessionDuration: 45,
    displayOrder: 2,
    isActive: true,
    features: [
      { text: '3 Classes Per Week', included: true },
      { text: '45-Minute Sessions', included: true },
      { text: 'Qualified Teacher', included: true },
      { text: 'Progress Reports', included: true },
      { text: 'Homework Support', included: true },
      { text: 'Recorded Lessons', included: false }
    ]
  },
  {
    name: 'Premium Package',
    price: 40,
    duration: 'month',
    classesPerWeek: 5,
    sessionDuration: 60,
    displayOrder: 3,
    isActive: true,
    features: [
      { text: '5 Classes Per Week', included: true },
      { text: '60-Minute Sessions', included: true },
      { text: 'Expert Teacher', included: true },
      { text: 'Progress Reports', included: true },
      { text: 'Homework Support', included: true },
      { text: 'Recorded Lessons', included: true },
      { text: 'Priority Support', included: true },
      { text: 'Certificate on Completion', included: true }
    ]
  }
];

export async function seedPackages() {
  try {
    console.log('Starting to seed packages...');
    
    const packagesRef = collection(db, 'packages');
    const now = Timestamp.now();
    
    for (const pkg of DEFAULT_PACKAGES) {
      await addDoc(packagesRef, {
        ...pkg,
        createdAt: now,
        updatedAt: now
      });
      
      console.log(`✓ Seeded package: ${pkg.name}`);
    }
    
    console.log('\n✅ All packages seeded successfully!');
    console.log(`Total packages: ${DEFAULT_PACKAGES.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding packages:', error);
    throw error;
  }
}
