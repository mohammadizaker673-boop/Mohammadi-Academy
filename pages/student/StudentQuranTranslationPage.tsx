import React from 'react';
import CourseModulePlayer from '../../components/course-modules/CourseModulePlayer';
import { quranTranslationCourseData } from '../../data/quranTranslationCourseData';

const StudentQuranTranslationPage: React.FC = () => {
  return <CourseModulePlayer course={quranTranslationCourseData} />;
};

export default StudentQuranTranslationPage;