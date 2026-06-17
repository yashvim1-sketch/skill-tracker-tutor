import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import TutorHomePage         from './pages/TutorHomePage';
import TutorStudentPage      from './pages/TutorStudentPage';
import TutorBookAnalysisPage from './pages/TutorBookAnalysisPage';

import './App.css';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root to tutor */}
        <Route path="/" element={<Navigate to="/tutor" replace />} />

        {/* Tutor app */}
        <Route path="/tutor"                                     element={<TutorHomePage />} />
        <Route path="/tutor/student/:studentId"                  element={<TutorStudentPage />} />
        <Route path="/tutor/student/:studentId/book/:bookId"     element={<TutorBookAnalysisPage />} />
      </Routes>
    </Router>
  );
}