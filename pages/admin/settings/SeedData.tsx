import { useState } from 'react';
import { Database, Check, AlertCircle, Package, UserPlus } from 'lucide-react';
import { seedPredefinedCourses } from '../../../scripts/seedCourses';
import { seedPackages } from '../../../scripts/seedPackages';
import { seedTestStudent } from '../../../scripts/seedTestStudent';

export default function SeedData() {
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [loadingStudent, setLoadingStudent] = useState(false);
  const [successCourses, setSuccessCourses] = useState(false);
  const [successPackages, setSuccessPackages] = useState(false);
  const [successStudent, setSuccessStudent] = useState(false);
  const [error, setError] = useState('');

  const handleSeedCourses = async () => {
    setLoadingCourses(true);
    setSuccessCourses(false);
    setError('');

    try {
      await seedPredefinedCourses();
      setSuccessCourses(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to seed courses');
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleSeedPackages = async () => {
    setLoadingPackages(true);
    setSuccessPackages(false);
    setError('');

    try {
      await seedPackages();
      setSuccessPackages(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to seed packages');
    } finally {
      setLoadingPackages(false);
    }
  };

  const handleSeedStudent = async () => {
    setLoadingStudent(true);
    setSuccessStudent(false);
    setError('');

    try {
      await seedTestStudent();
      setSuccessStudent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create test student');
    } finally {
      setLoadingStudent(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Database className="text-primary-500" size={32} />
          Seed Database
        </h1>
        <p className="text-white mt-2">Initialize the database with predefined data</p>
      </div>

      {/* Courses Section */}
      <div className="bg-slate-800 rounded-xl shadow-lg p-8 mb-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Database className="text-primary-500" size={24} />
          Seed Courses
        </h2>
        <div className="space-y-6">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Important Note</h3>
            <p className="text-sm text-yellow-700">
              This will create 6 predefined courses in your Firestore database:
            </p>
            <ul className="text-sm text-yellow-700 mt-2 ml-4 list-disc">
              <li>Quran Tajweed</li>
              <li>Noorani Qaida</li>
              <li>Hifz Quran (Memorization)</li>
              <li>Quran Tafsir (Interpretation)</li>
              <li>Arabic Language</li>
              <li>Islamic Studies</li>
            </ul>
            <p className="text-sm text-yellow-700 mt-2">
              If courses already exist, they will be merged with existing data (existing fields won't be overwritten).
            </p>
          </div>

          {successCourses && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <Check className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-semibold text-green-800">Success!</h3>
                <p className="text-sm text-green-700">All 6 predefined courses have been seeded to the database.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-semibold text-red-800">Error</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleSeedCourses}
            disabled={loadingCourses}
            className="w-full py-3 px-6 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-lg hover:from-primary-600 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingCourses ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Seeding Courses...
              </span>
            ) : (
              'Seed Courses'
            )}
          </button>
        </div>
      </div>

      {/* Packages Section */}
      <div className="bg-slate-800 rounded-xl shadow-lg p-8">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Package className="text-purple-500" size={24} />
          Seed Pricing Packages
        </h2>
        <div className="space-y-6">
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">⚠️ Important Note</h3>
            <p className="text-sm text-purple-700">
              This will create 3 default pricing packages in your Firestore database:
            </p>
            <ul className="text-sm text-purple-700 mt-2 ml-4 list-disc">
              <li>Basic Package - $15/month (2 classes/week, 30 min sessions)</li>
              <li>Standard Package - $25/month (3 classes/week, 45 min sessions)</li>
              <li>Premium Package - $40/month (5 classes/week, 60 min sessions)</li>
            </ul>
            <p className="text-sm text-purple-700 mt-2">
              You can edit or delete these packages after seeding.
            </p>
          </div>

          {successPackages && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <Check className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-semibold text-green-800">Success!</h3>
                <p className="text-sm text-green-700">All 3 default packages have been seeded to the database.</p>
              </div>
            </div>
          )}

          <button
            onClick={handleSeedPackages}
            disabled={loadingPackages}
            className="w-full py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingPackages ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Seeding Packages...
              </span>
            ) : (
              'Seed Packages'
            )}
          </button>
        </div>
      </div>

      {/* Test Student Section */}
      <div className="bg-slate-800 rounded-xl shadow-lg p-8">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <UserPlus className="text-green-500" size={24} />
          Create Test Student Account
        </h2>
        <div className="space-y-6">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">ℹ️ Test Account Info</h3>
            <p className="text-sm text-green-700">
              This will create a test student account for accessing the student portal:
            </p>
            <ul className="text-sm text-green-700 mt-2 ml-4 list-disc">
              <li>Email: student@mohammadiacademy.com</li>
              <li>Password: student123456</li>
              <li>Full profile with sample data</li>
            </ul>
            <p className="text-sm text-green-700 mt-2">
              Access: <a href="/quick-student-login" className="font-bold underline hover:text-green-900">/quick-student-login</a>
            </p>
          </div>

          {successStudent && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <Check className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-semibold text-green-800">Success!</h3>
                <p className="text-sm text-green-700">Test student account has been created. Visit <a href="/quick-student-login" className="font-bold underline">/quick-student-login</a> to test!</p>
              </div>
            </div>
          )}

          <button
            onClick={handleSeedStudent}
            disabled={loadingStudent}
            className="w-full py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingStudent ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating Account...
              </span>
            ) : (
              'Create Test Student'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
