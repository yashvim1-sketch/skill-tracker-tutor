import React, { useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { BOOKS } from '../constants/books';
import { getMotivationalText } from '../utils/scoreUtils';
import { useStudentData } from '../hooks/useStudentData';
import TutorBookCard from '../components/TutorBookCard';
import TutorSkillRatingModal from '../components/TutorSkillRatingModal';
import ProgressBar from '../components/ProgressBar';

export default function TutorStudentPage() {
  const { studentId } = useParams();
  const navigate      = useNavigate();
  const location      = useLocation();

  // Student name + context passed from TutorHomePage via navigate state
  const studentName = location.state?.studentName || studentId;
  const batchName   = location.state?.batchName   || '';
  const tutorId     = location.state?.tutorId     || '';

  const {
    loading, error,
    saveScores, getBookScore, completedCount,
    reload,
  } = useStudentData(studentId);

  const [selectedBook, setSelectedBook] = useState(null);
  const [toast,        setToast]        = useState('');

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleSelectBook  = useCallback(book => setSelectedBook(book), []);
  const handleModalClose  = useCallback(() => setSelectedBook(null), []);
  const handleModalSubmit = useCallback(() => {
    setSelectedBook(null);
    showToast('✅ Scores saved!');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalCount       = BOOKS.length;
  const progressValue    = totalCount > 0 ? completedCount / totalCount : 0;
  const motivationalText = getMotivationalText(completedCount, totalCount);
  const canViewOverall   = completedCount > 0;

  const ringColor = completedCount === totalCount
    ? '#22C55E'
    : completedCount > 0 ? '#F97316' : '#CBD5E1';

  return (
    <div className="page-fade home-page">
      {/* Back button */}
      <button className="back-btn" onClick={() => navigate('/tutor')}>
        ← Back to Students
      </button>

      {/* Student name header */}
      <div className="tutor-student-name-header">
        <span className="tutor-name-badge">👤</span>
        <h1 className="tutor-student-title">{studentName} — Skill Tracker</h1>
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

      {/* Loading state */}
      {loading && (
        <div className="tutor-no-results" style={{ marginTop: 32 }}>
          <span className="tutor-no-results-emoji">⏳</span>
          <p>Loading scores…</p>
        </div>
      )}

      {error && (
        <div className="tutor-no-results" style={{ marginTop: 32 }}>
          <span className="tutor-no-results-emoji">⚠️</span>
          <p>Could not load scores: {error}</p>
          <button className="btn-primary" onClick={reload} style={{ marginTop: 12 }}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
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
                  key={book.key}
                  studentId={studentId}
                  book={book}
                  scoreData={getBookScore(book.key)}
                  onSelect={handleSelectBook}
                />
              ))}
            </div>
          </section>

          {/* Overall CTA */}
          <div className="overall-cta">
            {canViewOverall ? (
              <button
                className="btn-primary btn-overall"
                onClick={() =>
                  navigate(`/tutor/student/${studentId}/overall`, {
                    state: { studentName, batchName, tutorId },
                  })
                }
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
        </>
      )}

      {/* Rating Modal */}
      {selectedBook && (
        <TutorSkillRatingModal
          studentId={studentId}
          tutorId={tutorId}
          batchName={batchName}
          book={selectedBook}
          existingScore={getBookScore(selectedBook.key)}
          saveScores={saveScores}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
        />
      )}

      {/* Toast */}
      {toast && <div className="tutor-toast">{toast}</div>}
    </div>
  );
}
