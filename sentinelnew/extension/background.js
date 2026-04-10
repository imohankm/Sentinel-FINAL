// Background service worker for handling cross-origin POSTs if needed.
// Currently acts as a relay if we want to run stealth analysis later.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'runAnalysis') {
        fetch('http://localhost:8000/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(message.payload)
        })
        .then(response => response.json())
        .then(data => sendResponse({ success: true, ...data }))
        .catch(err => {
            console.error('FastAPI Backend Error:', err);
            sendResponse({ success: false, error: err.message });
        });
        
        return true; // Keep message channel open for async fetch
    }
});

chrome.action.onClicked.addListener((tab) => {
    if (tab.id) {
        chrome.tabs.sendMessage(tab.id, { action: 'TOGGLE_PANEL' }).catch(() => {});
    }
});
