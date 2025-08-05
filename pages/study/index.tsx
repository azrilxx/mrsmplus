import React, { useState } from 'react';
import StudyLauncher from '../../components/StudyLauncher';
import StudySession from './[subject]';

const StudyModePage: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const handleLaunchStudy = (subject: string) => {
    setSelectedSubject(subject);
  };

  const handleBackToLauncher = () => {
    setSelectedSubject(null);
  };

  if (selectedSubject) {
    return <StudySession subject={selectedSubject} onBack={handleBackToLauncher} />;
  }

  return <StudyLauncher onLaunchStudy={handleLaunchStudy} />;
};

export default StudyModePage;