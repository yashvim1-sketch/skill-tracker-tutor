import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTutorData } from '../hooks/useTutorData';

export default function TutorHomePage() {
  const navigate = useNavigate();
  const {
    tutorId,
    batchName,
    students, studentsLoading, studentsError,
  } = useTutorData();

  const [query, setQuery] = useState('');

  const filteredStudents = query.trim() === ''
    ? students
    : students.filter(s =>
        s.fullName.toLowerCase().includes(query.trim().toLowerCase())
      );

  return (
    <div className="page-fade home-page">
      {/* Header */}
      <header className="home-header">
        <div className="home-header-gradient-strip" />
        <div className="home-header-inner">
          {batchName ? (
            <div className="logo-text">
              <span className="logo-emoji">🗂️</span>
              <span className="logo-title">{batchName}</span>
            </div>
          ) : (
            <div className="logo-text">
              <span className="logo-emoji">⏳</span>
              <span className="logo-title">Loading Session...</span>
            </div>
          )}
        </div>
      </header>

      {/* Waiting for tutorId from Wix postMessage */}
      {(!tutorId || !batchName) && (
        <div className="tutor-no-results" style={{ marginTop: 40 }}>
          <span className="tutor-no-results-emoji">⏳</span>
          <p>Loading session data...</p>
        </div>
      )}

      {tutorId && batchName && (
        <>
          {/* ── Students in selected batch ── */}
          <div className="tutor-student-list-section">
            {/* Search row */}
            <div className="tutor-search-section">
              <div className="tutor-search-row">
                <div className="tutor-search-wrapper">
                  <span className="tutor-search-icon">🔍</span>
                  <input
                    id="student-search"
                    className="tutor-search-input"
                    type="text"
                    placeholder="Search student by name…"
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
              </div>
            </div>

            <h2 className="books-section-title">
              👩‍🏫 Students
              {!studentsLoading && ` (${filteredStudents.length})`}
            </h2>

            {studentsLoading && (
              <div className="tutor-no-results">
                <span className="tutor-no-results-emoji">⏳</span>
                <p>Loading students…</p>
              </div>
            )}

            {studentsError && (
              <div className="tutor-no-results">
                <span className="tutor-no-results-emoji">⚠️</span>
                <p>Could not load students: {studentsError}</p>
              </div>
            )}

            {!studentsLoading && !studentsError && students.length === 0 && (
              <div className="tutor-no-results">
                <span className="tutor-no-results-emoji">📭</span>
                <p>No students in this batch yet.</p>
              </div>
            )}

            {!studentsLoading && !studentsError && students.length > 0 && filteredStudents.length === 0 && (
              <div className="tutor-no-results">
                <span className="tutor-no-results-emoji">🔎</span>
                <p>No student found for "<strong>{query}</strong>"</p>
              </div>
            )}

            {!studentsLoading && filteredStudents.length > 0 && (
              <div className="tutor-student-grid">
                {filteredStudents.map(student => (
                  <button
                    key={student.memberId}
                    className="tutor-student-card"
                    onClick={() =>
                      navigate(`/tutor/student/${student.memberId}`, {
                        state: {
                          studentName: student.fullName,
                          batchName: batchName,
                          tutorId,
                        },
                      })
                    }
                    aria-label={`Open skill tracker for ${student.fullName}`}
                  >
                    <div className="tutor-student-avatar">
                      {student.fullName.charAt(0)}
                    </div>
                    <div className="tutor-student-info">
                      <div className="tutor-student-name">{student.fullName}</div>
                      <div className="tutor-student-meta">
                        <span className="tutor-books-badge">{batchName}</span>
                      </div>
                    </div>
                    <span className="tutor-student-arrow">→</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
