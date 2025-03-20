import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { StudyActivities } from './pages/StudyActivities';
import { StudyActivityDetail } from './pages/StudyActivityDetail';
import { StudyActivityLaunch } from './pages/StudyActivityLaunch';
import { StudySession } from './pages/StudySession';
import { Words } from './pages/Words';
import { WordGroups } from './pages/WordGroups';
import { Sessions } from './pages/Sessions';
import { Settings } from './pages/Settings';
import { Book, GraduationCap, LayoutGrid, Settings as SettingsIcon, Clock, FolderOpen } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
  { name: 'Study Activities', href: '/study-activities', icon: GraduationCap },
  { name: 'Words', href: '/words', icon: Book },
  { name: 'Word Groups', href: '/word-groups', icon: FolderOpen },
  { name: 'Sessions', href: '/sessions', icon: Clock },
  { name: 'Settings', href: '/settings', icon: SettingsIcon },
];

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<Layout navigation={navigation} />}>
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="/study-activities" element={<StudyActivities />} />
          <Route path="/study-activities/:id" element={<StudyActivityDetail />} />
          <Route path="/study-activities/:id/launch" element={<StudyActivityLaunch />} />
          <Route path="/words" element={<Words />} />
          <Route path="/word-groups" element={<WordGroups />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="/sessions/:sessionId" element={<StudySession />} />
      </Routes>
    </Router>
  );
}

export default App;