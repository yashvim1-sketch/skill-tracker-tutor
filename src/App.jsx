import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

// Student app (original — unchanged)
import HomePage           from './pages/HomePage';
import BookAnalysisPage   from './pages/BookAnalysisPage';
import OverallPage        from './pages/OverallPage';

// Tutor app
import TutorHomePage         from './pages/TutorHomePage';
import TutorStudentPage      from './pages/TutorStudentPage';
import TutorBookAnalysisPage from './pages/TutorBookAnalysisPage';
import TutorOverallPage      from './pages/TutorOverallPage';

import './App.css';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* ── Student app (original) ── */}
        <Route path="/"               element={<HomePage />} />
        <Route path="/book/:bookId"   element={<BookAnalysisPage />} />
        <Route path="/overall"        element={<OverallPage />} />

        {/* ── Tutor app ── */}
        <Route path="/tutor"                                         element={<TutorHomePage />} />
        <Route path="/tutor/student/:studentId"                      element={<TutorStudentPage />} />
        <Route path="/tutor/student/:studentId/book/:bookId"         element={<TutorBookAnalysisPage />} />
        <Route path="/tutor/student/:studentId/overall"              element={<TutorOverallPage />} />
      </Routes>
    </Router>
  );
}
