# Course Management System - Complete Guide

## 🎯 What Was Changed

Your academy now has a completely new course management architecture:

### **OLD SYSTEM** (Before)
- ❌ Admin could create unlimited courses anytime
- ❌ Course title, category, type, price were all editable
- ❌ No central media library
- ❌ Lessons were not separate entities

### **NEW SYSTEM** (Now)
- ✅ **6 Fixed Predefined Courses** - Cannot be created or deleted
- ✅ **Edit Course Metadata Only** - Description, level, target audience, thumbnail, status
- ✅ **Lessons Manager** - Create unlimited lessons within each course
- ✅ **Central Media Library** - Reusable media assets (videos, PDFs, audio, images)
- ✅ **Drag-and-Drop Upload** - Easy file upload with progress tracking
- ✅ **Lesson Ordering** - Move lessons up/down to control sequence

---

## 📋 The 6 Predefined Courses

| ID | Course Name | Category | Default Level |
|----|------------|----------|---------------|
| `quran-tajweed` | Quran Tajweed | Quran | Intermediate |
| `noorani-qaida` | Noorani Qaida | Quran | Beginner |
| `hifz-quran` | Hifz Quran (Memorization) | Quran | All Levels |
| `quran-tafsir` | Quran Tafsir (Interpretation) | Islamic Studies | Advanced |
| `arabic-language` | Arabic Language | Arabic | All Levels |
| `islamic-studies` | Islamic Studies | Islamic Studies | All Levels |

---

## 🚀 Step-by-Step Setup & Testing

### **Step 1: Seed the Database**

1. Go to Admin Panel → **Settings** → **Seed Database**
2. Click the **"Seed Courses"** button
3. Wait for success message: "All 6 predefined courses have been seeded to the database"
4. This creates the 6 courses in Firestore with default data

**Note:** You only need to do this ONCE. If courses already exist, it will merge data (won't overwrite existing fields).

---

### **Step 2: Edit Course Information**

1. Go to **Courses** → **Edit Courses** (Course List)
2. You'll see all 6 courses with:
   - Course name (read-only, cannot be changed)
   - Category badge
   - Description
   - Status (Draft/Published)
   - Active status (Eye icon = active, EyeOff = inactive)
   - Lessons count
   
3. Click **"Edit"** on any course
4. You can now update:
   - ✏️ **Description** - Explain course objectives
   - 🎯 **Target Audience** - Who should take this course
   - 📊 **Level** - Beginner, Intermediate, Advanced, All Levels
   - 📌 **Status** - Draft or Published
   - 👁️ **Active** - Toggle visibility to students
   - 🖼️ **Thumbnail** - Upload course image (click "Upload Thumbnail")
   - 📚 **Teacher ID** - Assign instructor
   - ⏱️ **Class Format** - Duration, modes, materials
   - ✅ **Requirements** - Prerequisites for students

5. Click **"Save Changes"** when done

**Important:** Course name and category are fixed and cannot be changed!

---

### **Step 3: Create Lessons**

1. Go to **Courses** → **Lessons Manager**
2. **Select a course** from the dropdown (e.g., "Quran Tajweed")
3. Click **"Add New Lesson"** button
4. Fill in the form:
   - **Title**: e.g., "Introduction to Makharij"
   - **Lesson Number**: e.g., 1, 2, 3 (for ordering)
   - **Content**: Detailed lesson text (supports long descriptions)
   - **Status**: Draft, Published, or Archived

5. **Attach Media** (Optional):
   - Click **"Choose from Library"** under Video URL, PDF URL, or Audio URL
   - This opens the **Media Picker** modal
   - Search for existing media or close the modal
   - Copy the URL and it will be automatically filled

6. **Add Homework & Quiz** (Optional):
   - Write homework assignments
   - Add quiz questions

7. Click **"Save Lesson"**

---

### **Step 4: Upload Media to Library**

1. Go to **Courses** → **Media Library**
2. You'll see:
   - **Stats Cards** showing total media count by type
   - **Upload Section** at the top
   - **Media Grid** showing all existing files

3. **To Upload New Media**:
   - Select **File Type** (Image, Video, PDF, Audio, or Document)
   - Click **"Choose Files"** or **drag and drop** files into the box
   - You'll see upload progress for each file
   - Once uploaded, files appear in the grid below

4. **File Size Limits**:
   - Images: 10 MB
   - Videos: 500 MB
   - PDFs: 50 MB
   - Audio: 100 MB
   - Documents: 50 MB

5. **Search & Filter**:
   - Use the search box to find files by name
   - Use the filter dropdown to show only specific types

6. **Copy URL**:
   - Click **"Copy URL"** button on any file
   - The URL is copied to your clipboard
   - You can now paste it into lesson forms

7. **Delete Files**:
   - Click **"Delete"** button on any file
   - Confirm deletion when prompted
   - File is removed from Firebase Storage and database

---

### **Step 5: Organize Lessons**

1. Go to **Courses** → **Lessons Manager**
2. Select the course with lessons you want to reorder
3. You'll see a list of all lessons with:
   - Lesson number
   - Title
   - Status badge
   - Media icons (if video/PDF/audio attached)
   - Edit and Delete buttons

4. **Reorder Lessons**:
   - Click the **↑** (up arrow) to move a lesson higher
   - Click the **↓** (down arrow) to move a lesson lower
   - This changes the lesson numbers automatically

5. **Edit Lessons**:
   - Click **"Edit"** to modify lesson details
   - The form loads with existing data
   - Make changes and click **"Save Lesson"**

6. **Delete Lessons**:
   - Click **"Delete"** to remove a lesson
   - Confirm deletion when prompted

---

## 📁 Firestore Collections Structure

Your database now has these collections:

### **courses/** collection
```
courses/quran-tajweed
  ├── id: "quran-tajweed"
  ├── name: "Quran Tajweed"
  ├── category: "quran"
  ├── description: "..."
  ├── level: "intermediate"
  ├── targetAudience: "..."
  ├── thumbnailUrl: "https://..."
  ├── isActive: true
  ├── status: "published"
  ├── teacherId: ""
  ├── classFormat: { duration, mode[], materials[] }
  ├── requirements: []
  ├── createdAt: Timestamp
  └── updatedAt: Timestamp
```

### **lessons/** collection
```
lessons/auto-generated-id
  ├── id: "auto-generated-id"
  ├── courseId: "quran-tajweed" (foreign key)
  ├── title: "Introduction to Makharij"
  ├── lessonNumber: 1
  ├── content: "..."
  ├── videoUrl: "https://..."
  ├── pdfUrl: "https://..."
  ├── audioUrl: "https://..."
  ├── homework: "..."
  ├── quiz: "..."
  ├── status: "published"
  ├── createdAt: Timestamp
  └── updatedAt: Timestamp
```

### **mediaFiles/** collection
```
mediaFiles/auto-generated-id
  ├── id: "auto-generated-id"
  ├── name: "tajweed-chart.pdf"
  ├── url: "https://firebasestorage..."
  ├── type: "pdf"
  ├── size: 2451789 (bytes)
  ├── folder: "courses"
  └── uploadedAt: Timestamp
```

---

## 🔒 Important Rules & Constraints

### **What You CAN Do:**
✅ Edit course description, level, target audience, thumbnail  
✅ Change course status (draft/published) and active state  
✅ Create unlimited lessons within each course  
✅ Upload unlimited media files to the library  
✅ Attach multiple media files to each lesson  
✅ Reorder lessons by moving them up/down  
✅ Delete individual lessons  
✅ Delete media files from the library  

### **What You CANNOT Do:**
❌ Create new courses (only 6 predefined)  
❌ Delete predefined courses  
❌ Change course name or category (fixed)  
❌ Upload files larger than size limits  
❌ Upload disallowed file types  

---

## 🎨 User Interface Updates

### **Navigation Changes:**
- "Create Course" → **"Edit Courses"**
- New: **"Lessons Manager"** link
- New: **"Media Library"** link
- New: **"Seed Database"** link under Settings

### **Course List Page:**
- Removed "Create Course" button
- Removed "Delete" buttons
- Removed category filter dropdown
- Shows lessons count for each course
- Edit button navigates to edit page

### **Edit Course Page:**
- Replaced title input with read-only course name display
- Removed category, type, and price fields
- Added level selector (Beginner/Intermediate/Advanced/All)
- Added target audience input
- Added active/inactive toggle checkbox
- Added thumbnail uploader section
- Page title changed to "Edit Course: [Course Name]"

---

## 🧪 Testing Checklist

Use this checklist to verify everything works:

- [ ] 1. Navigate to Settings → Seed Database
- [ ] 2. Click "Seed Courses" and verify success message
- [ ] 3. Go to Courses → Edit Courses and see all 6 courses
- [ ] 4. Click Edit on "Quran Tajweed"
- [ ] 5. Update description and save
- [ ] 6. Upload a thumbnail image
- [ ] 7. Change level to "Beginner" and save
- [ ] 8. Go to Lessons Manager
- [ ] 9. Select "Quran Tajweed" from dropdown
- [ ] 10. Click "Add New Lesson"
- [ ] 11. Fill in title, lesson number, and content
- [ ] 12. Save lesson and verify it appears in the list
- [ ] 13. Create 2-3 more lessons
- [ ] 14. Use up/down arrows to reorder lessons
- [ ] 15. Go to Media Library
- [ ] 16. Upload an image file (drag-and-drop)
- [ ] 17. Upload a PDF file
- [ ] 18. Search for files using search box
- [ ] 19. Filter to show only images
- [ ] 20. Copy URL of a file
- [ ] 21. Go back to Lessons Manager
- [ ] 22. Edit a lesson
- [ ] 23. Click "Choose from Library" under Video URL
- [ ] 24. Select a media file from the picker
- [ ] 25. Save lesson with attached media
- [ ] 26. Verify media icon appears in lesson list
- [ ] 27. Delete a lesson
- [ ] 28. Go back to Media Library
- [ ] 29. Delete a media file
- [ ] 30. Verify file is removed from grid

---

## 🎯 Common Workflows

### **Workflow 1: Setting Up a Complete Course**

1. Seed database (one-time setup)
2. Edit course → Add description, thumbnail, level
3. Go to Media Library → Upload all videos, PDFs, images
4. Go to Lessons Manager → Create Lesson 1
5. Attach video from library
6. Attach PDF from library
7. Add homework
8. Save lesson
9. Repeat for Lessons 2, 3, 4...
10. Reorder if needed
11. Set course status to "Published"

### **Workflow 2: Adding a Single Lesson**

1. Go to Lessons Manager
2. Select course
3. Click "Add New Lesson"
4. Enter title (e.g., "Lesson 5: Advanced Rules")
5. Set lesson number to 5
6. Write content
7. Click "Choose from Library" → Select video
8. Save lesson
9. Done!

### **Workflow 3: Uploading and Using New Media**

1. Go to Media Library
2. Select file type (e.g., "Video")
3. Drag video file into upload box
4. Wait for upload to complete
5. Click "Copy URL"
6. Go to Lessons Manager
7. Edit a lesson
8. Paste URL into "Video URL" field
9. Save lesson

---

## 📊 Benefits of New Architecture

### **For Admins:**
- 🎯 **Focused Management** - Edit course info separately from creating lessons
- 📚 **Organized Content** - All lessons grouped by course
- 🎨 **Reusable Media** - Upload once, use in multiple lessons
- 🔍 **Easy Search** - Find media files quickly
- 📈 **Scalability** - Add unlimited lessons without cluttering courses

### **For Students:**
- 📖 **Structured Learning** - Fixed courses with clear lesson progression
- 🎥 **Rich Media** - Videos, PDFs, audio in each lesson
- ✅ **Clear Prerequisites** - Know what level each course requires
- 📊 **Progress Tracking** - Follow lessons in numerical order

### **For System:**
- 🗄️ **Better Data Model** - Normalized database structure
- 🚀 **Performance** - Faster queries (lessons separate from courses)
- 🔒 **Data Integrity** - Can't accidentally delete core courses
- 🛠️ **Maintainability** - Clear separation of concerns

---

## 🆘 Troubleshooting

### **Issue: "Course name cannot be changed"**
✅ This is intentional. The 6 course names are fixed. You can only edit description, level, thumbnail, etc.

### **Issue: "Cannot create new course"**
✅ This is intentional. You work with 6 predefined courses only. Create lessons within them instead.

### **Issue: "Media Picker shows no files"**
- Go to Media Library and upload files first
- Make sure files uploaded successfully
- Check if filters are applied (change to "All Types")

### **Issue: "File upload fails"**
- Check file size (might exceed limits)
- Verify file type is allowed
- Check internet connection
- Verify Firebase Storage rules

### **Issue: "Lessons not showing"**
- Make sure you selected the correct course from dropdown
- Verify lessons were saved successfully
- Check if any filters are applied

---

## 🎓 Next Steps

Now that the system is set up:

1. **Seed the database** to create the 6 courses
2. **Edit each course** to add proper descriptions and thumbnails
3. **Upload media files** that you'll use in lessons
4. **Create lessons** for each course (start with one complete course)
5. **Test the student view** to see how lessons appear
6. **Assign teachers** to each course
7. **Publish courses** when ready for students

---

## 💡 Tips for Content Creation

### **For Course Descriptions:**
- Explain what students will learn
- List key outcomes
- Mention prerequisites
- Describe teaching methodology

### **For Lessons:**
- Use descriptive titles (e.g., "Lesson 3: Rules of Noon Sakinah")
- Number lessons sequentially (1, 2, 3...)
- Write detailed content with examples
- Attach relevant media (video + PDF is ideal)
- Add homework for practice
- Include quiz questions to test understanding

### **For Media Library:**
- Use descriptive filenames (e.g., "tajweed-rules-makharij.pdf")
- Organize by topic or lesson
- Keep file sizes reasonable (compress videos if needed)
- Upload high-quality materials

---

## 📞 Support

If you encounter any issues:
1. Check this guide first
2. Verify you seeded the database
3. Check browser console for errors
4. Verify Firebase connection
5. Test with a fresh browser session

---

**System Ready!** 🎉

Your course management system is now fully operational with the new architecture. Start by seeding the database, then edit courses and create lessons. Happy teaching! 📚✨
