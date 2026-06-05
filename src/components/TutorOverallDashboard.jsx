import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { BOOKS } from '../constants/books';
import { SKILLS } from '../data/books';
import { useStudentData } from '../hooks/useStudentData';
import { saveTutorComment as apiSaveTutorComment } from '../api/tutorApi';
import {
  computeOverallAverage, computeSkillAverages,
  getTopSkill, getDevelopingSkill, getBadgeInfo,
} from '../utils/scoreUtils';
import ProgressBar   from './ProgressBar';
import MilestoneBadge from './MilestoneBadge';
import SkillLegend   from './SkillLegend';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const SKILL_LINE_COLORS = {
  cognitive:      '#6366F1',
  creative:       '#EC4899',
  communication:  '#F59E0B',
  socialEmotional:'#22C55E',
  physical:       '#EF4444',
  practical:      '#8B5CF6',
};

function getScoreRingColor(avg) {
  if (avg > 3) return '#22C55E';
  if (avg >= 2) return '#F97316';
  return '#EF4444';
}
function getScoreRingLabel(avg) {
  if (avg > 3) return 'Excellent Progress!';
  if (avg >= 2) return 'Developing Well';
  return 'Keep Going! 💪';
}
function avgCardStyle(avg) {
  if (avg >= 3.0) return { bg: '#DCFCE7', color: '#16A34A' };
  if (avg >= 2.0) return { bg: '#FEF9C3', color: '#D97706' };
  return { bg: '#FEE2E2', color: '#DC2626' };
}

const TUTOR_RECOMMENDATIONS = {
  cognitive:      [
    { icon: '🧩', label: 'Puzzles and brain teasers to build independent thinking' },
    { icon: '🔭', label: 'STEM experiment kits to encourage curiosity' },
    { icon: '♟️', label: 'Strategy board games to develop problem-solving' },
  ],
  creative:       [
    { icon: '🎨', label: 'Drawing and painting sessions to express imagination' },
    { icon: '🧱', label: 'Clay modeling and sculpture activities' },
    { icon: '📖', label: 'Story creation and illustration projects' },
  ],
  communication:  [
    { icon: '📚', label: 'Read aloud sessions to build vocabulary and fluency' },
    { icon: '🎭', label: 'Roleplay and drama games to boost confidence' },
    { icon: '🗣️', label: 'Group storytelling and discussion activities' },
  ],
  socialEmotional:[
    { icon: '🏅', label: 'Team-based games that build cooperation and trust' },
    { icon: '💛', label: 'Empathy discussions inspired by book characters' },
    { icon: '🌍', label: 'Community activities and collaborative projects' },
  ],
  physical:       [
    { icon: '✂️', label: 'Hands-on craft activities to strengthen motor skills' },
    { icon: '🌿', label: 'Sensory play and nature exploration outdoors' },
    { icon: '🌳', label: 'Outdoor discovery challenges and physical games' },
  ],
  practical:      [
    { icon: '🍳', label: 'Cooking together to apply real-life measurement skills' },
    { icon: '🔨', label: 'Simple DIY and building projects at home' },
    { icon: '🔬', label: 'Home science experiments using everyday materials' },
  ],
};

function generateRichFeedback(skillAverages, completedCount, studentName) {
  const name   = studentName || 'Your child';
  const sorted = [...SKILLS]
    .map(s => ({ ...s, avg: skillAverages[s.id] || 0 }))
    .sort((a, b) => b.avg - a.avg);
  const top2 = sorted.slice(0, 2);
  const low2 = sorted.slice(-2);

  let para = `${name} is making lovely and consistent progress across their learning journey through ${completedCount} book${completedCount !== 1 ? 's' : ''} in the Humans of Science STEM series. `;
  para += `${top2.map(s => s.label).join(' and ')} are shining strengths — ${name} demonstrates these abilities with great confidence across activities. `;
  if (completedCount >= 2) {
    para += `It is especially encouraging to see ${low2.map(s => s.label).join(' and ')} improving across books — this upward trend shows ${name} is genuinely absorbing and growing with each activity. `;
  }
  para += `Continuing to explore a variety of activities will help these already developing skills reach their full potential. `;
  para += `Keep celebrating every milestone — ${name}'s curiosity and effort across these books is building a strong and joyful foundation for lifelong learning.`;
  return para;
}

/**
 * Build allRatings array in the shape scoreUtils expects,
 * from the scores map returned by useStudentData.
 */
function buildAllRatings(scores) {
  return Object.values(scores).map(s => ({
    bookId: s.bookKey,
    ratings: {
      cognitive:      s.cognitive      || 0,
      creative:       s.creative       || 0,
      communication:  s.communication  || 0,
      socialEmotional:s.socialEmotional|| 0,
      physical:       s.physical       || 0,
      practical:      s.practical      || 0,
    },
    averageScore: s.averageScore || 0,
    completedAt:  s.updatedAt    || new Date().toISOString(),
  }));
}

export default function TutorOverallDashboard({ studentId, studentName, tutorId }) {
  const { scores, loading, error } = useStudentData(studentId);

  const [comment, setComment] = useState('');
  const [saveMsg, setSaveMsg] = useState('');
  const [saving,  setSaving]  = useState(false);

  const handleSaveComment = async () => {
    setSaving(true);
    try {
      await apiSaveTutorComment(studentId, comment);
      setSaveMsg('Comment saved successfully!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch {
      setSaveMsg('Failed to save comment. Please try again.');
      setTimeout(() => setSaveMsg(''), 4000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="overall-empty">
        <div className="overall-empty-emoji">⏳</div>
        <p>Loading scores…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="overall-empty">
        <div className="overall-empty-emoji">⚠️</div>
        <p>Could not load data: {error}</p>
      </div>
    );
  }

  const allRatings     = buildAllRatings(scores);
  const completedCount = allRatings.length;
  const totalBooks     = BOOKS.length;

  if (completedCount === 0) {
    return (
      <div className="overall-empty">
        <div className="overall-empty-emoji">📚</div>
        <h2>No books completed yet</h2>
        <p>Rate at least one book to view the overall analysis.</p>
      </div>
    );
  }

  const overallAvg      = computeOverallAverage(allRatings);
  const skillAverages   = computeSkillAverages(allRatings);
  const topSkill        = getTopSkill(skillAverages);
  const developingSkill = getDevelopingSkill(skillAverages);
  const badgeInfo       = getBadgeInfo(overallAvg);
  const richFeedback    = generateRichFeedback(skillAverages, completedCount, studentName);
  const devRecs         = TUTOR_RECOMMENDATIONS[developingSkill?.skill?.id] || TUTOR_RECOMMENDATIONS.cognitive;
  const ringColor       = getScoreRingColor(overallAvg);
  const ringLabel       = getScoreRingLabel(overallAvg);

  // Books in order for the chart X-axis
  const completedBooks = BOOKS.filter(b =>
    allRatings.find(r => r.bookId === (b.key || b.id))
  );

  const lineData = {
    labels: completedBooks.map(b =>
      (b.title || b.name).length > 14
        ? (b.title || b.name).slice(0, 13) + '…'
        : (b.title || b.name)
    ),
    datasets: SKILLS.map(skill => ({
      label: skill.label,
      data:  completedBooks.map(book => {
        const rating = allRatings.find(r => r.bookId === (book.key || book.id));
        return rating?.ratings[skill.id] || 0;
      }),
      borderColor:         SKILL_LINE_COLORS[skill.id],
      backgroundColor:     SKILL_LINE_COLORS[skill.id] + '22',
      pointBackgroundColor:SKILL_LINE_COLORS[skill.id],
      pointRadius:         5,
      pointHoverRadius:    7,
      tension:             0.4,
      borderWidth:         2.5,
    })),
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 900 },
    plugins: {
      legend: {
        position: 'top',
        labels: { usePointStyle: true, pointStyle: 'circle', font: { family: 'Inter', size: 12 }, padding: 14, color: '#374151' },
      },
      tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.raw} / 4` } },
    },
    scales: {
      x: { ticks: { font: { family: 'Inter', size: 11 }, color: '#6B7280', maxRotation: 30 }, grid: { display: false } },
      y: {
        min: 0, max: 4,
        ticks: { stepSize: 1, font: { family: 'Inter', size: 11 }, color: '#6B7280' },
        grid:  { color: '#F3F4F6' },
        title: { display: true, text: 'Skill Score', font: { family: 'Inter', size: 11 }, color: '#6B7280' },
      },
    },
  };

  return (
    <div className="overall-dashboard">
      {/* Overall Score Ring */}
      <div className="card overall-ring-card">
        <ProgressBar
          value={overallAvg / 4}
          size={160}
          strokeWidth={14}
          color={ringColor}
          label={overallAvg.toFixed(1)}
          sublabel="/ 4"
        />
        <p className="ring-label" style={{ color: ringColor }}>{ringLabel}</p>
        <p className="ring-subtitle">
          Based on {completedCount} of {totalBooks} completed activities
        </p>
      </div>

      {/* Strength highlight */}
      <div className="card highlight-card strength-highlight">
        <div className="highlight-icon">⭐</div>
        <div className="highlight-body">
          <div className="highlight-tag">Strongest Skill Across All Books</div>
          <div className="highlight-name">
            {topSkill.skill?.label} — Avg {topSkill.value?.toFixed(1)} / 4
          </div>
          <div className="highlight-desc">
            {studentName} consistently shows strong {topSkill.skill?.label} abilities throughout the reading journey!
          </div>
        </div>
      </div>

      {/* Developing highlight */}
      <div className="card highlight-card developing-highlight">
        <div className="highlight-icon">🌱</div>
        <div className="highlight-body">
          <div className="highlight-tag">Growing Area</div>
          <div className="highlight-name">
            {developingSkill.skill?.label} — Avg {developingSkill.value?.toFixed(1)} / 4
          </div>
          <div className="highlight-desc">
            With encouragement and fun activities, {studentName}'s {developingSkill.skill?.label} skills are on a wonderful path of growth!
          </div>
        </div>
      </div>

      {/* Line Chart */}
      <div className="card">
        <h3 className="section-title">📈 Skill Growth Across Books</h3>
        <p className="rec-subtitle" style={{ marginBottom: 20 }}>
          Each line shows how one skill has grown across every book {studentName} completed
        </p>
        <div style={{ height: 340, position: 'relative' }}>
          <Line data={lineData} options={lineOptions} />
        </div>
      </div>

      {/* 6 Skill Average Cards */}
      <div className="card">
        <h3 className="section-title">📊 Average Per Skill</h3>
        <div className="skill-avg-cards-grid">
          {SKILLS.map(skill => {
            const avg   = skillAverages[skill.id] || 0;
            const style = avgCardStyle(avg);
            return (
              <div key={skill.id} className="skill-avg-card" style={{ background: style.bg }}>
                <span className="skill-avg-card-emoji">{skill.icon}</span>
                <span className="skill-avg-card-name"  style={{ color: style.color }}>{skill.label}</span>
                <span className="skill-avg-card-value" style={{ color: style.color }}>Avg: {avg.toFixed(1)} / 4</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Milestone Badges */}
      <div className="card">
        <h3 className="section-title">🏅 Milestone Badges</h3>
        <MilestoneBadge currentTier={badgeInfo.tier} />
      </div>

      {/* Rich Feedback */}
      <div className="card insight-card">
        <h3 className="section-title">Our Feedback</h3>
        <p className="insight-text" style={{ marginBottom: 20 }}>{richFeedback}</p>
        <div className="tutor-rec-section">
          <div className="tutor-rec-heading">🎯 Recommended Activities</div>
          <p className="tutor-rec-subtitle">
            Based on {studentName || 'your child'}'s skill profile, here are activities to support growth:
          </p>
          <div className="tutor-rec-skill-label">
            {developingSkill?.skill?.icon} To support {developingSkill?.skill?.label}:
          </div>
          <ul className="tutor-rec-list">
            {devRecs.map(rec => (
              <li key={rec.label} className="tutor-rec-item">
                <span className="tutor-rec-item-icon">{rec.icon}</span>
                {rec.label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Tutor Comment */}
      <div className="card tutor-comment-card">
        <h3 className="section-title">📝 Tutor Observation</h3>
        <p className="tutor-comment-hint">
          Write your overall observation for {studentName}'s parents. This is saved to the database.
        </p>
        <textarea
          className="tutor-comment-textarea"
          placeholder="Write your overall observation for this student's parents…"
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={6}
        />
        <div className="tutor-comment-footer">
          <button
            className="btn-primary tutor-comment-save-btn"
            onClick={handleSaveComment}
            disabled={saving}
          >
            {saving ? '⏳ Saving…' : '💾 Save Comment'}
          </button>
          {saveMsg && <span className="tutor-comment-success">✅ {saveMsg}</span>}
        </div>
      </div>

      {/* Print */}
      <div className="print-row">
        <button className="btn-primary btn-print" onClick={() => window.print()}>
          🖨️ Print Report
        </button>
      </div>

      <SkillLegend />
    </div>
  );
}
