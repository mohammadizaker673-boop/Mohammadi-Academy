import React from 'react';
import CourseModuleLandingPage from '../../components/course-modules/CourseModuleLandingPage';
import { quranTranslationCourseData } from '../../data/quranTranslationCourseData';

const QuranTranslationCoursePage: React.FC = () => {
  return <CourseModuleLandingPage course={quranTranslationCourseData} />;
};

export default QuranTranslationCoursePage;