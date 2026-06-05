import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import TutorOverallDashboard from '../components/TutorOverallDashboard';

export default function TutorOverallPage() {
  const { studentId } = useParams();
  const navigate      = useNavigate();
  const location      = useLocation();

  const studentName = location.state?.studentName || studentId;
  const batchName   = location.state?.batchName   || '';
  const tutorId     = location.state?.tutorId     || '';

  return (
    <div className="page-fade overall-page">
      <button
        className="back-btn"
        onClick={() =>
          navigate(`/tutor/student/${studentId}`, {
            state: { studentName, batchName, tutorId },
          })
        }
      >
        ← Back to {studentName}
      </button>

      <div className="overall-page-header">
        <h1 className="overall-title">Overall Growth Summary</h1>
        <p className="overall-subtitle">
          {studentName}'s complete learning journey across the Humans of Science STEM Series
        </p>
      </div>

      <div className="page-inner">
        <TutorOverallDashboard
          studentId={studentId}
          studentName={studentName}
          tutorId={tutorId}
        />
      </div>
    </div>
  );
}
