import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { STUDENTS } from '../data/students';
import { getTutorCompletedCount, exportTutorCSV } from '../data/tutorStorage';
import { BOOKS } from '../data/books';

export default function TutorHomePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const filtered = query.trim() === ''
    ? STUDENTS
    : STUDENTS.filter(s =>
        s.name.toLowerCase().includes(query.trim().toLowerCase())
      );

  return (
    <div className="page-fade home-page">
      {/* Header */}
      <header className="home-header">
        <div className="home-header-gradient-strip" />
        <div className="home-header-inner">
          <div className="logo-text">
            <span className="logo-emoji">📚</span>
            <span className="logo-title">Skill Tracker</span>
          </div>
          <p className="home-subtitle">Tutor Dashboard</p>
        </div>
      </header>

      {/* Search + Export row */}
      <div className="tutor-search-section">
        <div className="tutor-search-row">
          <div className="tutor-search-wrapper">
            <span className="tutor-search-icon">🔍</span>
            <input
              id="student-search"
              className="tutor-search-input"
              type="text"
              placeholder="Search student by name..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoComplete="off"
            />
            {query && (
              <button
                className="tutor-search-clear"
                onClick={() => setQuery('')}
                aria-label="Clear search"
              >✕</button>
            )}
          </div>
          <button
            className="btn-export"
            onClick={exportTutorCSV}
            title="Export all student data as CSV"
          >
            ⬇️ Export CSV
          </button>
        </div>
      </div>

      {/* Student list */}
      <div className="tutor-student-list-section">
        <h2 className="books-section-title">
          👩‍🏫 Students ({filtered.length})
        </h2>

        {filtered.length === 0 ? (
          <div className="tutor-no-results">
            <span className="tutor-no-results-emoji">🔎</span>
            <p>No student found for "<strong>{query}</strong>"</p>
          </div>
        ) : (
          <div className="tutor-student-grid">
            {filtered.map(student => {
              const filled = getTutorCompletedCount(student.id);
              const total  = BOOKS.length;
              const pct    = total > 0 ? Math.round((filled / total) * 100) : 0;
              return (
                <button
                  key={student.id}
                  className="tutor-student-card"
                  onClick={() => navigate(`/tutor/student/${student.id}`)}
                  aria-label={`Open skill tracker for ${student.name}`}
                >
                  <div className="tutor-student-avatar">
                    {student.name.charAt(0)}
                  </div>
                  <div className="tutor-student-info">
                    <div className="tutor-student-name">{student.name}</div>
                    <div className="tutor-student-meta">
                      <span
                        className={`tutor-books-badge ${filled > 0 ? 'tutor-books-badge--some' : ''}`}
                      >
                        {filled} / {total} books filled
                      </span>
                      {filled > 0 && (
                        <div className="tutor-mini-bar-wrap">
                          <div
                            className="tutor-mini-bar-fill"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="tutor-student-arrow">→</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
