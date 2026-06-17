import React from 'react';

/**
 * TutorBookCard
 * Props: studentId, book, scoreData (from API, null if unrated), onSelect, onUndo, deleting
 *
 * scoreData shape: { bookKey, averageScore, cognitive, ... } | null
 */
export default function TutorBookCard({ studentId, book, scoreData, onSelect, onUndo, deleting }) {
  const isCompleted = !!scoreData;

  return (
    <div
      className={`book-card ${isCompleted ? 'book-card--completed' : ''}`}
      style={{
        background: book.bgGradient || '#6366F1',
        boxShadow: isCompleted
          ? `0 0 0 3px ${book.color || '#6366F1'}, 0 8px 30px ${(book.color || '#6366F1')}44`
          : '0 4px 20px rgba(0,0,0,0.12)',
      }}
      onClick={() => !isCompleted && onSelect(book)}
      role="button"
      tabIndex={0}
      aria-label={isCompleted ? `${book.title} — completed` : `Evaluate ${book.title}`}
      onKeyDown={e => e.key === 'Enter' && !isCompleted && onSelect(book)}
    >
      <div className="book-card-emoji">{book.emoji || '📖'}</div>
      <div className="book-card-body">
        <h3 className="book-card-title">{book.title}</h3>
        <p className="book-card-scientist">{book.author}</p>
        <p className="book-card-desc">{book.subtitle || ''}</p>
      </div>
      <div className="book-card-footer">
        {isCompleted ? (
          <div className="book-card-footer-row">
            <span className="book-card-status book-card-status--done">
              ✅ Completed
            </span>
            <button
              className="book-card-undo-btn"
              disabled={deleting}
              onClick={e => {
                e.stopPropagation();
                onUndo(book.key);
              }}
              title="Undo — clear scores for this book"
            >
              {deleting ? '…' : '↩ Undo'}
            </button>
          </div>
        ) : (
          <span className="book-card-status book-card-status--todo">Tap to evaluate</span>
        )}
      </div>
    </div>
  );
}
