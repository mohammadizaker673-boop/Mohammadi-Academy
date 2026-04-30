import React from 'react';
import CourseModulePlayer from '../../components/course-modules/CourseModulePlayer';
import { islamicStudiesCourseData } from '../../data/islamicStudiesCourseData';

const StudentIslamicStudiesPage: React.FC = () => {
  return <CourseModulePlayer course={islamicStudiesCourseData} />;
};

export default StudentIslamicStudiesPage;