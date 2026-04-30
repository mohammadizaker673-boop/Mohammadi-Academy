import React from 'react';
import CourseModuleLandingPage from '../../components/course-modules/CourseModuleLandingPage';
import { islamicStudiesCourseData } from '../../data/islamicStudiesCourseData';

const IslamicStudiesCoursePage: React.FC = () => {
  return <CourseModuleLandingPage course={islamicStudiesCourseData} />;
};

export default IslamicStudiesCoursePage;