import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BOOKS, SKILLS, SCORE_COLORS } from '../data/books';
import { STUDENTS } from '../data/students';
import { getTutorBookScores } from '../data/tutorStorage';
import { scoreColorKey } from '../utils/scoreUtils';
import BookAnalysis from '../components/BookAnalysis';
import TutorSkillRatingModal from '../components/TutorSkillRatingModal';

export default function TutorBookAnalysisPage() {
  const { studentId, bookId } = useParams();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState('');

  const student    = STUDENTS.find(s => s.id === studentId);
  const book       = BOOKS.find(b => b.id === bookId);
  const rawScores  = getTutorBookScores(studentId, bookId);

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  if (!student || !book) {
    return (
      <div className="page-fade error-page">
        <p>Not found.</p>
        <button className="btn-primary" onClick={() => navigate('/tutor')}>← Back</button>
      </div>
    );
  }

  if (!rawScores) {
    return (
      <div className="page-fade error-page">
        <p>No scores found for <strong>{book.name}</strong> yet.</p>
        <button className="btn-primary" onClick={() => navigate(`/tutor/student/${studentId}`)}>
          ← Back to {student.name}
        </button>
      </div>
    );
  }

  // Build ratingData in the same shape BookAnalysis expects
  const ratings = {};
  SKILLS.forEach(s => { ratings[s.id] = rawScores[s.id] || 0; });
  const vals = SKILLS.map(s => ratings[s.id]);
  const averageScore = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100;
  const ratingData = { bookId, ratings, averageScore, completedAt: rawScores.savedAt };

  const avgKey = scoreColorKey(averageScore);
  const avgSc  = SCORE_COLORS[avgKey];

  const handleUpdateClose = () => {
    setShowModal(false);
    setRefreshKey(k => k + 1);
  };

  const handleUpdateSubmit = () => {
    setShowModal(false);
    setRefreshKey(k => k + 1);
    showToast('✅ Scores updated!');
  };

  return (
    <div className="page-fade book-analysis-page" key={refreshKey}>
      <button className="back-btn" onClick={() => navigate(`/tutor/student/${studentId}`)}>
        ← Back to {student.name}
      </button>

      {/* Book hero strip */}
      <div className="book-hero-strip" style={{ background: book.bgGradient }}>
        <span className="book-hero-emoji">{book.emoji}</span>
        <div className="book-hero-text">
          <h2 className="book-hero-name">{book.name}</h2>
          <p className="book-hero-scientist">{book.scientist}</p>
        </div>
        <span
          className="avg-badge avg-badge-hero"
          style={{ background: avgSc.bg, color: avgSc.text, border: `1.5px solid ${avgSc.border}` }}
        >
          Avg: {averageScore.toFixed(1)} / 4
        </span>
      </div>

      {/* Analysis — exact same component as student app */}
      <div className="page-inner">
        <BookAnalysis book={book} ratingData={ratingData} />

        <div className="analysis-action-row">
          <button className="btn-secondary" onClick={() => setShowModal(true)}>
            ✏️ Update Scores
          </button>
          <button
            className="btn-primary"
            style={{ background: book.bgGradient }}
            onClick={() => navigate(`/tutor/student/${studentId}/overall`)}
          >
            Continue to Overall Analysis →
          </button>
        </div>
      </div>

      {showModal && (
        <TutorSkillRatingModal
          studentId={studentId}
          book={book}
          onClose={handleUpdateClose}
          onSubmit={handleUpdateSubmit}
        />
      )}

      {toast && <div className="tutor-toast">{toast}</div>}
    </div>
  );
}
