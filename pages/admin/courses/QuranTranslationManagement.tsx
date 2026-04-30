import React from 'react';
import CourseModuleManagement from '../../../components/course-modules/CourseModuleManagement';
import { quranTranslationCourseData } from '../../../data/quranTranslationCourseData';

const QuranTranslationManagement: React.FC = () => {
  return <CourseModuleManagement course={quranTranslationCourseData} />;
};

export default QuranTranslationManagement;