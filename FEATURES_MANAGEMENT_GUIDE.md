# Features Management System

## Overview
The Features Management System allows administrators to add, edit, and manage featured content (videos, images, and text) that displays on the homepage of the Mohammadi Online Quran Academy website.

## User Features

### Display on Homepage
- Featured content appears in a dedicated section on the homepage
- Shows up to 6 most recently published items in a responsive grid
- Supports multiple content types with appropriate displays

### Content Types

#### 1. Video
- Display YouTube video thumbnails with play button overlay
- Requires YouTube URL (e.g., https://youtube.com/watch?v=VIDEO_ID)
- Automatically extracts video ID and displays thumbnail
- Click to view more navigates to the video

#### 2. Image
- Display custom images with hover effects
- Requires direct image URL
- Shows image icon on hover
- Fallback placeholder if image fails to load

#### 3. Text
- Display text-based content with gradient background
- Content stored in the description field
- File text icon displayed
- Can include articles, announcements, or messages

## Admin Features

### Access
- Go to **Admin Panel** â†’ **Website** â†’ **Featured Content**
- Or navigate to `/admin/features`

### Add Feature
1. Click the **"Add Feature"** button
2. Fill in the required fields:
   - **Feature Title** - Title of the content
   - **Feature Description** - Description or content
   - **Content Type** - Choose: Video, Image, or Text
   - **Media URL** - (For video/image only) URL to the media
3. Click **Save**

### Edit Feature
1. Click the **Edit** icon (pencil) next to any feature
2. Modify the desired fields
3. Click **Save**

### Delete Feature
1. Click the **Delete** icon (trash) next to any feature
2. Confirm the deletion

## Data Storage

Features are stored in **localStorage** for client-side persistence:
- Key: `academy_features`
- Format: JSON array of Feature objects

### Feature Object Structure
```typescript
{
  id: string;
  title: string;
  description: string;
  type: 'video' | 'image' | 'text';
  mediaUrl?: string;        // URL for video/image
  content?: string;         // Alternative text content
  publishDate: Date;        // When the feature was published
  createdAt: Date;         // When the feature was created
  updatedAt: Date;         // Last update time
}
```

## Multilingual Support

All feature management interface text is available in:
- English (en)
- Arabic (ar)
- Persian/Farsi (fa)
- Pashto (ps)

Features display titles and descriptions as entered by the admin in any language.

## Responsive Design

- **Desktop**: 3-column grid layout
- **Tablet**: 2-column grid layout
- **Mobile**: Single column layout

## Future Enhancements

Potential improvements for the Features system:
1. Database integration (Firebase/PostgreSQL)
2. File upload instead of URL input
3. Feature scheduling (publish/unpublish dates)
4. Category/tagging system
5. Performance analytics (views, clicks)
6. Rich text editor for descriptions
7. Featured content rotation/carousel
8. Admin user permissions
9. Bulk import/export
10. Version history and rollback

## Components

### FeaturesSection.tsx
- Location: `/components/FeaturesSection.tsx`
- Displays featured content on homepage
- Handles data fetching from localStorage
- Responsive grid layout

### AdminFeaturesPage.tsx
- Location: `/pages/admin/AdminFeaturesPage.tsx`
- Admin management interface
- CRUD operations for features
- Modal form for adding/editing

## Localization Keys

Added to constants.ts for all languages:
- `features.title` - "Featured Content"
- `features.subtitle` - "Explore our latest videos, resources, and Islamic content"
- `features.addFeature` - "Add Feature"
- `features.editFeature` - "Edit Feature"
- `features.deleteFeature` - "Delete Feature"
- `features.featureTitle` - "Feature Title"
- `features.featureDescription` - "Feature Description"
- `features.featureType` - "Content Type"
- `features.video` - "Video"
- `features.image` - "Image"
- `features.text` - "Text"
- `features.uploadMedia` - "Upload Media"
- `features.mediaUrl` - "Media URL"
- `features.publishDate` - "Publish Date"
- `features.noFeatures` - "No features available yet"
- `features.viewMore` - "View More"

## Integration Points

### Routes
- Admin page: `/admin/features`
- Nested under Admin Layout

### Navigation
- Added to Admin Layout sidebar under "Website" section
- Link accessible to admin users only

### Homepage
- FeaturesSection component added to HomePage
- Displays between testimonials section and admission form

## Example Usage

### Adding a YouTube Video Feature
1. Navigate to `/admin/features`
2. Click "Add Feature"
3. Title: "How to Learn Tajweed"
4. Description: "Learn the proper rules of Quranic recitation"
5. Type: "Video"
6. Media URL: "https://youtube.com/watch?v=abc123def456"
7. Click Save

### Adding an Image Feature
1. Title: "Our Academy Teachers"
2. Description: "Meet our qualified Quran instructors"
3. Type: "Image"
4. Media URL: "https://example.com/teachers.jpg"
5. Click Save

### Adding Text Content
1. Title: "Islamic Reflection"
2. Description: "A beautiful verse from the Quran about seeking knowledge..."
3. Type: "Text"
4. Click Save

## Notes

- Features are sorted by publish date (newest first)
- Homepage shows maximum 6 items
- Admin view shows all features in table format
- Responsive design ensures mobile compatibility
- RTL support for Arabic, Persian, and Pashto languages

