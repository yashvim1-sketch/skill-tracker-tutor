import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { STUDENTS } from '../data/students';
import TutorOverallDashboard from '../components/TutorOverallDashboard';

export default function TutorOverallPage() {
  const { studentId } = useParams();
  const navigate      = useNavigate();
  const student       = STUDENTS.find(s => s.id === studentId);

  return (
    <div className="page-fade overall-page">
      <button className="back-btn" onClick={() => navigate(`/tutor/student/${studentId}`)}>
        ← Back to {student?.name || 'Student'}
      </button>

      <div className="overall-page-header">
        <h1 className="overall-title">Overall Growth Summary</h1>
        <p className="overall-subtitle">
          {student?.name}'s complete learning journey across the Humans of Science STEM Series
        </p>
      </div>

      <div className="page-inner">
        <TutorOverallDashboard studentId={studentId} />
      </div>
    </div>
  );
}
