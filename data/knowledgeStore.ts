import { StoreCategory, StoreDownload, StoreProduct, StorePurchase, StoreTestimonial } from '../types/store.types';

const cover = (title: string, accent: string, secondary: string) => {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200">
    <defs>
      <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="${accent}" />
        <stop offset="1" stop-color="${secondary}" />
      </linearGradient>
    </defs>
    <rect width="900" height="1200" fill="url(#g)" />
    <rect x="70" y="90" width="760" height="1020" rx="48" fill="rgba(7,10,26,0.5)" />
    <text x="120" y="250" font-family="'Space Grotesk', Arial" font-size="42" fill="#E2E8F0" letter-spacing="2">Muhammadi Academy</text>
    <text x="120" y="420" font-family="'Fraunces', Georgia" font-size="72" fill="#FFFFFF">${title}</text>
    <text x="120" y="520" font-family="'Space Grotesk', Arial" font-size="28" fill="#CBD5F5" letter-spacing="4">Premium Knowledge Store</text>
    <rect x="120" y="620" width="260" height="6" fill="#FFFFFF" opacity="0.6" />
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const STORE_CATEGORIES: StoreCategory[] = [
  {
    id: 'islamic',
    name: 'Islamic Digital Products',
    description: 'Tajweed, Quranic guidance, and faith-building resources.',
    tagline: 'Rooted knowledge, beautifully packaged.'
  },
  {
    id: 'modern',
    name: 'Modern Skills Guides',
    description: 'Practical playbooks for today’s tools, workflows, and digital mastery.',
    tagline: 'Sharpen your edge in a weekend.'
  },
  {
    id: 'career',
    name: 'Career & Income Products',
    description: 'Career clarity, freelancing systems, and income-ready assets.',
    tagline: 'Turn skills into sustainable income.'
  },
  {
    id: 'global',
    name: 'Global Knowledge Resources',
    description: 'World-class learning aids, research digests, and global context.',
    tagline: 'Think wider, lead smarter.'
  }
];

export const STORE_PRODUCTS: StoreProduct[] = [
  {
    id: 'tajweed-mastery-companion',
    title: 'Tajweed Mastery Companion',
    shortDescription: 'Precision rules, articulation maps, and practice drills for fluent recitation.',
    description: 'A structured Tajweed companion built for students and teachers. Includes guided drills, makharij illustrations, and mastery checkpoints for consistent improvement.',
    categoryId: 'islamic',
    price: 14,
    type: 'pdf',
    coverImage: cover('Tajweed Mastery Companion', '#0EA5E9', '#1D4ED8'),
    fileName: 'tajweed-mastery-companion.pdf',
    fileSize: '24 MB',
    preview: 'Preview 8 pages, makharij charts, and exercise samples.',
    highlights: ['Makharij charts', 'Rule-by-rule checklist', 'Practice scheduler'],
    includes: ['110-page PDF', 'Printable drill sheets', 'Progress tracker'],
    isFeatured: true,
    isBestSeller: true,
    rating: 4.9,
    reviews: 184,
    relatedIds: ['seerah-strategy-audio', 'world-civilizations-atlas']
  },
  {
    id: 'seerah-strategy-audio',
    title: 'Seerah Strategy Audio Series',
    shortDescription: 'Daily listening series connecting prophetic leadership to modern life.',
    description: 'A reflective audio journey focused on leadership, resilience, and community building from the Seerah, paired with weekly action prompts.',
    categoryId: 'islamic',
    price: 19,
    type: 'audio',
    coverImage: cover('Seerah Strategy Audio Series', '#14B8A6', '#0F766E'),
    fileName: 'seerah-strategy-audio.zip',
    fileSize: '320 MB',
    preview: 'Sample 2 episodes and reflection guide.',
    highlights: ['12 themed sessions', 'Reflection prompts', 'Family listening pack'],
    includes: ['12 audio lessons', 'Reflection journal PDF', 'Study outline'],
    rating: 4.8,
    reviews: 96,
    relatedIds: ['tajweed-mastery-companion', 'halal-freelancing-kit']
  },
  {
    id: 'ai-productivity-playbook',
    title: 'AI Productivity Playbook',
    shortDescription: 'Step-by-step workflows to automate daily admin with AI tools.',
    description: 'A crisp guide to design smart prompts, automate repetitive work, and build AI workflows. Includes templates and weekly routines.',
    categoryId: 'modern',
    price: 22,
    type: 'pdf',
    coverImage: cover('AI Productivity Playbook', '#A855F7', '#4338CA'),
    fileName: 'ai-productivity-playbook.pdf',
    fileSize: '32 MB',
    preview: 'See the prompt library and automation map.',
    highlights: ['Prompt library', 'Automation map', 'Tool stack cheat-sheet'],
    includes: ['90-page PDF', 'Workflow templates', 'Weekly planner'],
    isFeatured: true,
    rating: 4.7,
    reviews: 142,
    relatedIds: ['nocode-automation-course', 'interview-mastery-audio']
  },
  {
    id: 'nocode-automation-course',
    title: 'No-Code Automation Sprint',
    shortDescription: 'Video lessons to build automations without writing code.',
    description: 'A compact video course focused on no-code tools, integration patterns, and deploy-ready workflows. Includes bonus checklist.',
    categoryId: 'modern',
    price: 39,
    type: 'video',
    coverImage: cover('No-Code Automation Sprint', '#F97316', '#C2410C'),
    fileName: 'nocode-automation-sprint.zip',
    fileSize: '1.2 GB',
    preview: 'Watch the first lesson and setup guide.',
    highlights: ['7 core workflows', 'Integrations map', 'Launch checklist'],
    includes: ['7 video lessons', 'Templates pack', 'Integration playbook'],
    isBestSeller: true,
    rating: 4.9,
    reviews: 211,
    relatedIds: ['ai-productivity-playbook', 'halal-freelancing-kit']
  },
  {
    id: 'halal-freelancing-kit',
    title: 'Halal Freelancing Starter Kit',
    shortDescription: 'Contracts, proposal templates, and client outreach scripts.',
    description: 'A bundle for ethically building freelance income. Includes proposal decks, contract clauses, and pricing calculators.',
    categoryId: 'career',
    price: 29,
    type: 'bundle',
    coverImage: cover('Halal Freelancing Starter Kit', '#22C55E', '#15803D'),
    fileName: 'halal-freelancing-starter-kit.zip',
    fileSize: '180 MB',
    preview: 'Preview the contract clauses and outreach scripts.',
    highlights: ['Client outreach scripts', 'Pricing calculator', 'Ethical checklist'],
    includes: ['Templates bundle', 'Client onboarding flow', 'Pricing worksheet'],
    isFeatured: true,
    rating: 4.8,
    reviews: 119,
    relatedIds: ['interview-mastery-audio', 'seerah-strategy-audio']
  },
  {
    id: 'interview-mastery-audio',
    title: 'Interview Mastery Audio Course',
    shortDescription: 'Audio-driven preparation for high-stakes interviews.',
    description: 'A guided audio course with mock interview frameworks, confidence drills, and negotiation scripts.',
    categoryId: 'career',
    price: 17,
    type: 'audio',
    coverImage: cover('Interview Mastery Audio Course', '#38BDF8', '#2563EB'),
    fileName: 'interview-mastery-audio.zip',
    fileSize: '260 MB',
    preview: 'Listen to the intro and mock session.',
    highlights: ['Mock interview scripts', 'Confidence drills', 'Negotiation prompts'],
    includes: ['10 audio lessons', 'Preparation checklist', 'Offer script'],
    rating: 4.6,
    reviews: 88,
    relatedIds: ['halal-freelancing-kit', 'ai-productivity-playbook']
  },
  {
    id: 'world-civilizations-atlas',
    title: 'World Civilizations Atlas',
    shortDescription: 'A visually rich guide to world history milestones.',
    description: 'A curated atlas mapping cultural milestones, key innovations, and geographic context for global history learners.',
    categoryId: 'global',
    price: 24,
    type: 'pdf',
    coverImage: cover('World Civilizations Atlas', '#6366F1', '#0EA5E9'),
    fileName: 'world-civilizations-atlas.pdf',
    fileSize: '48 MB',
    preview: 'Preview sample timelines and maps.',
    highlights: ['Timelines & maps', 'Quick fact pages', 'Study prompts'],
    includes: ['130-page PDF', 'Map pack', 'Study planner'],
    isBestSeller: true,
    rating: 4.7,
    reviews: 134,
    relatedIds: ['sustainable-living-field-guide', 'tajweed-mastery-companion']
  },
  {
    id: 'sustainable-living-field-guide',
    title: 'Sustainable Living Field Guide',
    shortDescription: 'Practical systems for water, energy, and community resilience.',
    description: 'A global-ready guide to sustainable routines with checklists, workshops, and implementation plans.',
    categoryId: 'global',
    price: 27,
    type: 'bundle',
    coverImage: cover('Sustainable Living Field Guide', '#0F766E', '#0EA5E9'),
    fileName: 'sustainable-living-field-guide.zip',
    fileSize: '210 MB',
    preview: 'Preview the resilience workshop worksheet.',
    highlights: ['Sustainability checklists', 'Workshop guides', 'Community plans'],
    includes: ['Toolkit PDF', 'Workshop slides', 'Action calendar'],
    rating: 4.6,
    reviews: 77,
    relatedIds: ['world-civilizations-atlas', 'halal-freelancing-kit']
  },
  {
    id: 'hifz-quran-complete-course',
    title: 'Complete Qur\'an Memorization (Hifz) Course',
    shortDescription: 'Master the 4-tier revision system, 5 memorization techniques, and sustainable long-term memory for complete Qur\'an mastery.',
    description: 'A comprehensive, professionally-designed Qur\'an memorization course combining authentic Islamic principles with modern cognitive science. 9 complete modules covering foundation, techniques, schedules, revision systems, psychology, and advanced strategies. Includes 90-day starter plan, 1-year roadmap, progress tracking templates, and lifetime maintenance guide.',
    categoryId: 'islamic',
    price: 49,
    type: 'pdf',
    coverImage: cover('Complete Qur\'an Memorization Course', '#22D3EE', '#1D4ED8'),
    fileName: 'hifz-quran-complete-course.pdf',
    fileSize: '8.4 MB',
    preview: 'Preview modules 1-2, 90-day plan, and tracking templates.',
    highlights: ['9 complete modules', '4-tier revision system', '5 memorization methods', '90-day starter plan', '1-year roadmap', 'Progress tracking templates'],
    includes: ['270+ page comprehensive guide', '90-day structured plan', 'Weekly/monthly assessment templates', 'Teacher evaluation checklist', 'Common mistakes guide', 'Lifetime maintenance strategy', 'Certificate template', 'Bonus: Hifz motivation guide'],
    isFeatured: true,
    isBestSeller: false,
    rating: 4.9,
    reviews: 42,
    relatedIds: ['tajweed-mastery-companion', 'seerah-strategy-audio']
  }
];

export const STORE_TESTIMONIALS: StoreTestimonial[] = [
  {
    id: 'testimonial-1',
    name: 'Amina Rahman',
    role: 'Community Instructor',
    quote: 'The Tajweed companion is the cleanest practice guide I have used. My students finally stay consistent.',
    productId: 'tajweed-mastery-companion'
  },
  {
    id: 'testimonial-2',
    name: 'Omar Siddiq',
    role: 'Automation Consultant',
    quote: 'No-Code Automation Sprint helped our team build workflows in days instead of weeks.',
    productId: 'nocode-automation-course'
  },
  {
    id: 'testimonial-3',
    name: 'Sara Noor',
    role: 'Career Coach',
    quote: 'The freelancing kit gave my clients everything they needed to pitch confidently.',
    productId: 'halal-freelancing-kit'
  }
];

export const STORE_PURCHASES: StorePurchase[] = [
  { id: 'purchase-1', productId: 'tajweed-mastery-companion', date: '2026-02-08', amount: 14, status: 'paid' },
  { id: 'purchase-2', productId: 'ai-productivity-playbook', date: '2026-02-11', amount: 22, status: 'paid' },
  { id: 'purchase-3', productId: 'halal-freelancing-kit', date: '2026-02-12', amount: 29, status: 'paid' }
];

export const STORE_DOWNLOADS: StoreDownload[] = [
  { id: 'download-1', productId: 'tajweed-mastery-companion', date: '2026-02-08', status: 'available' },
  { id: 'download-2', productId: 'ai-productivity-playbook', date: '2026-02-11', status: 'available' },
  { id: 'download-3', productId: 'halal-freelancing-kit', date: '2026-02-12', status: 'available' }
];
