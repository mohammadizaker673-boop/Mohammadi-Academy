import { CourseModuleLesson, CourseModuleLessonResource } from '../types/dedicated-course.types';

const toResourceId = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const getMaterialType = (title: string) => {
  const value = title.toLowerCase();

  if (value.includes('worksheet')) return 'Worksheet';
  if (value.includes('journal')) return 'Journal';
  if (value.includes('checklist')) return 'Checklist';
  if (value.includes('planner') || value.includes('plan')) return 'Planner';
  if (value.includes('tracker')) return 'Tracker';
  if (value.includes('guide') || value.includes('handbook')) return 'Guide';
  if (value.includes('notes')) return 'Study Notes';
  if (value.includes('chart') || value.includes('map')) return 'Reference';
  if (value.includes('card')) return 'Quick Card';
  if (value.includes('prompt')) return 'Discussion Prompt';
  if (value.includes('template')) return 'Template';
  if (value.includes('pdf')) return 'Lesson Pack';
  if (value.includes('breakdown')) return 'Breakdown';

  return 'Lesson Material';
};

const getMaterialDescription = (title: string, lesson: CourseModuleLesson) => {
  const type = getMaterialType(title);
  const firstObjective = lesson.objectives[0] || `review ${lesson.title}`;

  switch (type) {
    case 'Worksheet':
      return `A guided written activity pack for ${lesson.title}, designed to help students practice and apply ${firstObjective.toLowerCase()}.`;
    case 'Journal':
      return `A structured reflection resource for ${lesson.title} so students can capture insight, questions, and personal action points after studying the lesson.`;
    case 'Checklist':
      return `A practical checklist that turns ${lesson.title} into repeatable habits, review steps, and self-correction points.`;
    case 'Planner':
      return `A planning aid for ${lesson.title} that helps students schedule practice, follow-up review, and daily application.`;
    case 'Tracker':
      return `A tracking sheet for ${lesson.title} so students can monitor consistency, confidence, and progress over time.`;
    case 'Guide':
      return `A teacher-style companion guide for ${lesson.title} with explanations, recap points, and a clearer study path for the lesson.`;
    case 'Study Notes':
      return `Condensed notes for ${lesson.title} so learners can revisit the lesson without rereading every section.`;
    case 'Reference':
      return `A quick-reference aid for ${lesson.title} that organizes definitions, themes, and comparisons in a review-friendly format.`;
    case 'Quick Card':
      return `A portable reminder card for ${lesson.title} that students can use during revision, family review, or short recap sessions.`;
    case 'Discussion Prompt':
      return `A prompt set for ${lesson.title} that helps learners discuss the lesson with a parent, teacher, spouse, or study partner.`;
    case 'Template':
      return `A reusable template for ${lesson.title} that helps students organize notes, action steps, and lesson follow-through.`;
    case 'Breakdown':
      return `A step-by-step breakdown for ${lesson.title} that makes the lesson easier to review in smaller parts.`;
    case 'Lesson Pack':
      return `A compiled lesson pack for ${lesson.title} with the main takeaways, revision prompts, and supporting review material in one place.`;
    default:
      return `A structured resource pack for ${lesson.title} to support lesson review, understanding, and accessible revision.`;
  }
};

const getMaterialIncludedItems = (title: string, lesson: CourseModuleLesson) => {
  const type = getMaterialType(title);
  const blockTitles = lesson.blocks
    .map((block) => block.title)
    .filter((value): value is string => Boolean(value))
    .slice(0, 2);
  const firstObjective = lesson.objectives[0] || `Review ${lesson.title}`;

  const defaults = [
    `Key recap points from ${lesson.title}`,
    `Practice support tied to: ${firstObjective}`,
    lesson.keyPoints[0] || 'Review prompts for independent study'
  ];

  switch (type) {
    case 'Worksheet':
      return [
        `Written exercises based on ${lesson.title}`,
        'Short-answer review prompts and recap questions',
        'Space for guided self-correction and revision'
      ];
    case 'Journal':
      return [
        'Reflection prompts after lesson study',
        'Personal action notes and habit tracking',
        'Space to record questions for teacher follow-up'
      ];
    case 'Checklist':
      return [
        'Step-by-step implementation points',
        'Consistency review prompts for the week',
        'Self-audit reminders before moving on'
      ];
    case 'Planner':
      return [
        'Weekly review schedule for the lesson topic',
        'Practice targets and follow-up reminders',
        'Time-blocks for revision or family discussion'
      ];
    case 'Tracker':
      return [
        'Progress logs for repeated review',
        'Confidence checks on core concepts',
        'Milestone boxes for practice consistency'
      ];
    case 'Guide':
      return [
        `Explained walkthrough of ${lesson.title}`,
        blockTitles[0] ? `Focused review on: ${blockTitles[0]}` : 'Lesson structure recap',
        'Common mistakes and correction notes'
      ];
    case 'Reference':
      return [
        'Key terms and concept comparisons',
        blockTitles[1] ? `Quick lookup section for: ${blockTitles[1]}` : 'Theme-by-theme reference points',
        'Fast revision support without rereading the full lesson'
      ];
    case 'Discussion Prompt':
      return [
        'Family or study-circle discussion starters',
        'Personal application questions',
        'Prompted reflection for accountability'
      ];
    default:
      return defaults;
  }
};

const normalizeResource = (resource: CourseModuleLessonResource, lesson: CourseModuleLesson, optional = false): CourseModuleLessonResource => ({
  ...resource,
  id: resource.id || toResourceId(resource.title),
  type: resource.type || getMaterialType(resource.title),
  description: resource.description || getMaterialDescription(resource.title, lesson),
  includedItems: resource.includedItems?.length ? resource.includedItems : getMaterialIncludedItems(resource.title, lesson),
  isOptional: optional || resource.isOptional || false
});

export const resolveLessonResources = (lesson: CourseModuleLesson): CourseModuleLessonResource[] => {
  const explicitResources = (lesson.resources || []).map((resource) => normalizeResource(resource, lesson));

  const explicitTitles = new Set(explicitResources.map((resource) => resource.title.toLowerCase()));
  const derivedResources = lesson.materials
    .filter((title) => !explicitTitles.has(title.toLowerCase()))
    .map((title) => normalizeResource({
      id: toResourceId(title),
      title,
      type: getMaterialType(title),
      description: getMaterialDescription(title, lesson),
      includedItems: getMaterialIncludedItems(title, lesson)
    }, lesson));

  return [...explicitResources, ...derivedResources];
};

export const resolveOptionalLessonResources = (lesson: CourseModuleLesson): CourseModuleLessonResource[] => {
  if (lesson.optionalResources?.length) {
    return lesson.optionalResources.map((resource) => normalizeResource(resource, lesson, true));
  }

  const hasArabicContent = lesson.blocks.some((block) => Boolean(block.arabicText));

  return [
    normalizeResource({
      id: `${lesson.id}-extension-review-circle`,
      title: 'Optional Review Circle',
      type: 'Extension',
      description: `An optional guided discussion path for ${lesson.title} that can be used with a teacher, parent, or study partner after the main lesson is complete.`,
      includedItems: [
        `Three discussion prompts based on ${lesson.title}`,
        'Short recap questions for oral review',
        'A reflection point to connect the lesson to daily practice'
      ],
      isOptional: true
    }, lesson, true),
    normalizeResource({
      id: `${lesson.id}-extension-home-practice`,
      title: hasArabicContent ? 'Optional Audio and Recitation Practice' : 'Optional Home Practice Challenge',
      type: hasArabicContent ? 'Supplementary Practice' : 'Home Practice',
      description: hasArabicContent
        ? `An optional listening and repetition extension for ${lesson.title} so students can reinforce Arabic wording, recitation, or memorization without making it a required checkpoint.`
        : `An optional at-home practice extension for ${lesson.title} so learners can deepen the lesson on their own schedule.` ,
      includedItems: hasArabicContent
        ? [
            'Repeat-after-teacher or self-recorded audio practice',
            'Targeted revision on lesson phrases or wording',
            'Independent repetition without affecting lesson completion'
          ]
        : [
            'A simple practice task outside formal study time',
            'One reflection or action step for the week',
            'Optional follow-through that does not block progress'
          ],
      isOptional: true
    }, lesson, true)
  ];
};

export const getLessonOutlineItems = (lesson: CourseModuleLesson) => lesson.blocks.map((block, index) => ({
  id: `${lesson.id}-outline-${index}`,
  title: block.title || `${block.type.charAt(0).toUpperCase()}${block.type.slice(1)} block`,
  summary: block.content || block.caption || block.items?.slice(0, 2).join(' • ') || 'Focused lesson guidance for this section.'
}));