import React from 'react';
import CourseModuleManagement from '../../../components/course-modules/CourseModuleManagement';
import { nooraniQaidaCourseData } from '../../../data/nooraniQaidaCourseData';

const NooraniQaidaManagement: React.FC = () => {
  return <CourseModuleManagement course={nooraniQaidaCourseData} />;
};

export default NooraniQaidaManagement;
