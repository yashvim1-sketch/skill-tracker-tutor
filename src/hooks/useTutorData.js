import { useState, useEffect } from 'react';
import { fetchBatchStudents } from '../api/tutorApi';

/**
 * useTutorData
 * Manages:
 *  - tutorId / batchName received via postMessage from the Wix parent page
 *  - students list fetched via postMessage bridge (no HTTP/CORS)
 */
export function useTutorData() {
  const [tutorId,   setTutorId]   = useState(null);
  const [batchName, setBatchName] = useState(null);

  const [students,         setStudents]         = useState([]);
  const [studentsLoading,  setStudentsLoading]  = useState(false);
  const [studentsError,    setStudentsError]    = useState(null);

  // Step 1: Signal to Wix that React is ready, then receive session data
  useEffect(() => {
    // Tell the Wix parent page we are ready to receive tutorId/batchName
    window.parent.postMessage({ type: 'REACT_READY' }, '*');

    const handleMessage = (event) => {
      const data = event.data;
      if (!data) return;

      // Only handle session data messages (not our own bridge responses)
      if (data.type === 'WIX_SESSION' || data.tutorId) {
        const tid = data.tutorId;
        const bn  = data.batchName || '';
        if (tid) {
          setTutorId(tid);
          setBatchName(bn);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Step 2: Once we have tutorId + batchName, fetch students via postMessage bridge
  useEffect(() => {
    if (!tutorId || !batchName) return;

    setStudentsLoading(true);
    setStudentsError(null);

    fetchBatchStudents(tutorId, batchName)
      .then(data => setStudents(data.students || []))
      .catch(err => setStudentsError(err.message))
      .finally(() => setStudentsLoading(false));
  }, [tutorId, batchName]);

  return {
    tutorId,
    batchName,
    students,
    studentsLoading,
    studentsError,
  };
}
