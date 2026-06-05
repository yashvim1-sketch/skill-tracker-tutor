import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { BOOKS } from '../constants/books';
import { SKILLS, SCORE_COLORS } from '../data/books';
import { useStudentData } from '../hooks/useStudentData';
import { scoreColorKey } from '../utils/scoreUtils';
import BookAnalysis from '../components/BookAnalysis';
import TutorSkillRatingModal from '../components/TutorSkillRatingModal';

export default function TutorBookAnalysisPage() {
  const { studentId, bookId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const studentName = location.state?.studentName || studentId;
  const batchName   = location.state?.batchName   || '';
  const tutorId     = location.state?.tutorId     || '';

  const [showModal,  setShowModal]  = useState(false);
  const [toast,      setToast]      = useState('');

  const { getBookScore, saveScores, loading } = useStudentData(studentId);

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // Find book from constants/books (has key, visual data, etc.)
  const book = BOOKS.find(b => b.key === bookId);

  // Raw scores from API
  const rawScores = getBookScore(bookId);

  if (loading) {
    return (
      <div className="page-fade error-page">
        <p>⏳ Loading scores…</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="page-fade error-page">
        <p>Book not found.</p>
        <button className="btn-primary" onClick={() => navigate('/tutor')}>← Back</button>
      </div>
    );
  }

  if (!rawScores) {
    return (
      <div className="page-fade error-page">
        <p>No scores found for <strong>{book.title}</strong> yet.</p>
        <button
          className="btn-primary"
          onClick={() =>
            navigate(`/tutor/student/${studentId}`, {
              state: { studentName, batchName, tutorId },
            })
          }
        >
          ← Back to {studentName}
        </button>
      </div>
    );
  }

  // Build ratingData in the shape BookAnalysis expects
  const ratings = {};
  SKILLS.forEach(s => { ratings[s.id] = rawScores[s.id] || 0; });
  const vals = SKILLS.map(s => ratings[s.id]);
  const averageScore = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100;
  const ratingData   = { bookId, ratings, averageScore, completedAt: rawScores.updatedAt };

  const avgKey = scoreColorKey(averageScore);
  const avgSc  = SCORE_COLORS[avgKey];

  return (
    <div className="page-fade book-analysis-page">
      <button
        className="back-btn"
        onClick={() =>
          navigate(`/tutor/student/${studentId}`, {
            state: { studentName, batchName, tutorId },
          })
        }
      >
        ← Back to {studentName}
      </button>

      {/* Book hero strip */}
      <div className="book-hero-strip" style={{ background: book.bgGradient }}>
        <span className="book-hero-emoji">{book.emoji || '📖'}</span>
        <div className="book-hero-text">
          <h2 className="book-hero-name">{book.title}</h2>
          <p className="book-hero-scientist">{book.author}</p>
        </div>
        <span
          className="avg-badge avg-badge-hero"
          style={{ background: avgSc.bg, color: avgSc.text, border: `1.5px solid ${avgSc.border}` }}
        >
          Avg: {averageScore.toFixed(1)} / 4
        </span>
      </div>

      <div className="page-inner">
        <BookAnalysis book={book} ratingData={ratingData} />

        <div className="analysis-action-row">
          <button className="btn-secondary" onClick={() => setShowModal(true)}>
            ✏️ Update Scores
          </button>
          <button
            className="btn-primary"
            style={{ background: book.bgGradient }}
            onClick={() =>
              navigate(`/tutor/student/${studentId}/overall`, {
                state: { studentName, batchName, tutorId },
              })
            }
          >
            Continue to Overall Analysis →
          </button>
        </div>
      </div>

      {showModal && (
        <TutorSkillRatingModal
          studentId={studentId}
          tutorId={tutorId}
          batchName={batchName}
          book={book}
          existingScore={rawScores}
          saveScores={saveScores}
          onClose={() => setShowModal(false)}
          onSubmit={() => {
            setShowModal(false);
            showToast('✅ Scores updated!');
          }}
        />
      )}

      {toast && <div className="tutor-toast">{toast}</div>}
    </div>
  );
}
