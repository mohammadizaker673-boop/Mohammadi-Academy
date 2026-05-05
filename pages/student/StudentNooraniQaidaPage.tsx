import React from 'react';
import CourseModulePlayer from '../../components/course-modules/CourseModulePlayer';
import { nooraniQaidaCourseData } from '../../data/nooraniQaidaCourseData';

const StudentNooraniQaidaPage: React.FC = () => {
  return <CourseModulePlayer course={nooraniQaidaCourseData} />;
};

export default StudentNooraniQaidaPage;
