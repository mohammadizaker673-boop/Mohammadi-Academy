import React from 'react';
import CourseModuleManagement from '../../../components/course-modules/CourseModuleManagement';
import { islamicStudiesCourseData } from '../../../data/islamicStudiesCourseData';

const IslamicStudiesManagement: React.FC = () => {
  return <CourseModuleManagement course={islamicStudiesCourseData} />;
};

export default IslamicStudiesManagement;