/**
 * Tutor localStorage helpers.
 *
 * Key formats (EXACT — do not change):
 *   Scores  : bb_scores_{studentId}_{bookId}
 *   Comment : bb_comment_{studentId}
 */

import { BOOKS, SKILLS } from './books';
import { STUDENTS } from './students';

const SCORE_PREFIX   = 'bb_scores_';
const COMMENT_PREFIX = 'bb_comment_';

// ── Scores ────────────────────────────────────────────────────

/** Save skill ratings for one student+book. Adds savedAt timestamp. */
export function saveTutorBookScores(studentId, bookId, skillRatings) {
  const data = {
    ...skillRatings,
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem(`${SCORE_PREFIX}${studentId}_${bookId}`, JSON.stringify(data));
  return data;
}

/**
 * Get stored scores for one student+book.
 * Returns null if key missing, invalid JSON, or all scores are 0.
 */
export function getTutorBookScores(studentId, bookId) {
  const raw = localStorage.getItem(`${SCORE_PREFIX}${studentId}_${bookId}`);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    const hasScore = SKILLS.some(s => (parsed[s.id] || 0) > 0);
    if (!hasScore) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Remove scores for one student+book (undo). */
export function clearTutorBookScores(studentId, bookId) {
  localStorage.removeItem(`${SCORE_PREFIX}${studentId}_${bookId}`);
}

/** Count how many books have valid (score > 0) entries for a student. */
export function getTutorCompletedCount(studentId) {
  return BOOKS.filter(b => getTutorBookScores(studentId, b.id) !== null).length;
}

/**
 * Returns all completed-book rating entries for a student,
 * in the SAME shape that student-app getAllRatings() returns
 * so existing analysis components (BookAnalysis, OverallDashboard) work unchanged.
 */
export function getTutorAllRatings(studentId) {
  const result = [];
  BOOKS.forEach(book => {
    const scores = getTutorBookScores(studentId, book.id);
    if (!scores) return;

    const ratings = {};
    SKILLS.forEach(s => { ratings[s.id] = scores[s.id] || 0; });

    const vals = SKILLS.map(s => ratings[s.id]);
    const avg  = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100;

    result.push({
      bookId: book.id,
      ratings,
      averageScore: avg,
      completedAt: scores.savedAt || new Date().toISOString(),
    });
  });
  return result;
}

// ── Comment ───────────────────────────────────────────────────

export function saveTutorComment(studentId, comment) {
  localStorage.setItem(`${COMMENT_PREFIX}${studentId}`, comment);
}

export function getTutorComment(studentId) {
  return localStorage.getItem(`${COMMENT_PREFIX}${studentId}`) || '';
}

// ── CSV Export ────────────────────────────────────────────────

export function exportTutorCSV() {
  const header = [
    'studentName', 'bookName',
    'cognitive', 'creative', 'communication', 'social_emotional', 'physical', 'practical',
    'savedAt', 'tutorComment'
  ].join(',');

  const rows = [];

  STUDENTS.forEach(student => {
    const comment = getTutorComment(student.id).replace(/"/g, '""');
    BOOKS.forEach(book => {
      const scores = getTutorBookScores(student.id, book.id);
      if (!scores) return;
      const row = [
        `"${student.name}"`,
        `"${book.name.replace(/"/g, '""')}"`,
        scores.cognitive      || 0,
        scores.creative       || 0,
        scores.communication  || 0,
        scores.social_emotional || 0,
        scores.physical       || 0,
        scores.practical      || 0,
        scores.savedAt        || '',
        `"${comment}"`,
      ].join(',');
      rows.push(row);
    });
  });

  if (rows.length === 0) {
    alert('No data to export yet. Fill in some scores first.');
    return;
  }

  const csv  = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'tutor_data.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
