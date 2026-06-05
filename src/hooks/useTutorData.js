import { useState, useEffect } from 'react';
import { fetchBatchStudents } from '../api/tutorApi';

/**
 * useTutorData
 * Manages:
 *  - tutorId / batchName from postMessage
 *  - students list for the batch
 */
export function useTutorData() {
  const [tutorId,   setTutorId]   = useState(null);
  const [batchName, setBatchName] = useState(null);

  const [students,         setStudents]         = useState([]);
  const [studentsLoading,  setStudentsLoading]  = useState(false);
  const [studentsError,    setStudentsError]    = useState(null);

  // Listen for postMessage from Wix embed
  useEffect(() => {
    // Signal to parent that React is ready
    window.parent.postMessage({ type: 'REACT_READY' }, '*');

    const handleMessage = (event) => {
      const data = event.data;
      if (!data) return;

      // Accept both new and old message formats
      const tid = data.tutorId;
      const bn  = data.batchName || (data.type === 'WIX_SESSION' ? data.batchName : null);

      if (tid) {
        setTutorId(tid);
        setBatchName(bn || '');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Fetch students automatically when tutorId and batchName are present
  useEffect(() => {
    if (tutorId && batchName) {
      setStudentsLoading(true);
      setStudentsError(null);
      fetchBatchStudents(tutorId, batchName)
        .then(data => setStudents(data.students || []))
        .catch(err => setStudentsError(err.message))
        .finally(() => setStudentsLoading(false));
    }
  }, [tutorId, batchName]);

  return {
    tutorId,
    batchName,
    students,
    studentsLoading,
    studentsError,
  };
}
