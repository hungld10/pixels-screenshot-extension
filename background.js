chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        checkAndInjectScript(tabId, tab.url);
    }
});

chrome.tabs.onActivated.addListener(activeInfo => {
    chrome.tabs.get(activeInfo.tabId, tab => {
        checkAndInjectScript(tab.id, tab.url);
    });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'readTaskboardView') {
        const taskboardContent = message.data;
        console.log('HTML content received:', taskboardContent);
        
        // Perform any updates or processing needed
        // For example, saving the HTML content to storage
        chrome.storage.sync.set({ taskboardContent: taskboardContent }, () => {
            console.log('HTML content saved.');
        });
    }
});

function checkAndInjectScript(tabId, url) {
    const definedUrlPattern = 'https://play.pixels.xyz';
    const targetClassSubstring = 'Store_store-tab';

    if (url.includes(definedUrlPattern)) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: () => {
                const divs = document.querySelectorAll('div');
                for (let div of divs) {
                    if (div.className.includes(targetClassSubstring)) {
                        return true;
                    }
                }
                return false;
            }
        }, (results) => {
            if (results[0].result) {
                // If the target div exists, inject the content script
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ['scripts/content.js']
                });
            }
        });
    }
}

// Periodically check the active tab
setInterval(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
            const tab = tabs[0];
            checkAndInjectScript(tab.id, tab.url);
        }
    });
}, 15000); // Check every 15 seconds