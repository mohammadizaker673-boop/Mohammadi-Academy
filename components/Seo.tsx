import React from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Per-page SEO for the Mohammadi Academy SPA.
 *
 * A client-rendered app serves the same index.html shell for every route,
 * so search engines only ever see one title and no description unless each
 * page sets its own tags when it mounts. This component does exactly that:
 * it writes document.title, the meta description, Open Graph / Twitter
 * tags and the canonical link for the current page.
 *
 * Usage:
 *   <Seo title="About Us" description="..." path="/about" />
 * or rely on <RouteSeo /> in App.tsx, which maps static public routes
 * to their title/description automatically.
 */

const SITE_URL = 'https://mohammadiacademy.org';
const SITE_NAME = 'Mohammadi Online Quran Academy';
const DEFAULT_IMAGE = 'https://raw.githubusercontent.com/mohammadizaker673-boop/Mohammadi-Academy/redesign/Photos/FullLogo.jpg';

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  const selector = `meta[${attr}="${key}"]`;
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export interface SeoProps {
  /** Page title without the site suffix — the suffix is added automatically. */
  title: string;
  description: string;
  /** Route path, e.g. "/about". Used for the canonical URL and og:url. */
  path?: string;
  /** og:type — "website" by default, "article" for article pages. */
  type?: 'website' | 'article';
  image?: string;
  /** True for private/app pages that must not be indexed. */
  noindex?: boolean;
}

export const Seo: React.FC<SeoProps> = ({
  title,
  description,
  path = '/',
  type = 'website',
  image = DEFAULT_IMAGE,
  noindex = false,
}) => {
  const canonical = `${SITE_URL}${path === '/' ? '/' : path}`;
  const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;

  React.useEffect(() => {
    document.title = fullTitle;
    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:url', canonical);
    upsertMeta('property', 'og:image', image);
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', image);
    upsertLink('canonical', canonical);
  }, [fullTitle, description, canonical, type, image, noindex]);

  return null;
};

/** SEO metadata for the public, indexable routes. */
export const ROUTE_SEO: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Mohammadi Online Quran Academy — Learn Quran, Tajweed, Arabic & Islamic Studies Online',
    description:
      'Live one-to-one Quran classes with qualified male and female teachers. Learn Quran reading, Tajweed, Hifz memorisation, Arabic and Islamic Studies online, for kids and adults.',
  },
  '/courses': {
    title: 'Quran & Islamic Courses',
    description:
      'Browse all courses at Mohammadi Online Quran Academy — Noorani Qaida, Quran Tajweed, Hifz memorisation, Quran translation, Arabic and Islamic Studies, taught live one-to-one.',
  },
  '/courses/noorani-qaida': {
    title: 'Noorani Qaida Course — Learn to Read the Quran',
    description:
      'Learn to read the Quran from the very basics with our Noorani Qaida course — Arabic letters, joining, harakat and fluency, taught live one-to-one for kids and adults.',
  },
  '/quran-tajweed': {
    title: 'Quran Tajweed Course — Recite the Quran Beautifully',
    description:
      'Master the rules of Tajweed with a qualified teacher and recite the Holy Quran correctly and beautifully. Live one-to-one Tajweed classes for all levels.',
  },
  '/quran-translation': {
    title: 'Quran Translation Course — Understand the Meaning of the Quran',
    description:
      'Understand what you recite. Word-by-word Quran translation and Tafseer essentials, taught live one-to-one in English, Arabic, Persian or Pashto.',
  },
  '/islamic-studies': {
    title: 'Islamic Studies Course — Aqeedah, Fiqh & Seerah',
    description:
      'Islamic Studies for children and adults — Aqeedah, Fiqh, Seerah of the Prophet ﷺ and Islamic manners, taught by qualified teachers online.',
  },
  '/learn-arabic': {
    title: 'Learn Arabic Online — Reading, Writing & Conversation',
    description:
      'Learn Arabic from beginner to advanced with a qualified teacher — reading, writing, grammar and conversation, live one-to-one online.',
  },
  '/hifz': {
    title: 'Hifz — Quran Memorisation Programme',
    description:
      'Memorise the Holy Quran with a structured Hifz programme: daily Sabaq, revision (Sabqi and Manzil) and a personal Hifz tracker, guided by a qualified Hafiz teacher.',
  },
  '/ai-tutor': {
    title: 'AI Quran Tutor — Practice & Learn with AI',
    description:
      'Practise Quran recitation, Tajweed and Arabic with your AI tutor — instant feedback, quizzes and personalised learning paths, any time of day.',
  },
  '/articles': {
    title: 'Articles — Quran, Tajweed & Islamic Knowledge',
    description:
      'Read articles on the Quran, Tajweed, Hifz, Arabic and Islamic Studies from Mohammadi Online Quran Academy.',
  },
  '/videos': {
    title: 'Videos & Reminders — Quran The Ultimate Truth | Mohammadi Academy',
    description:
      'Watch the latest Islamic reminders and lessons from our Facebook page, Quran The Ultimate Truth — short videos on Allah, the Quran, the Last Day and more.',
  },
  '/store': {
    title: 'Knowledge Store — Islamic Books & Learning Resources',
    description:
      'Islamic books and learning resources from the Mohammadi Academy knowledge store.',
  },
  '/about': {
    title: 'About Us — Mohammadi Online Quran Academy',
    description:
      'Mohammadi Online Quran Academy connects students worldwide with qualified, vetted Quran teachers for live one-to-one classes — Quran, Tajweed, Hifz, Arabic and Islamic Studies.',
  },
  '/faq': {
    title: 'Frequently Asked Questions',
    description:
      'Answers to common questions about Mohammadi Online Quran Academy — fees, class timings, teachers, trial lessons, Hifz, and how online Quran classes work.',
  },
  '/contact': {
    title: 'Contact Us',
    description:
      'Contact Mohammadi Online Quran Academy — book a free trial lesson, ask about fees and timings, or speak to our admissions team. Call or WhatsApp +93 79 646 4640.',
  },
  '/start': {
    title: 'Start Learning — Book Your Free Trial Lesson',
    description:
      'Start learning the Quran today. Book a free trial lesson with a qualified teacher at Mohammadi Online Quran Academy — no payment needed to try.',
  },
};

/**
 * Renders the right <Seo /> for the current public route.
 * Private/app routes (admin, teacher, student, login, dashboards) are
 * marked noindex so they never appear in search results.
 * Dynamic routes (/courses/:id, /articles/:id) get a generic title here;
 * the detail pages set their own specific title once their data loads.
 */
export const RouteSeo: React.FC = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith('/videos/')) return null; // detail page sets its own SEO

  const meta = ROUTE_SEO[pathname];
  if (meta) {
    return <Seo title={meta.title} description={meta.description} path={pathname} />;
  }

  if (pathname.startsWith('/courses/') || pathname.startsWith('/automated/')) {
    return (
      <Seo
        title="Quran Course"
        description="Learn the Quran live one-to-one with a qualified teacher at Mohammadi Online Quran Academy — Tajweed, Hifz, Noorani Qaida, Arabic and Islamic Studies."
        path={pathname}
      />
    );
  }
  if (pathname.startsWith('/articles/')) {
    return (
      <Seo
        title="Article"
        description="Read this article on the Quran, Tajweed, Hifz or Islamic Studies from Mohammadi Online Quran Academy."
        path={pathname}
        type="article"
      />
    );
  }
  if (pathname.startsWith('/store/')) {
    return (
      <Seo
        title="Knowledge Store"
        description="Islamic books and learning resources from the Mohammadi Academy knowledge store."
        path={pathname}
      />
    );
  }

  // Everything else (login, dashboards, admin, teacher, student, meetings)
  // is an app page, not content — keep it out of search results.
  return <Seo title={SITE_NAME} description="Mohammadi Online Quran Academy — learn Quran, Tajweed, Arabic and Islamic Studies online." path={pathname} noindex />;
};

export default Seo;
