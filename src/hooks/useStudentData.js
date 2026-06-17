import { useState, useEffect, useCallback } from 'react';
import {
  fetchStudentScores,
  saveBookScores as apiSaveBookScores,
  deleteBookScore as apiDeleteBookScore,
  saveTutorComment,
} from '../api/tutorApi';

/**
 * useStudentData
 * Manages scores + remarks for a single student — loads from API, saves to API.
 *
 * Caching fix: local `scores` state is ALWAYS fully replaced from the
 * fresh API response on every load/reload. If a score was deleted from
 * the CMS, it will NOT appear in scores after the next reload.
 */
export function useStudentData(studentId) {
  const [scores,       setScores]       = useState({}); // { [bookKey]: scoreObject }
  const [remarks,      setRemarks]      = useState(''); // tutorComment from UserRoles
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);
  const [savingBook,   setSavingBook]   = useState(null);
  const [deletingBook, setDeletingBook] = useState(null);
  const [saveError,    setSaveError]    = useState(null);

  // ── Load scores + remarks freshly from API ─────────────────────────────────
  const loadScores = useCallback(() => {
    if (!studentId) return;
    setLoading(true);
    setError(null);
    fetchStudentScores(studentId)
      .then(data => {
        // ALWAYS fully replace — never merge — so deleted CMS entries disappear
        const map = {};
        (data.scores || []).forEach(s => { map[s.bookKey] = s; });
        setScores(map);

        // Load remarks (tutorComment) if returned by the API
        if (typeof data.tutorComment === 'string') {
          setRemarks(data.tutorComment);
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [studentId]);

  useEffect(() => {
    loadScores();
  }, [loadScores]);

  // ── Save book scores ────────────────────────────────────────────────────────
  const saveScores = useCallback(async ({ tutorId, batchName, bookKey, bookName, ratings }) => {
    setSavingBook(bookKey);
    setSaveError(null);
    const avg = Number(
      (
        (Number(ratings.cognitive || 0) +
          Number(ratings.creative || 0) +
          Number(ratings.communication || 0) +
          Number(ratings.socialEmotional || 0) +
          Number(ratings.physical || 0) +
          Number(ratings.practical || 0)) / 6
      ).toFixed(2)
    );

    const payload = {
      studentId,
      tutorId,
      batchName,
      bookKey,
      bookName,
      cognitive:       Number(ratings.cognitive || 0),
      creative:        Number(ratings.creative || 0),
      communication:   Number(ratings.communication || 0),
      socialEmotional: Number(ratings.socialEmotional || 0),
      physical:        Number(ratings.physical || 0),
      practical:       Number(ratings.practical || 0),
      averageScore:    avg,
    };

    try {
      const result = await apiSaveBookScores(payload);
      // Update local state optimistically
      setScores(prev => ({
        ...prev,
        [bookKey]: { ...payload, averageScore: avg, updatedAt: new Date().toISOString() },
      }));
      return result;
    } catch (err) {
      setSaveError(err.message);
      throw err;
    } finally {
      setSavingBook(null);
    }
  }, [studentId]);

  // ── Delete (Undo) a book score ─────────────────────────────────────────────
  const deleteScore = useCallback(async (bookKey) => {
    setDeletingBook(bookKey);
    try {
      await apiDeleteBookScore(studentId, bookKey);
      // Remove from local state immediately — no need to reload
      setScores(prev => {
        const next = { ...prev };
        delete next[bookKey];
        return next;
      });
    } catch (err) {
      setSaveError(err.message);
      throw err;
    } finally {
      setDeletingBook(null);
    }
  }, [studentId]);

  // ── Save remarks (tutorComment) ────────────────────────────────────────────
  const saveRemarks = useCallback(async (text) => {
    await saveTutorComment(studentId, text);
    setRemarks(text);
  }, [studentId]);

  const getBookScore   = useCallback((bookKey) => scores[bookKey] || null, [scores]);
  const completedCount = Object.keys(scores).length;

  return {
    scores,
    remarks,
    loading,
    error,
    savingBook,
    deletingBook,
    saveError,
    saveScores,
    deleteScore,
    saveRemarks,
    getBookScore,
    completedCount,
    reload: loadScores,
  };
}
