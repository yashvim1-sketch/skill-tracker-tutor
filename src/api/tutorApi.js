const WIX_API = 'https://bhansaliaesha.wixsite.com/website/_functions';

export async function fetchTutorBatches(tutorId) {
  const res = await fetch(`${WIX_API}/tutorBatches?tutorId=${encodeURIComponent(tutorId)}`);
  if (!res.ok) throw new Error(`Failed to fetch batches: ${res.status}`);
  return res.json(); // { batches: [{batchName, studentCount}] }
}

export async function fetchBatchStudents(tutorId, batchName) {
  const res = await fetch(
    `${WIX_API}/batchStudents?tutorId=${encodeURIComponent(tutorId)}&batchName=${encodeURIComponent(batchName)}`
  );
  if (!res.ok) throw new Error(`Failed to fetch students: ${res.status}`);
  return res.json(); // { students: [{memberId, fullName, email, batchName, tutorComment}] }
}

export async function fetchStudentScores(studentId) {
  const res = await fetch(`${WIX_API}/studentScores?studentId=${encodeURIComponent(studentId)}`);
  if (!res.ok) throw new Error(`Failed to fetch scores: ${res.status}`);
  return res.json(); // { scores: [{bookKey, bookName, cognitive, ...}] }
}

export async function saveBookScores(data) {
  const res = await fetch(`${WIX_API}/saveBookScores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to save scores: ${res.status}`);
  return res.json(); // { success: true }
}

export async function saveTutorComment(studentId, comment) {
  const res = await fetch(`${WIX_API}/saveTutorComment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, comment }),
  });
  if (!res.ok) throw new Error(`Failed to save comment: ${res.status}`);
  return res.json(); // { success: true }
}
