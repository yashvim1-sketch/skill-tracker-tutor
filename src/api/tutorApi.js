const WIX_API = 'https://bhansaliaesha.wixsite.com/website/_functions';


export async function fetchBatchStudents(tutorId, batchName) {
  try {
    const url = `${WIX_API}/batchStudents?tutorId=${encodeURIComponent(tutorId)}&batchName=${encodeURIComponent(batchName)}&t=${Date.now()}`;
    const res = await fetch(url, { 
      method: 'GET', 
      mode: 'cors',
      cache: 'no-store',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("API Error Response:", text);
      throw new Error(`Status ${res.status}: ${text}`);
    }
    return await res.json();
  } catch (error) {
    console.error("fetchBatchStudents error:", error);
    throw error;
  }
}

export async function fetchStudentScores(studentId) {
  try {
    const url = `${WIX_API}/studentScores?studentId=${encodeURIComponent(studentId)}&t=${Date.now()}`;
    const res = await fetch(url, { 
      method: 'GET', 
      mode: 'cors',
      cache: 'no-store',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("API Error Response:", text);
      throw new Error(`Status ${res.status}: ${text}`);
    }
    return await res.json();
  } catch (error) {
    console.error("fetchStudentScores error:", error);
    throw error;
  }
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
