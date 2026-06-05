import React from 'react';

/**
 * TutorBookCard
 * Props: studentId, book, scoreData (from API, null if unrated), onSelect
 *
 * scoreData shape: { bookKey, averageScore, cognitive, ... } | null
 */
export default function TutorBookCard({ studentId, book, scoreData, onSelect }) {
  const isCompleted = !!scoreData;

  return (
    <div
      className={`book-card ${isCompleted ? 'book-card--completed' : ''}`}
      style={{
        background:  book.bgGradient || '#6366F1',
        boxShadow:   isCompleted
          ? `0 0 0 3px ${book.color || '#6366F1'}, 0 8px 30px ${(book.color || '#6366F1')}44`
          : '0 4px 20px rgba(0,0,0,0.12)',
      }}
      onClick={() => onSelect(book)}
      role="button"
      tabIndex={0}
      aria-label={`Evaluate ${book.title || book.name}`}
      onKeyDown={e => e.key === 'Enter' && onSelect(book)}
    >
      <div className="book-card-emoji">{book.emoji || '📖'}</div>
      <div className="book-card-body">
        <h3 className="book-card-title">{book.title || book.name}</h3>
        <p className="book-card-scientist">{book.author || book.scientist}</p>
        <p className="book-card-desc">{book.description || ''}</p>
      </div>
      <div className="book-card-footer">
        {isCompleted ? (
          <span className="book-card-status book-card-status--done">
            ✅ Completed · Avg {Number(scoreData.averageScore).toFixed(1)}/4
          </span>
        ) : (
          <span className="book-card-status book-card-status--todo">Tap to evaluate</span>
        )}
      </div>
    </div>
  );
}
