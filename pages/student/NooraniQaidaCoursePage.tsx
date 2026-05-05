import React from 'react';
import CourseModuleLandingPage from '../../components/course-modules/CourseModuleLandingPage';
import { nooraniQaidaCourseData } from '../../data/nooraniQaidaCourseData';

const NooraniQaidaCoursePage: React.FC = () => {
  return <CourseModuleLandingPage course={nooraniQaidaCourseData} />;
};

export default NooraniQaidaCoursePage;
