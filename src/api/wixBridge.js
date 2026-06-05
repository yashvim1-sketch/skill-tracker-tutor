/**
 * wixBridge.js
 * 
 * Instead of making HTTP fetch() calls to Wix (which causes CORS),
 * we send postMessage requests to the parent Wix page.
 * The Wix page uses wixData directly (no CORS) and sends the result back.
 * 
 * Flow:
 *   React → window.parent.postMessage({ type, requestId, ...payload })
 *   Wix page → $w('#html1').onMessage → wixData.query → $w('#html1').postMessage({ requestId, data })
 *   React ← window.addEventListener('message') → resolve promise
 */

const pendingRequests = {};
let requestIdCounter = 0;

// Listen for all responses from the Wix parent page
window.addEventListener('message', (event) => {
  const msg = event.data;
  if (!msg || !msg.requestId) return;

  const pending = pendingRequests[msg.requestId];
  if (!pending) return;

  clearTimeout(pending.timer);
  delete pendingRequests[msg.requestId];

  if (msg.error) {
    pending.reject(new Error(msg.error));
  } else {
    pending.resolve(msg.data);
  }
});

/**
 * Send a request to the Wix page and wait for the response.
 * @param {string} type - Message type (e.g. 'FETCH_STUDENTS')
 * @param {object} payload - Additional data to send
 * @param {number} timeoutMs - How long to wait before failing (default 12s)
 */
export function sendToWix(type, payload = {}, timeoutMs = 12000) {
  return new Promise((resolve, reject) => {
    const requestId = ++requestIdCounter;

    const timer = setTimeout(() => {
      delete pendingRequests[requestId];
      reject(new Error(`Wix did not respond to "${type}" within ${timeoutMs / 1000}s. Make sure the Wix page code is set up correctly.`));
    }, timeoutMs);

    pendingRequests[requestId] = { resolve, reject, timer };

    // Send to parent Wix page
    window.parent.postMessage({ type, requestId, ...payload }, '*');
  });
}
