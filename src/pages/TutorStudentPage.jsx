import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BOOKS } from '../data/books';
import { STUDENTS } from '../data/students';
import { getTutorAllRatings, getTutorCompletedCount } from '../data/tutorStorage';
import { getMotivationalText } from '../utils/scoreUtils';
import TutorBookCard from '../components/TutorBookCard';
import TutorSkillRatingModal from '../components/TutorSkillRatingModal';
import ProgressBar from '../components/ProgressBar';

export default function TutorStudentPage() {
  const { studentId } = useParams();
  const navigate      = useNavigate();
  const [selectedBook, setSelectedBook] = useState(null);
  const [refreshKey,   setRefreshKey]   = useState(0);
  const [toast,        setToast]        = useState('');

  const student = STUDENTS.find(s => s.id === studentId);

  // ── All hooks must be declared before any early return ──
  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleSelectBook = useCallback(book => setSelectedBook(book), []);

  const handleModalClose = useCallback(() => {
    setSelectedBook(null);
    setRefreshKey(k => k + 1);
  }, []);

  const handleModalSubmit = useCallback(() => {
    setSelectedBook(null);
    setRefreshKey(k => k + 1);
    showToast('✅ Scores saved!');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUndoBook = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  if (!student) {
    return (
      <div className="page-fade error-page">
        <p>Student not found.</p>
        <button className="btn-primary" onClick={() => navigate('/tutor')}>← Back to Home</button>
      </div>
    );
  }

  const completedCount   = getTutorCompletedCount(studentId);
  const totalCount       = BOOKS.length;
  const progressValue    = totalCount > 0 ? completedCount / totalCount : 0;
  const motivationalText = getMotivationalText(completedCount, totalCount);
  const canViewOverall   = completedCount > 0;

  const ringColor = completedCount === totalCount
    ? '#22C55E'
    : completedCount > 0 ? '#F97316' : '#CBD5E1';

  return (
    <div className="page-fade home-page" key={refreshKey}>
      {/* Back button */}
      <button className="back-btn" onClick={() => navigate('/tutor')}>
        ← Back to Students
      </button>

      {/* Student name header */}
      <div className="tutor-student-name-header">
        <span className="tutor-name-badge">👤</span>
        <h1 className="tutor-student-title">{student.name} — Skill Tracker</h1>
      </div>

      {/* Hero Header */}
      <header className="home-header" style={{ paddingTop: 0 }}>
        <div className="home-header-gradient-strip" />
        <div className="home-header-inner">
          <div className="logo-text">
            <span className="logo-emoji">📚</span>
            <span className="logo-title">Skill Tracker</span>
          </div>
          <p className="home-subtitle">Tracking skills, confidence, and creativity 🌱</p>
        </div>
      </header>

      {/* Progress Section */}
      <section className="progress-section">
        <div className="progress-section-inner card">
          <ProgressBar
            value={progressValue}
            size={140}
            strokeWidth={13}
            color={ringColor}
            label={`${completedCount}/${totalCount}`}
          />
          <div className="progress-text-block">
            <p className="progress-count">
              <strong>{completedCount}</strong> of <strong>{totalCount}</strong> books completed
            </p>
            <p className="progress-motivation">{motivationalText}</p>
          </div>
        </div>
      </section>

      {/* Book Grid */}
      <section className="books-section">
        <h2 className="books-section-title">📚 Book Collection</h2>
        <div className="books-grid">
          {BOOKS.map(book => (
            <TutorBookCard
              key={book.id}
              studentId={studentId}
              book={book}
              onSelect={handleSelectBook}
              onUndo={handleUndoBook}
            />
          ))}
        </div>
      </section>

      {/* Overall CTA */}
      <div className="overall-cta">
        {canViewOverall ? (
          <button
            className="btn-primary btn-overall"
            onClick={() => navigate(`/tutor/student/${studentId}/overall`)}
          >
            View Overall Analysis →
          </button>
        ) : (
          <button className="btn-primary btn-overall btn-disabled" disabled>
            View Overall Analysis
            <span className="btn-disabled-hint">(complete a book first)</span>
          </button>
        )}
      </div>

      {/* Centered modal */}
      {selectedBook && (
        <TutorSkillRatingModal
          studentId={studentId}
          book={selectedBook}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
        />
      )}

      {/* Toast */}
      {toast && <div className="tutor-toast">{toast}</div>}
    </div>
  );
}
