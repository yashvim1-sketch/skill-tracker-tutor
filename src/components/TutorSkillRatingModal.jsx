import React, { useState, useEffect } from 'react';
import { SKILLS, RATING_COLORS } from '../data/books';
import { getTutorBookScores, saveTutorBookScores } from '../data/tutorStorage';
import SkillLegend from './SkillLegend';

/**
 * Centered modal (position:fixed) for tutor score entry.
 * Props: studentId, book, onClose, onSubmit
 */
export default function TutorSkillRatingModal({ studentId, book, onClose, onSubmit }) {
  const [ratings,        setRatings]        = useState({});
  const [tooltipVisible, setTooltipVisible] = useState(null);
  const [isVisible,      setIsVisible]      = useState(false);

  useEffect(() => {
    const existing = getTutorBookScores(studentId, book.id);
    if (existing) {
      const loaded = {};
      SKILLS.forEach(s => { if (existing[s.id]) loaded[s.id] = existing[s.id]; });
      setRatings(loaded);
    }
    setTimeout(() => setIsVisible(true), 10);
  }, [studentId, book.id]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 280);
  };

  const handleSelect = (skillId, value) => {
    setRatings(prev => ({ ...prev, [skillId]: value }));
  };

  const allRated = SKILLS.every(s => ratings[s.id] !== undefined);

  const handleSubmit = () => {
    if (!allRated) return;
    const saved = saveTutorBookScores(studentId, book.id, ratings);
    setIsVisible(false);
    setTimeout(() => onSubmit(book, saved), 280);
  };

  const existingData = getTutorBookScores(studentId, book.id);

  return (
    <div
      className="tutor-modal-overlay"
      style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.28s ease' }}
      onClick={e => e.target === e.currentTarget && handleClose()}
      role="dialog"
      aria-modal="true"
      aria-label={`Rate skills for ${book.name}`}
    >
      <div
        className="tutor-modal-sheet"
        style={{
          transform: isVisible ? 'scale(1)' : 'scale(0.92)',
          transition: 'transform 0.28s cubic-bezier(0.34, 1.26, 0.64, 1)',
        }}
      >
        {/* Header */}
        <div className="modal-header" style={{ background: book.bgGradient }}>
          <div className="modal-header-left">
            <span className="modal-book-emoji">{book.emoji}</span>
            <div>
              <h2 className="modal-book-name">{book.name}</h2>
              <p className="modal-subtitle">Rate skills for this book</p>
            </div>
          </div>
          <button
            className="modal-close-btn"
            onClick={handleClose}
            aria-label="Close modal"
          >✕</button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {SKILLS.map(skill => {
            const selected = ratings[skill.id];
            return (
              <div key={skill.id} className="skill-row">
                <div className="skill-row-header">
                  <span className="skill-icon">{skill.icon}</span>
                  <div className="skill-name">
                    {skill.label}
                    <span className="skill-desc">{skill.desc}</span>
                  </div>
                  <div className="skill-tooltip-wrapper">
                    <button
                      className="skill-tooltip-btn"
                      onMouseEnter={() => setTooltipVisible(skill.id)}
                      onMouseLeave={() => setTooltipVisible(null)}
                      onFocus={() => setTooltipVisible(skill.id)}
                      onBlur={() => setTooltipVisible(null)}
                      aria-label={`Info: ${skill.tooltip}`}
                    >❓</button>
                    {tooltipVisible === skill.id && (
                      <div className="skill-tooltip-box">{skill.tooltip}</div>
                    )}
                  </div>
                </div>
                <div className="rating-pills-row">
                  {[1, 2, 3, 4].map(val => {
                    const isSelected = selected === val;
                    const rc = RATING_COLORS[val];
                    return (
                      <button
                        key={val}
                        className={`rating-pill ${isSelected ? 'rating-pill--selected' : ''}`}
                        style={isSelected ? {
                          background: rc.bg,
                          color: rc.text,
                          transform: 'scale(1.08)',
                          boxShadow: `0 4px 14px ${rc.bg}88`,
                          border: `2px solid ${rc.bg}`,
                        } : {}}
                        onClick={() => handleSelect(skill.id, val)}
                        aria-label={`${rc.label} for ${skill.label}`}
                        aria-pressed={isSelected}
                      >
                        {rc.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <SkillLegend compact />

          <button
            className="btn-primary modal-submit-btn"
            style={allRated ? { background: book.bgGradient } : {}}
            disabled={!allRated}
            onClick={handleSubmit}
          >
            {existingData ? '✏️ Update Scores →' : '💾 Save Scores →'}
          </button>
        </div>
      </div>
    </div>
  );
}
