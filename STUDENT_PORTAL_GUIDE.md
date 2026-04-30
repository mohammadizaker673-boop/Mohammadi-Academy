# Student Portal Access Guide

## Quick Access for Testing

### Option 1: Quick Student Login (Recommended for Testing)
1. Navigate to: `http://localhost:3000/quick-student-login`
2. Click "Access Student Portal" button
3. Automatically logs in with test credentials

**Test Credentials:**
- Email: `student@mohammadiacademy.com`
- Password: `student123456`

### Option 2: Regular Login
1. Navigate to: `http://localhost:3000/login`
2. Enter the test credentials above
3. System will automatically redirect you to `/student` dashboard based on your role

### Option 3: Create Test Student Account
If the test student account doesn't exist yet:
1. Log in to admin panel: `http://localhost:3000/quick-admin-login`
2. Navigate to: **Settings → Seed Database**
3. Scroll to "Create Test Student Account" section
4. Click "Create Test Student" button
5. Once created, use Option 1 or 2 above to access the portal

## Student Portal Features

Once logged in to the student portal (`/student`), you'll have access to:

### 1. Dashboard (`/student`)
- Overview of your profile
- Current course information
- Assigned teacher details
- Class schedule
- Progress tracking
- Fee status

### 2. My Progress (`/student/progress`)
- Current Surah and Ayah
- Memorized Surahs list
- Completion percentage
- Learning milestones

### 3. Attendance (`/student/attendance`)
- Today's attendance status
- Monthly attendance records
- Attendance percentage
- Performance insights
- Complete history table

### 4. Fees (`/student/fees`)
- Fee payment history
- Outstanding invoices
- Payment receipts
- Fee breakdown

### 5. Profile (`/student/profile`)
- Personal information
- Contact details
- Account settings

## Student Portal Architecture

### Routes
```typescript
/student                    // Main Dashboard
/student/progress          // Progress Tracking
/student/attendance        // Attendance Records
/student/fees             // Fee Management
/student/profile          // Profile Settings
```

### Components
- `StudentLayout.tsx` - Main layout with sidebar navigation
- `StudentDashboard.tsx` - Dashboard with overview cards
- `MyAttendance.tsx` - Complete attendance tracking interface
- `StudentFees.tsx` - Fee management interface

### Authentication
The student portal is protected by role-based authentication:
- Only users with `role: 'student'` can access
- Automatic redirect to login if not authenticated
- Automatic redirect to appropriate dashboard based on role

## Troubleshooting

### Issue: "Student portal is not showing up"
**Solutions:**
1. Make sure you're logged in with a student account
2. Check that the account has `role: 'student'` in Firestore
3. Use `/quick-student-login` for guaranteed access with test account
4. Clear browser cache and try again
5. Check browser console for any errors

### Issue: "Cannot access /student route"
**Solutions:**
1. Verify you're logged in (check auth state)
2. Verify your account role in Firestore database
3. Try logging out and back in
4. Use Quick Student Login for testing

### Issue: "Test student account doesn't exist"
**Solution:**
1. Go to Admin → Settings → Seed Database
2. Click "Create Test Student" button
3. Or manually create account via `/register` with:
  - Email: student@mohammadiacademy.com
   - Password: student123456
   - Role: student

## Database Structure

### Test Student Profile
```javascript
// users collection
{
  uid: "auto-generated",
  email: "student@mohammadiacademy.com",
  displayName: "Test Student",
  phone: "+1234567890",
  role: "student",
  isActive: true
}

// students collection
{
  userId: "matches-user-uid",
  fullName: "Test Student",
  email: "student@mohammadiacademy.com",
  phone: "+1234567890",
  studentType: "online",
  currentCourse: "quran-tajweed",
  level: "beginner",
  status: "active",
  schedule: {
    days: ["Monday", "Wednesday", "Friday"],
    timeSlot: "10:00 AM - 11:00 AM",
    meetingLink: "https://meet.google.com/test"
  },
  progress: {
    currentSurah: "Al-Fatiha",
    currentAyah: 1,
    memorizedSurahs: [],
    completionPercentage: 0
  },
  monthlyFee: 50
}
```

## Quick Links

- Admin Portal: `/quick-admin-login`
- Student Portal: `/quick-student-login`
- Regular Login: `/login`
- Register: `/register`
- Home: `/`

## Production Notes

⚠️ **Important:** Before deploying to production:
1. Remove `/quick-admin-login` and `/quick-student-login` routes
2. Remove test account creation scripts
3. Implement proper user registration flow
4. Add email verification
5. Implement password reset functionality
6. Add proper session management
