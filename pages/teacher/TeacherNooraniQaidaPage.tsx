import React from 'react';
import CourseModulePlayer from '../../components/course-modules/CourseModulePlayer';
import { nooraniQaidaCourseData } from '../../data/nooraniQaidaCourseData';

const TeacherNooraniQaidaPage: React.FC = () => {
  return <CourseModulePlayer course={nooraniQaidaCourseData} />;
};

export default TeacherNooraniQaidaPage;
