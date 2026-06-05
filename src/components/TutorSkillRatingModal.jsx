import React, { useState, useEffect } from 'react';
import { SKILLS, RATING_COLORS } from '../data/books';
import SkillLegend from './SkillLegend';

/**
 * TutorSkillRatingModal
 * Props: studentId, tutorId, batchName, book, existingScore, saveScores, onClose, onSubmit
 *
 * saveScores is the function from useStudentData — it calls the Wix API.
 * existingScore is the score object from the API (or null if none yet).
 */
export default function TutorSkillRatingModal({
  studentId, tutorId, batchName,
  book, existingScore,
  saveScores, onClose, onSubmit,
}) {
  const [ratings,        setRatings]        = useState({});
  const [tooltipVisible, setTooltipVisible] = useState(null);
  const [isVisible,      setIsVisible]      = useState(false);
  const [saving,         setSaving]         = useState(false);
  const [saveErr,        setSaveErr]        = useState('');

  // Pre-populate from existing API score
  useEffect(() => {
    if (existingScore) {
      const loaded = {};
      SKILLS.forEach(s => {
        if (existingScore[s.id] != null) loaded[s.id] = existingScore[s.id];
      });
      setRatings(loaded);
    }
    setTimeout(() => setIsVisible(true), 10);
  }, [existingScore]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 280);
  };

  const handleSelect = (skillId, value) =>
    setRatings(prev => ({ ...prev, [skillId]: value }));

  const allRated = SKILLS.every(s => ratings[s.id] !== undefined);

  const handleSubmit = async () => {
    if (!allRated || saving) return;
    setSaving(true);
    setSaveErr('');
    try {
      await saveScores({
        tutorId,
        batchName,
        bookKey:  book.key || book.id,
        bookName: book.title || book.name,
        ratings,
      });
      setIsVisible(false);
      setTimeout(() => onSubmit(book), 280);
    } catch (err) {
      setSaveErr('Failed to save. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div
      className="tutor-modal-overlay"
      style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.28s ease' }}
      onClick={e => e.target === e.currentTarget && handleClose()}
      role="dialog"
      aria-modal="true"
      aria-label={`Rate skills for ${book.title || book.name}`}
    >
      <div
        className="tutor-modal-sheet"
        style={{
          transform: isVisible ? 'scale(1)' : 'scale(0.92)',
          transition: 'transform 0.28s cubic-bezier(0.34, 1.26, 0.64, 1)',
        }}
      >
        {/* Header */}
        <div className="modal-header" style={{ background: book.bgGradient || '#6366F1' }}>
          <div className="modal-header-left">
            <span className="modal-book-emoji">{book.emoji || '📖'}</span>
            <div>
              <h2 className="modal-book-name">{book.title || book.name}</h2>
              <p className="modal-subtitle">Rate skills for this book</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={handleClose} aria-label="Close modal">✕</button>
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

          {saveErr && (
            <p style={{ color: '#EF4444', textAlign: 'center', marginBottom: 8 }}>{saveErr}</p>
          )}

          <button
            className="btn-primary modal-submit-btn"
            style={allRated ? { background: book.bgGradient || '#6366F1' } : {}}
            disabled={!allRated || saving}
            onClick={handleSubmit}
          >
            {saving ? '⏳ Saving…' : existingScore ? '✏️ Update Scores →' : '💾 Save Scores →'}
          </button>
        </div>
      </div>
    </div>
  );
}
