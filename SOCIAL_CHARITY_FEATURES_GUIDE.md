# Social Media, Charity Foundation, and Featured Content Guide

## Overview

This guide covers three major additions to the Mohammadi Online Quran Academy website:

1. **Social Media Links Section** - Connect with users across all major platforms
2. **Charity Foundation Page** - Dedicated donation and charity foundation page
3. **Sample Featured Content** - Pre-loaded beautiful featured content examples

---

## 1. Social Media Links Section

### Purpose
Display social media links in an attractive grid format, allowing users to connect with the academy on various platforms.

### Component
- **File**: `components/SocialLinksSection.tsx`
- **Location on Homepage**: Between Featured Content and Admission Form sections

### Supported Platforms
1. **Facebook** - Community engagement and updates
2. **Twitter/X** - Quick news and announcements
3. **Instagram** - Visual content and behind-the-scenes
4. **LinkedIn** - Professional networking
5. **YouTube** - Video content and tutorials
6. **WhatsApp** - Direct messaging and support
7. **Telegram** - Channel notifications and updates
8. **TikTok** - Short-form educational content

### Features
âœ… Responsive grid layout (8 columns on desktop, responsive on mobile)
âœ… Hover effects with color transitions
âœ… Tooltips showing platform names
âœ… Direct links to social profiles
âœ… Multilingual support (EN, AR, FA, PS)
âœ… RTL support for Arabic, Persian, Pashto
âœ… Beautiful icons from Lucide React

### Customization

**Update Social Links URLs**

Edit `components/SocialLinksSection.tsx`:
```typescript
const socialLinks: SocialLink[] = [
  {
    id: 'facebook',
    name: t.socialMedia.facebook,
    icon: <Facebook className="w-6 h-6" />,
    url: 'https://facebook.com/YOUR_PAGE_NAME',  // Update this URL
    color: 'hover:bg-blue-600'
  },
  // ... other platforms
];
```

**Add New Platform**

```typescript
{
  id: 'nextplatform',
  name: 'Platform Name',
  icon: <SomeIcon className="w-6 h-6" />,
  url: 'https://platform.com/youraccount',
  color: 'hover:bg-COLOR'
}
```

---

## 2. Charity Foundation Page

### Purpose
Create a dedicated page for the Mohammadi Foundation to promote charitable giving and community support.

### Component
- **File**: `pages/CharityFoundationPage.tsx`
- **Routes**: 
  - `/charity`
  - `/foundation`

### Page Sections

#### 2.1 Hero Section
- Eye-catching title: "Mohammadi Foundation"
- Tagline: "Supporting Islamic Education Worldwide"
- Call-to-action button to donation section

#### 2.2 Mission Statement
- Mission and vision text
- Impact statistics displayed in cards:
  - Total Students Supported: 15,000+
  - Teachers Trained: 500+
  - Communities Reached: 150+
  - Scholarships Given: 3,200+

#### 2.3 Our Impact Section
- Large visual display of key metrics
- Gradient background with prominent numbers

#### 2.4 Programs Section
Four core charitable programs:

1. **Scholarship Program**
   - Financial aid for deserving students
   - 2,500+ beneficiaries

2. **Community Outreach**
   - Free Quranic classes
   - 5,000+ beneficiaries

3. **Teacher Training**
   - Professional development
   - 150+ beneficiaries

4. **Research & Development**
   - Innovative methodologies
   - 50+ beneficiaries

#### 2.5 Donation Methods
Four donation options:
- **Bank Transfer** - Direct account transfer
- **Credit/Debit Card** - Secure online payment
- **Mobile Payment** - Quick digital payment
- **Cryptocurrency** - Blockchain donations

#### 2.6 Donation Form
Interactive form with:
- Full name field
- Email address field
- Donation amount (USD)
- Monthly donation option
- Submit button

#### 2.7 Contact Section
- Email for donations: `donations@mohammadiacademy.com`
- Phone number with WhatsApp link
- Zakat-eligible notice
- Tax deduction information

### Features
âœ… Comprehensive donation information
âœ… Multiple donation methods
âœ… Impact statistics and metrics
âœ… Program descriptions with beneficiary counts
âœ… Responsive design
âœ… Multilingual support (4 languages)
âœ… RTL compatibility
âœ… Call-to-action buttons throughout
âœ… Professional styling with gradients

### Customization

**Update Donation Contact Email**

Edit the contact section in `CharityFoundationPage.tsx`:
```typescript
<a href="mailto:YOUR_EMAIL@example.com">
  YOUR_EMAIL@example.com
</a>
```

**Update Bank Transfer Details**

Add bank details in the Donation Methods section:
```typescript
{
  id: 'bank',
  icon: <DollarSign className="w-12 h-12" />,
  name: t.charity.bank,
  description: 'Bank: XYZ Bank, Account: 123456789'
}
```

**Modify Programs**

Edit the `programs` array to add or modify charitable programs:
```typescript
{
  id: 'new-program',
  icon: <SomeIcon className="w-12 h-12" />,
  title: 'Program Name',
  description: 'Program description',
  beneficiaries: 1000
}
```

---

## 3. Sample Featured Content

### Purpose
Pre-populate the homepage with beautiful, professional sample featured content to showcase the features section functionality.

### Component
- **File**: `utils/sampleFeatures.ts`
- **Function**: `initializeSampleFeatures()`

### Sample Features Included

#### 1. Video: "How to Learn Tajweed Correctly"
- YouTube tutorial video
- 10M+ views quality video
- Description of Tajweed learning

#### 2. Image: "The Beauty of Quranic Verses"
- High-quality Islamic art image
- Unsplash image resource
- Artistic Quranic calligraphy

#### 3. Text: "Understanding the Quran: Surah Al-Fatiha"
- Educational article
- Explains the opening chapter
- Spiritual significance content

#### 4. Video: "Memorizing the Quran - Tips & Strategies"
- Professional tutorial video
- Covers memorization techniques
- Daily routine and revision tips

#### 5. Image: "Our Students Success Stories"
- Student testimonials image
- Certificate showcase
- Success metrics display

#### 6. Text: "Introduction to Islamic Ethics"
- Akhlaq (Islamic ethics) guide
- Virtue-based learning
- Daily application tips

### Features
âœ… 6 diverse sample features (2 videos, 2 images, 2 text)
âœ… Professional descriptions
âœ… Beautiful image resources from Unsplash
âœ… YouTube video links
âœ… Publish dates included
âœ… Ready-to-edit by admin

### Initialization

**Auto-Initialize on App Startup**

The sample features are automatically initialized in `HomePage.tsx`:

```typescript
useEffect(() => {
  document.documentElement.dir = t.dir;
  document.documentElement.lang = language;
  initializeSampleFeatures();  // Initializes only if no features exist
}, [language, t.dir]);
```

### Sample Data Functions

**Initialize Sample Features**
```typescript
import { initializeSampleFeatures } from '../utils/sampleFeatures';
initializeSampleFeatures();  // Only adds if storage is empty
```

**Reset to Sample Data**
```typescript
import { resetToSampleFeatures } from '../utils/sampleFeatures';
resetToSampleFeatures();  // Overwrites existing data
```

**Clear All Features**
```typescript
import { clearAllFeatures } from '../utils/sampleFeatures';
clearAllFeatures();  // Deletes all features
```

**Get Specific Sample Feature**
```typescript
import { getSampleFeatureById } from '../utils/sampleFeatures';
const feature = getSampleFeatureById('1');
```

---

## Integration Summary

### Routes Added
```
/charity - Charity Foundation Page
/foundation - Alias for /charity
```

### Components Created
1. `SocialLinksSection.tsx` - Social media display
2. `CharityFoundationPage.tsx` - Charity page
3. `sampleFeatures.ts` - Sample data utility

### HomePage Updates
- Added `<SocialLinksSection />` after Featured Content
- Added `initializeSampleFeatures()` to useEffect hook
- Added "Charity" link to navbar

### Translations Added
All translations added to `constants.ts` for 4 languages:
- **socialMedia** - 9 keys (platforms + subtitle)
- **charity** - 30+ keys (complete foundation information)

### Navigation Updates
- Added `/charity` route to App.tsx
- Added "Charity" link to main navigation

---

## Multilingual Support

All new features support 4 languages:
- **English** (en) - LTR
- **Arabic** (ar) - RTL
- **Persian/Farsi** (fa) - RTL
- **Pashto** (ps) - RTL

### Language Switching
The interface automatically adjusts:
- Text direction (LTR/RTL)
- Language content
- Number formatting
- Date formatting
- Button text

---

## Styling

### Color Scheme
- **Primary**: Blue/Cyan gradients
- **Red**: Used for "Donate Now" buttons
- **Backgrounds**: Slate 800-900 gradients
- **Hover States**: Color transitions

### Components
- Using Lucide React icons
- Tailwind CSS utility classes
- Responsive grid layouts
- Gradient backgrounds
- Hover effects and transitions

---

## Best Practices

### For Social Media Links
1. Keep URLs updated monthly
2. Monitor platform growth metrics
3. Track engagement from each platform
4. Add new platforms as needed
5. Update icon colors to match brand

### For Charity Page
1. Update impact statistics quarterly
2. Share success stories regularly
3. Highlight program achievements
4. Maintain secure donation links
5. Send thank-you emails to donors
6. Publish annual impact reports

### For Featured Content
1. Update sample features monthly
2. Feature recent student successes
3. Showcase teacher expertise
4. Promote new courses
5. Share Islamic wisdom
6. Keep content professionally designed

---

## Future Enhancements

### Social Media
- [ ] Embedded social feeds
- [ ] Social sharing buttons
- [ ] Live follower counts
- [ ] Instagram/TikTok feed integration
- [ ] Social media analytics

### Charity Foundation
- [ ] Payment gateway integration (Stripe, PayPal)
- [ ] Cryptocurrency payment processing
- [ ] Recurring donation management
- [ ] Tax receipt generation
- [ ] Donor dashboard
- [ ] Anonymous donation option
- [ ] Impact tracking for donors
- [ ] Monthly/yearly giving programs
- [ ] Gift/memorial donations
- [ ] Corporate sponsorship tracking

### Featured Content
- [ ] Content scheduling
- [ ] Admin approval workflow
- [ ] View/click analytics
- [ ] Content recommendations
- [ ] Trending features
- [ ] User comments and ratings
- [ ] Share to social media
- [ ] Content categories/tags
- [ ] Advanced search filters
- [ ] Content moderation

---

## Troubleshooting

### Social Links Not Appearing
- Check if `SocialLinksSection` is imported in HomePage
- Verify translations exist for language
- Check browser console for errors

### Charity Page Not Loading
- Ensure route `/charity` is added to App.tsx
- Check if `CharityFoundationPage.tsx` is properly imported
- Verify translations are complete

### Sample Features Not Showing
- Check localStorage is enabled
- Verify `initializeSampleFeatures()` is called
- Check browser dev tools â†’ Application â†’ LocalStorage

### RTL Text Not Displaying Properly
- Verify language is set to 'ar', 'fa', or 'ps'
- Check `document.documentElement.dir = t.dir` is executed
- Inspect element to confirm dir="rtl" attribute

---

## Support & Maintenance

For questions or issues:
1. Check this documentation
2. Review component source code
3. Check browser console for errors
4. Verify translations are loaded
5. Test with different languages
6. Clear cache and reload

---

## Translations Reference

### socialMedia Keys
- `socialMedia.title`
- `socialMedia.subtitle`
- `socialMedia.facebook`, `.twitter`, `.instagram`, `.linkedin`
- `socialMedia.youtube`, `.whatsapp`, `.telegram`, `.tiktok`
- `socialMedia.visitPage`

### charity Keys
- `charity.title`, `.subtitle`
- `charity.mission`, `.missionText`
- `charity.impact`, `.students`, `.teachers`, `.communities`, `.scholarships`
- `charity.donate`, `.donateNow`
- `charity.programs`, `.scholarship`, `.community`, `.teacher`, `.research`
- `charity.ways`, `.bank`, `.card`, `.mobile`, `.crypto`
- `charity.zakat`, `.tax`, `.monthly`, `.monthlyDesc`
- `charity.contactDonor`, `.email`, `.phone`
- `charity.thank`, `.thankYouMsg`


