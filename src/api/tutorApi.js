/**
 * tutorApi.js
 * 
 * All data fetching goes through the Wix postMessage bridge (wixBridge).
 * The Wix parent page handles the actual wixData queries and sends results back.
 * This avoids all CORS issues entirely.
 */
import { sendToWix } from './wixBridge';

/**
 * Fetch all students in a tutor's batch.
 * Wix page must handle message type: 'FETCH_STUDENTS'
 * Expected response data: { students: [...] }
 */
export async function fetchBatchStudents(tutorId, batchName) {
  return sendToWix('FETCH_STUDENTS', { tutorId, batchName });
}

/**
 * Fetch all book scores for a student.
 * Wix page must handle message type: 'FETCH_STUDENT_SCORES'
 * Expected response data: { scores: [...], skillScores: {...}, activities: [...] }
 */
export async function fetchStudentScores(studentId) {
  return sendToWix('FETCH_STUDENT_SCORES', { studentId });
}

/**
 * Save book skill scores for a student.
 * Wix page must handle message type: 'SAVE_BOOK_SCORES'
 * Expected response data: { success: true }
 */
export async function saveBookScores(data) {
  return sendToWix('SAVE_BOOK_SCORES', { payload: data });
}

/**
 * Save a tutor's comment for a student.
 * Wix page must handle message type: 'SAVE_TUTOR_COMMENT'
 * Expected response data: { success: true }
 */
export async function saveTutorComment(studentId, comment) {
  return sendToWix('SAVE_TUTOR_COMMENT', { studentId, comment });
}

/**
 * Delete a book score for a student (Undo action).
 * Wix page must handle message type: 'DELETE_BOOK_SCORE'
 * Expected response data: { success: true }
 */
export async function deleteBookScore(studentId, bookKey) {
  return sendToWix('DELETE_BOOK_SCORE', { studentId, bookKey });
}
