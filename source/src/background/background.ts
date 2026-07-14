console.log('[Amazon Scout] Background service worker started');

chrome.runtime.onInstalled.addListener((details) => {
  console.log('[Amazon Scout] Installed:', details.reason);
  if (details.reason === 'install') {
    chrome.storage.local.set({
      sessions: [],
      activeSessionId: null,
      listings: {}
    });
  }
});

export {};