const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'constants.ts');
let content = fs.readFileSync(filePath, 'utf8');

// ═══════════════════════════════════════════════════
// ADD MISSING KEYS TO ALL 4 LANGUAGE BLOCKS
// ═══════════════════════════════════════════════════

// 1. Extend nav: add login, signUp, dashboard, logout, register, explore, startLearning, knowledgeStore, search
const navKeys = {
  en: "nav: { courses: 'Courses', pricing: 'Pricing', admission: 'Admission', enroll: 'Enroll Now', login: 'Login', signUp: 'Sign Up', dashboard: 'Dashboard', logout: 'Logout', register: 'Register', explore: 'Explore', exploreSubjects: 'Explore subjects', findPath: 'Find your learning path', viewAllCourses: 'View all courses', seeMore: 'See more', startLearning: 'Start Learning', knowledgeStore: 'Knowledge Store', searchPlaceholder: 'What do you want to learn? (e.g., Quran, Arabic)', quickResults: 'Quick Results for', viewAllResults: 'View all results for', courses_label: 'courses' }",
  ar: "nav: { courses: 'الدورات', pricing: 'الأسعار', admission: 'القبول', enroll: 'سجل الآن', login: 'تسجيل الدخول', signUp: 'إنشاء حساب', dashboard: 'لوحة التحكم', logout: 'تسجيل الخروج', register: 'التسجيل', explore: 'استكشف', exploreSubjects: 'استكشف المواد', findPath: 'ابحث عن مسارك التعليمي', viewAllCourses: 'عرض جميع الدورات', seeMore: 'المزيد', startLearning: 'ابدأ التعلم', knowledgeStore: 'متجر المعرفة', searchPlaceholder: 'ماذا تريد أن تتعلم؟ (مثل: القرآن، العربية)', quickResults: 'نتائج سريعة لـ', viewAllResults: 'عرض جميع النتائج لـ', courses_label: 'دورات' }",
  fa: "nav: { courses: 'دوره\\u200cها', pricing: 'هزینه\\u200cها', admission: 'پذیرش', enroll: 'ثبت نام کنید', login: 'ورود', signUp: 'ثبت نام', dashboard: 'داشبورد', logout: 'خروج', register: 'ثبت نام', explore: 'کاوش', exploreSubjects: 'کاوش موضوعات', findPath: 'مسیر یادگیری خود را بیابید', viewAllCourses: 'مشاهده همه دوره\\u200cها', seeMore: 'بیشتر', startLearning: 'شروع یادگیری', knowledgeStore: 'فروشگاه دانش', searchPlaceholder: 'چه می\\u200cخواهید یاد بگیرید؟ (مثلاً قرآن، عربی)', quickResults: 'نتایج سریع برای', viewAllResults: 'مشاهده همه نتایج برای', courses_label: 'دوره' }",
  ps: "nav: { courses: 'کورسونه', pricing: 'فیسونه', admission: 'شمولیت', enroll: 'اوس ثبت نام وکړئ', login: 'ننوتل', signUp: 'نوی حساب', dashboard: 'ډشبورډ', logout: 'وتل', register: 'ثبت نام', explore: 'پلټنه', exploreSubjects: 'موضوعات وپلټئ', findPath: 'خپل د زده کړې لاره ومومئ', viewAllCourses: 'ټول کورسونه وګورئ', seeMore: 'نور وګورئ', startLearning: 'زده کړه پیل کړئ', knowledgeStore: 'د پوهې پلورنځی', searchPlaceholder: 'تاسو څه زده کول غواړئ؟ (لکه: قرآن، عربي)', quickResults: 'ګړندي پایلې د', viewAllResults: 'ټولې پایلې وګورئ د', courses_label: 'کورسونه' }"
};

// Replace nav in each lang
for (const [lang, newNav] of Object.entries(navKeys)) {
  const oldNavRegex = new RegExp(`(${lang === 'en' ? "  en: \\{" : `  ${lang}: \\{`}[\\s\\S]*?)nav: \\{[^}]+\\}`);
  // simpler: just find the nav line for each language block
}

// Actually, let's do targeted replacements
// English nav
content = content.replace(
  "nav: { courses: 'Courses', pricing: 'Pricing', admission: 'Admission', enroll: 'Enroll Now' },\n    courses: {\n      title: 'What We Offer',",
  "nav: { courses: 'Courses', pricing: 'Pricing', admission: 'Admission', enroll: 'Enroll Now', login: 'Login', signUp: 'Sign Up', dashboard: 'Dashboard', logout: 'Logout', register: 'Register', explore: 'Explore', exploreSubjects: 'Explore subjects', findPath: 'Find your learning path', viewAllCourses: 'View all courses', seeMore: 'See more', startLearning: 'Start Learning', knowledgeStore: 'Knowledge Store', searchPlaceholder: 'What do you want to learn? (e.g., Quran, Arabic)', quickResults: 'Quick Results for', viewAllResults: 'View all results for', courses_label: 'courses' },\n    courses: {\n      title: 'What We Offer',"
);

// Arabic nav 
content = content.replace(
  "nav: { courses: 'الدورات', pricing: 'الأسعار', admission: 'القبول', enroll: 'سجل الآن' },\n    courses: {\n      title: 'ما نقدمه',",
  "nav: { courses: 'الدورات', pricing: 'الأسعار', admission: 'القبول', enroll: 'سجل الآن', login: 'تسجيل الدخول', signUp: 'إنشاء حساب', dashboard: 'لوحة التحكم', logout: 'تسجيل الخروج', register: 'التسجيل', explore: 'استكشف', exploreSubjects: 'استكشف المواد', findPath: 'ابحث عن مسارك التعليمي', viewAllCourses: 'عرض جميع الدورات', seeMore: 'المزيد', startLearning: 'ابدأ التعلم', knowledgeStore: 'متجر المعرفة', searchPlaceholder: 'ماذا تريد أن تتعلم؟ (مثل: القرآن، العربية)', quickResults: 'نتائج سريعة لـ', viewAllResults: 'عرض جميع النتائج لـ', courses_label: 'دورات' },\n    courses: {\n      title: 'ما نقدمه',"
);

// Farsi nav
content = content.replace(
  "nav: { courses: 'دوره\u200cها', pricing: 'هزینه\u200cها', admission: 'پذیرش', enroll: 'ثبت نام کنید' },\n    courses: {\n      title: 'آنچه ارائه می\u200cدهیم',",
  "nav: { courses: 'دوره\u200cها', pricing: 'هزینه\u200cها', admission: 'پذیرش', enroll: 'ثبت نام کنید', login: 'ورود', signUp: 'ثبت نام', dashboard: 'داشبورد', logout: 'خروج', register: 'ثبت نام', explore: 'کاوش', exploreSubjects: 'کاوش موضوعات', findPath: 'مسیر یادگیری خود را بیابید', viewAllCourses: 'مشاهده همه دوره\u200cها', seeMore: 'بیشتر', startLearning: 'شروع یادگیری', knowledgeStore: 'فروشگاه دانش', searchPlaceholder: 'چه می\u200cخواهید یاد بگیرید؟ (مثلاً قرآن، عربی)', quickResults: 'نتایج سریع برای', viewAllResults: 'مشاهده همه نتایج برای', courses_label: 'دوره' },\n    courses: {\n      title: 'آنچه ارائه می\u200cدهیم',"
);

// Pashto nav
content = content.replace(
  "nav: { courses: 'کورسونه', pricing: 'فیسونه', admission: 'شمولیت', enroll: 'اوس ثبت نام وکړئ' },\n    courses: {\n      title: 'موږ څه وړاندې کوو',",
  "nav: { courses: 'کورسونه', pricing: 'فیسونه', admission: 'شمولیت', enroll: 'اوس ثبت نام وکړئ', login: 'ننوتل', signUp: 'نوی حساب', dashboard: 'ډشبورډ', logout: 'وتل', register: 'ثبت نام', explore: 'پلټنه', exploreSubjects: 'موضوعات وپلټئ', findPath: 'خپل د زده کړې لاره ومومئ', viewAllCourses: 'ټول کورسونه وګورئ', seeMore: 'نور وګورئ', startLearning: 'زده کړه پیل کړئ', knowledgeStore: 'د پوهې پلورنځی', searchPlaceholder: 'تاسو څه زده کول غواړئ؟ (لکه: قرآن، عربي)', quickResults: 'ګړندي پایلې د', viewAllResults: 'ټولې پایلې وګورئ د', courses_label: 'کورسونه' },\n    courses: {\n      title: 'موږ څه وړاندې کوو',"
);

// 2. Extend pricing: add feature lists and register button
// English pricing
content = content.replace(
  "      popular: 'Most Popular',\n      choose: 'Choose Plan'\n    },\n    features: {",
  "      popular: 'Most Popular',\n      choose: 'Choose Plan',\n      register: 'Register',\n      basicFeatures: ['2 Classes Per Week', '30-Minute Sessions', 'Qualified Teacher'],\n      standardFeatures: ['3 Classes Per Week', '45-Minute Sessions', 'Certified Teacher', 'Progress Reports'],\n      premiumFeatures: ['5 Classes Per Week', '60-Minute Sessions', 'Expert Teacher', 'Weekly Reports', 'Priority Support']\n    },\n    features: {"
);

// Arabic pricing
content = content.replace(
  "      popular: 'الأكثر شعبية',\n      choose: 'اختر الخطة'\n    },\n    features: {",
  "      popular: 'الأكثر شعبية',\n      choose: 'اختر الخطة',\n      register: 'التسجيل',\n      basicFeatures: ['حصتان في الأسبوع', 'جلسات 30 دقيقة', 'معلم مؤهل'],\n      standardFeatures: ['3 حصص في الأسبوع', 'جلسات 45 دقيقة', 'معلم معتمد', 'تقارير التقدم'],\n      premiumFeatures: ['5 حصص في الأسبوع', 'جلسات 60 دقيقة', 'معلم خبير', 'تقارير أسبوعية', 'دعم ذو أولوية']\n    },\n    features: {"
);

// Farsi pricing
content = content.replace(
  "      popular: 'محبوب\u200cترین',\n      choose: 'انتخاب پلن'\n    },\n    features: {",
  "      popular: 'محبوب\u200cترین',\n      choose: 'انتخاب پلن',\n      register: 'ثبت نام',\n      basicFeatures: ['2 کلاس در هفته', 'جلسات 30 دقیقه\u200cای', 'معلم واجد شرایط'],\n      standardFeatures: ['3 کلاس در هفته', 'جلسات 45 دقیقه\u200cای', 'معلم معتبر', 'گزارش پیشرفت'],\n      premiumFeatures: ['5 کلاس در هفته', 'جلسات 60 دقیقه\u200cای', 'معلم متخصص', 'گزارش\u200cهای هفتگی', 'پشتیبانی اولویت\u200cدار']\n    },\n    features: {"
);

// Pashto pricing
content = content.replace(
  "      popular: 'ترټولو مشهوره',\n      choose: 'پلن غوره کړئ'\n    },\n    features: {",
  "      popular: 'ترټولو مشهوره',\n      choose: 'پلن غوره کړئ',\n      register: 'ثبت نام',\n      basicFeatures: ['په اونۍ کې 2 ټولګي', '30 دقیقې ناستې', 'وړ ښوونکی'],\n      standardFeatures: ['په اونۍ کې 3 ټولګي', '45 دقیقې ناستې', 'معتبر ښوونکی', 'د پرمختګ راپورونه'],\n      premiumFeatures: ['په اونۍ کې 5 ټولګي', '60 دقیقې ناستې', 'متخصص ښوونکی', 'اونیزې راپورونه', 'لومړیتوب ملاتړ']\n    },\n    features: {"
);

// 3. Add studentJourney section + explore categories + noorani + footer extras to each language
// We'll add these before the closing of each language block

// English: add before charity closing
const enNewSections = `    exploreCategories: {
      quran: 'Quran & Tajweed',
      islamicStudies: 'Islamic Studies',
      languages: 'Languages',
      ai: 'Artificial Intelligence',
      it: 'Information Technology',
      science: 'Science',
      generalKnowledge: 'General Knowledge',
      lifeSkills: 'Life Skills',
      digitalSkills: 'Digital Skills'
    },
    studentJourney: {
      label: 'Student Journey',
      title: 'A clear roadmap from first letters to certification',
      subtitle: 'Parents and students always know what comes next, how progress is measured, and when certification is earned.',
      steps: ['Beginner Foundations', 'Tajweed Mastery', 'Memorization Track', 'Tafsir & Meaning', 'Certification'],
      levels: [
        { label: 'Beginner', detail: 'Arabic letters, reading fluency' },
        { label: 'Intermediate', detail: 'Tajweed rules and practice' },
        { label: 'Advanced', detail: 'Memorization + Tafsir skills' }
      ],
      progressTracking: 'Progress Tracking',
      liveDashboard: 'Live dashboard for parents and students',
      liveDashboardDesc: 'Attendance, teacher feedback, memorization milestones, and monthly reports in one place.',
      certification: 'Certification',
      earnCertificates: 'Earn verified certificates',
      earnCertificatesDesc: 'Students receive certificates at key milestones and final completion.',
      startJourney: 'Start Journey'
    },
    noorani: {
      badge: 'NEW COURSE',
      title1: 'Master Quran & Prayer',
      title2: 'with Noorani Qaida',
      description: 'A comprehensive 3-section course with 19 interactive lessons, quizzes, and gamification. Perfect for beginners and advancing learners.',
      feature1Title: 'Arabic Alphabet & Tajweed (12 lessons)',
      feature1Desc: 'Learn Arabic letters, Quranic rules, and perfect recitation',
      feature2Title: 'Daily Prayer (Salah) Practice (7 lessons)',
      feature2Desc: 'Complete guide with video demonstrations and step-by-step instructions',
      feature3Title: 'Progress Tracking & Certificates',
      feature3Desc: 'Earn badges, maintain streaks, and get certified upon completion',
      exploreCourse: 'Explore Course',
      lessonsCount: '19 Lessons',
      completeEducation: 'Complete Islamic Education',
      sections: 'Sections',
      lessons: 'Lessons',
      free: 'Free'
    },
    footerExtra: {
      aboutUs: 'About Us',
      aboutDesc: 'Excellence in Quranic education for all ages',
      quickLinks: 'Quick Links',
      parentDashboard: 'Parent Dashboard',
      quranLink: 'Quran',
      contactUs: 'Contact Us',
      allRights: 'All rights reserved.'
    },`;

const arNewSections = `    exploreCategories: {
      quran: 'القرآن والتجويد',
      islamicStudies: 'الدراسات الإسلامية',
      languages: 'اللغات',
      ai: 'الذكاء الاصطناعي',
      it: 'تكنولوجيا المعلومات',
      science: 'العلوم',
      generalKnowledge: 'المعرفة العامة',
      lifeSkills: 'مهارات الحياة',
      digitalSkills: 'المهارات الرقمية'
    },
    studentJourney: {
      label: 'رحلة الطالب',
      title: 'خارطة طريق واضحة من الحروف الأولى إلى الشهادة',
      subtitle: 'أولياء الأمور والطلاب يعرفون دائماً ما سيأتي بعد ذلك، وكيف يُقاس التقدم، ومتى تُمنح الشهادة.',
      steps: ['الأسس للمبتدئين', 'إتقان التجويد', 'مسار الحفظ', 'التفسير والمعنى', 'الشهادة'],
      levels: [
        { label: 'مبتدئ', detail: 'الحروف العربية، طلاقة القراءة' },
        { label: 'متوسط', detail: 'قواعد التجويد والممارسة' },
        { label: 'متقدم', detail: 'الحفظ + مهارات التفسير' }
      ],
      progressTracking: 'تتبع التقدم',
      liveDashboard: 'لوحة تحكم مباشرة للآباء والطلاب',
      liveDashboardDesc: 'الحضور وملاحظات المعلم ومعالم الحفظ والتقارير الشهرية في مكان واحد.',
      certification: 'الشهادة',
      earnCertificates: 'احصل على شهادات معتمدة',
      earnCertificatesDesc: 'يحصل الطلاب على شهادات عند المعالم الرئيسية وعند الإتمام النهائي.',
      startJourney: 'ابدأ الرحلة'
    },
    noorani: {
      badge: 'دورة جديدة',
      title1: 'أتقن القرآن والصلاة',
      title2: 'مع القاعدة النورانية',
      description: 'دورة شاملة من 3 أقسام مع 19 درساً تفاعلياً واختبارات وتحفيز. مثالية للمبتدئين والمتقدمين.',
      feature1Title: 'الأبجدية العربية والتجويد (12 درساً)',
      feature1Desc: 'تعلم الحروف العربية وقواعد القرآن والتلاوة الصحيحة',
      feature2Title: 'ممارسة الصلاة اليومية (7 دروس)',
      feature2Desc: 'دليل كامل مع عروض فيديو وتعليمات خطوة بخطوة',
      feature3Title: 'تتبع التقدم والشهادات',
      feature3Desc: 'احصل على شارات وحافظ على سلاسل الإنجاز واحصل على شهادة عند الإتمام',
      exploreCourse: 'استكشف الدورة',
      lessonsCount: '19 درساً',
      completeEducation: 'تعليم إسلامي شامل',
      sections: 'أقسام',
      lessons: 'دروس',
      free: 'مجاني'
    },
    footerExtra: {
      aboutUs: 'من نحن',
      aboutDesc: 'التميز في التعليم القرآني لجميع الأعمار',
      quickLinks: 'روابط سريعة',
      parentDashboard: 'لوحة أولياء الأمور',
      quranLink: 'القرآن',
      contactUs: 'اتصل بنا',
      allRights: 'جميع الحقوق محفوظة.'
    },`;

const faNewSections = `    exploreCategories: {
      quran: 'قرآن و تجوید',
      islamicStudies: 'مطالعات اسلامی',
      languages: 'زبان\u200cها',
      ai: 'هوش مصنوعی',
      it: 'فناوری اطلاعات',
      science: 'علوم',
      generalKnowledge: 'دانش عمومی',
      lifeSkills: 'مهارت\u200cهای زندگی',
      digitalSkills: 'مهارت\u200cهای دیجیتال'
    },
    studentJourney: {
      label: 'سفر دانشجو',
      title: 'نقشه راه روشن از حروف اول تا گواهینامه',
      subtitle: 'والدین و دانشجویان همیشه می\u200cدانند مرحله بعدی چیست، پیشرفت چگونه سنجیده می\u200cشود و گواهینامه کی اعطا می\u200cشود.',
      steps: ['پایه\u200cهای مبتدی', 'تسلط بر تجوید', 'مسیر حفظ', 'تفسیر و معنا', 'گواهینامه'],
      levels: [
        { label: 'مبتدی', detail: 'حروف عربی، روانی خواندن' },
        { label: 'متوسط', detail: 'قوانین تجوید و تمرین' },
        { label: 'پیشرفته', detail: 'حفظ + مهارت\u200cهای تفسیری' }
      ],
      progressTracking: 'پیگیری پیشرفت',
      liveDashboard: 'داشبورد زنده برای والدین و دانشجویان',
      liveDashboardDesc: 'حضور، بازخورد معلم، نقاط عطف حفظ و گزارش\u200cهای ماهانه در یک جا.',
      certification: 'گواهینامه',
      earnCertificates: 'گواهینامه\u200cهای معتبر دریافت کنید',
      earnCertificatesDesc: 'دانشجویان در نقاط عطف کلیدی و اتمام نهایی گواهینامه دریافت می\u200cکنند.',
      startJourney: 'شروع سفر'
    },
    noorani: {
      badge: 'دوره جدید',
      title1: 'تسلط بر قرآن و نماز',
      title2: 'با قاعده نورانی',
      description: 'دوره جامع 3 بخشی با 19 درس تعاملی، آزمون و گیمیفیکیشن. عالی برای مبتدیان و پیشرفته\u200cها.',
      feature1Title: 'الفبای عربی و تجوید (12 درس)',
      feature1Desc: 'حروف عربی، قوانین قرآنی و تلاوت صحیح را بیاموزید',
      feature2Title: 'تمرین نماز روزانه (7 درس)',
      feature2Desc: 'راهنمای کامل با نمایش ویدیویی و دستورالعمل\u200cهای گام به گام',
      feature3Title: 'پیگیری پیشرفت و گواهینامه\u200cها',
      feature3Desc: 'نشان\u200cها کسب کنید، رکوردها حفظ کنید و پس از اتمام گواهینامه بگیرید',
      exploreCourse: 'کاوش دوره',
      lessonsCount: '19 درس',
      completeEducation: 'آموزش کامل اسلامی',
      sections: 'بخش\u200cها',
      lessons: 'درس\u200cها',
      free: 'رایگان'
    },
    footerExtra: {
      aboutUs: 'درباره ما',
      aboutDesc: 'برتری در آموزش قرآنی برای همه سنین',
      quickLinks: 'لینک\u200cهای سریع',
      parentDashboard: 'داشبورد والدین',
      quranLink: 'قرآن',
      contactUs: 'تماس با ما',
      allRights: 'تمامی حقوق محفوظ است.'
    },`;

const psNewSections = `    exploreCategories: {
      quran: 'قرآن او تجوید',
      islamicStudies: 'اسلامي مطالعات',
      languages: 'ژبې',
      ai: 'مصنوعي هوښیارتیا',
      it: 'معلوماتي ټکنالوجي',
      science: 'ساینس',
      generalKnowledge: 'عمومي پوهه',
      lifeSkills: 'د ژوند مهارتونه',
      digitalSkills: 'ډیجیټل مهارتونه'
    },
    studentJourney: {
      label: 'د زده کوونکي سفر',
      title: 'د لومړیو تورو څخه تر سند پورې روښانه نقشه',
      subtitle: 'والدین او زده کوونکي تل پوهیږي چې وروسته څه راځي، پرمختګ څنګه اندازه کیږي او سند کله ورکول کیږي.',
      steps: ['د پیل بنسټونه', 'د تجوید تسلط', 'د حفظ لاره', 'تفسیر او مانا', 'سند'],
      levels: [
        { label: 'پیل کوونکی', detail: 'عربي توري، د لوستلو روانۍ' },
        { label: 'منځنی', detail: 'د تجوید قواعد او تمرین' },
        { label: 'پرمختللی', detail: 'حفظ + تفسیري مهارتونه' }
      ],
      progressTracking: 'د پرمختګ تعقیب',
      liveDashboard: 'د والدینو او زده کوونکو لپاره ژوندۍ ډشبورډ',
      liveDashboardDesc: 'حاضري، د ښوونکي نظریات، د حفظ لویې لاسته راوړنې او میاشتنۍ راپورونه په یو ځای کې.',
      certification: 'سند',
      earnCertificates: 'تایید شوي سندونه ترلاسه کړئ',
      earnCertificatesDesc: 'زده کوونکي په مهمو پړاونو او وروستي بشپړیدو کې سندونه ترلاسه کوي.',
      startJourney: 'سفر پیل کړئ'
    },
    noorani: {
      badge: 'نوی کورس',
      title1: 'قرآن او لمونځ زده کړئ',
      title2: 'د نورانی قاعدې سره',
      description: 'د 3 برخو جامع کورس د 19 تعاملي درسونو، ازموینو او لوبو سره. د پیل کوونکو او پرمختللو لپاره مناسب.',
      feature1Title: 'عربي الفبا او تجوید (12 درسونه)',
      feature1Desc: 'عربي توري، قرآني قواعد او سمه تلاوت زده کړئ',
      feature2Title: 'ورځنی لمونځ تمرین (7 درسونه)',
      feature2Desc: 'د ویډیو نمایشونو او ګام په ګام لارښوونو سره بشپړ لارښود',
      feature3Title: 'د پرمختګ تعقیب او سندونه',
      feature3Desc: 'نښې ترلاسه کړئ، سلسلې وساتئ او د بشپړیدو وروسته سند ترلاسه کړئ',
      exploreCourse: 'کورس وپلټئ',
      lessonsCount: '19 درسونه',
      completeEducation: 'بشپړ اسلامي تعلیم',
      sections: 'برخې',
      lessons: 'درسونه',
      free: 'وړیا'
    },
    footerExtra: {
      aboutUs: 'زموږ په اړه',
      aboutDesc: 'د ټولو عمرونو لپاره د قرآني تعلیم برتري',
      quickLinks: 'ګړندي لینکونه',
      parentDashboard: 'د والدینو ډشبورډ',
      quranLink: 'قرآن',
      contactUs: 'موږ سره اړیکه',
      allRights: 'ټول حقوق خوندي دي.'
    },`;

// Insert new sections before charity in English
content = content.replace(
  "    charity: {\n      title: 'Mohammadi Foundation',",
  enNewSections + "\n    charity: {\n      title: 'Mohammadi Foundation',"
);

// Insert new sections before charity in Arabic
content = content.replace(
  "    charity: {\n      title: 'مؤسسة المحمدي',",
  arNewSections + "\n    charity: {\n      title: 'مؤسسة المحمدي',"
);

// Insert new sections before charity in Farsi
content = content.replace(
  "    charity: {\n      title: 'بنیاد محمدی',",
  faNewSections + "\n    charity: {\n      title: 'بنیاد محمدی',"
);

// Insert new sections before charity in Pashto
content = content.replace(
  "    charity: {\n      title: 'د محمدي بنسټ',",
  psNewSections + "\n    charity: {\n      title: 'د محمدي بنسټ',"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('All translation keys added successfully!');

// Verify
const verify = fs.readFileSync(filePath, 'utf8');
const checks = [
  'startLearning: \'Start Learning\'',
  'startLearning: \'ابدأ التعلم\'', 
  'startLearning: \'شروع یادگیری\'',
  'startLearning: \'زده کړه پیل کړئ\'',
  'studentJourney:',
  'exploreCategories:',
  'noorani:',
  'footerExtra:',
  'basicFeatures:',
  'register: \'Register\''
];
for (const check of checks) {
  if (!verify.includes(check)) {
    console.error('MISSING:', check);
  } else {
    console.log('OK:', check.substring(0, 40));
  }
}
