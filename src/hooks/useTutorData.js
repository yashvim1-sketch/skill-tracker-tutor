import { useState, useEffect, useCallback } from 'react';
import { fetchTutorBatches, fetchBatchStudents } from '../api/tutorApi';

/**
 * useTutorData
 * Manages:
 *  - tutorId / batchName from postMessage
 *  - batches list (loaded from API once tutorId is known)
 *  - selected batch + its student list
 */
export function useTutorData() {
  const [tutorId,   setTutorId]   = useState(null);
  const [batchName, setBatchName] = useState(null);

  // Batches
  const [batches,       setBatches]       = useState([]);
  const [batchesLoading, setBatchesLoading] = useState(false);
  const [batchesError,   setBatchesError]   = useState(null);

  // Selected batch → students
  const [selectedBatch,    setSelectedBatch]    = useState(null);
  const [students,         setStudents]         = useState([]);
  const [studentsLoading,  setStudentsLoading]  = useState(false);
  const [studentsError,    setStudentsError]    = useState(null);

  // Listen for postMessage from Wix embed
  useEffect(() => {
    // Tell parent we are ready to receive session
    window.parent.postMessage({ type: 'REACT_READY' }, '*');

    const handler = (event) => {
      const data = event.data;
      if (!data) return;

      // New format from HTML bridge
      if (data.type === 'WIX_SESSION' && data.tutorId) {
        setTutorId(data.tutorId);
        setBatchName(data.batchName || '');
        return;
      }

      // Old format fallback
      if (data.tutorId) {
        setTutorId(data.tutorId);
        setBatchName(data.batchName || '');
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  // Load batches whenever tutorId is available
  useEffect(() => {
    if (!tutorId) return;
    setBatchesLoading(true);
    setBatchesError(null);
    fetchTutorBatches(tutorId)
      .then(data => setBatches(data.batches || []))
      .catch(err => setBatchesError(err.message))
      .finally(() => setBatchesLoading(false));
  }, [tutorId]);

  // Auto-select batch from postMessage if provided
  useEffect(() => {
    if (batchName && batches.length > 0) {
      const found = batches.find(b => b.batchName === batchName);
      if (found) setSelectedBatch(found.batchName);
    }
  }, [batchName, batches]);

  // Load students when a batch is selected
  const selectBatch = useCallback((bName) => {
    setSelectedBatch(bName);
    setStudents([]);
    setStudentsError(null);
    if (!tutorId || !bName) return;
    setStudentsLoading(true);
    fetchBatchStudents(tutorId, bName)
      .then(data => setStudents(data.students || []))
      .catch(err => setStudentsError(err.message))
      .finally(() => setStudentsLoading(false));
  }, [tutorId]);

  // If selectedBatch changes externally (from postMessage), load its students
  useEffect(() => {
    if (selectedBatch && tutorId) {
      setStudentsLoading(true);
      setStudentsError(null);
      fetchBatchStudents(tutorId, selectedBatch)
        .then(data => setStudents(data.students || []))
        .catch(err => setStudentsError(err.message))
        .finally(() => setStudentsLoading(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBatch]);

  return {
    tutorId,
    batches,        batchesLoading, batchesError,
    selectedBatch,  selectBatch,
    students,       studentsLoading, studentsError,
  };
}
