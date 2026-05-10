import React from 'react';
import NooraniLessonPlayer from '../../components/noorani/NooraniLessonPlayer';
import { nooraniQaidaCourseData } from '../../data/nooraniQaidaCourseData';

const StudentNooraniQaidaPage: React.FC = () => {
  return <NooraniLessonPlayer course={nooraniQaidaCourseData} />;
};

export default StudentNooraniQaidaPage;
