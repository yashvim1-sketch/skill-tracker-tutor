import { useState, useEffect, useCallback } from 'react';
import { fetchStudentScores, saveBookScores as apiSaveBookScores } from '../api/tutorApi';

/**
 * useStudentData
 * Manages scores for a single student — loads from API, saves to API.
 */
export function useStudentData(studentId) {
  const [scores,        setScores]        = useState({}); // { [bookKey]: scoreObject }
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState(null);
  const [savingBook,    setSavingBook]    = useState(null); // bookKey currently being saved
  const [saveError,     setSaveError]     = useState(null);

  const loadScores = useCallback(() => {
    if (!studentId) return;
    setLoading(true);
    setError(null);
    fetchStudentScores(studentId)
      .then(data => {
        // Convert array → map keyed by bookKey
        const map = {};
        (data.scores || []).forEach(s => { map[s.bookKey] = s; });
        setScores(map);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [studentId]);

  useEffect(() => {
    loadScores();
  }, [loadScores]);

  /**
   * saveScores — posts to API, then updates local state on success.
   * Returns { success: true } or throws.
   */
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
      cognitive:      Number(ratings.cognitive || 0),
      creative:       Number(ratings.creative || 0),
      communication:  Number(ratings.communication || 0),
      socialEmotional:Number(ratings.socialEmotional || 0),
      physical:       Number(ratings.physical || 0),
      practical:      Number(ratings.practical || 0),
      averageScore:   avg,
    };

    try {
      const result = await apiSaveBookScores(payload);
      // Update local scores map
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

  const getBookScore = useCallback((bookKey) => scores[bookKey] || null, [scores]);

  const completedCount = Object.keys(scores).length;

  return {
    scores,
    loading,
    error,
    savingBook,
    saveError,
    saveScores,
    getBookScore,
    completedCount,
    reload: loadScores,
  };
}
