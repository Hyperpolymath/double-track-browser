/**
 * Content script for DoubleTrack Browser
 *
 * This script runs in the context of web pages and can:
 * - Monitor page interactions (if enabled)
 * - Inject simulated activity markers (future feature)
 * - Coordinate with background service for timing
 */

console.log("DoubleTrack Browser: Content script loaded");

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case "PING":
      sendResponse({ status: "alive" });
      break;

    case "GET_PAGE_INFO":
      sendResponse({
        url: window.location.href,
        title: document.title,
        timestamp: Date.now(),
      });
      break;

    default:
      sendResponse({ error: "Unknown message type" });
  }

  return true;
});

/**
 * Privacy protection: Ensure real browsing data is never leaked
 * This is a placeholder for future privacy safeguards
 */
function ensurePrivacy(): void {
  // Future: Implement additional privacy protections
  // - Prevent fingerprinting of simulated vs real activity
  // - Ensure storage separation
  // - Monitor for data leakage
}

ensurePrivacy();

export {};
