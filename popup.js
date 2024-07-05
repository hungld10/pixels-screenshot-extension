document.addEventListener('DOMContentLoaded', () => {
    // Load the latest screenshot from storage
    chrome.storage.local.get('latestScreenshot', (data) => {
        if (data.latestScreenshot) {
            document.getElementById('screenshot').src = data.latestScreenshot;
        }
    });

    // Capture the browser
    document.getElementById('capture').addEventListener('click', () => {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            // chrome.tabs.captureVisibleTab(null, {format: 'png'}, (dataUrl) => {
            //     // Save the screenshot to local storage
            //     chrome.storage.local.set({latestScreenshot: dataUrl}, () => {
            //         // Update the image in the popup
            //         document.getElementById('screenshot').src = dataUrl;
            //     });
            // });

            chrome.scripting.executeScript({
                target: {tabId: tabs[0].id},
                files: ['dom-to-image-more.min.js']
            }, () => {
                chrome.scripting.executeScript({
                    target: {tabId: tabs[0].id},
                    func: (taskboardClassName) => {
                        const elements = document.querySelectorAll('*');
                        let targetElement = null;
            
                        elements.forEach(element => {
                            if (element.className && element.className.includes(taskboardClassName)) {
                                targetElement = element;
                            }
                        });
            
                        if (targetElement) {
                            return domtoimage.toPng(targetElement)
                                .then(dataUrl => dataUrl)
                                .catch(error => console.error('Error capturing element:', error));
                        } else {
                            return null;
                        }
                    },
                    args: ['Store_storeDialog'] // Element class name
                }, (results) => {
                    const dataUrl = results[0].result;
                    if (dataUrl) {
                        // Save the screenshot to local storage
                        chrome.storage.local.set({latestScreenshot: dataUrl}, () => {
                            // Update the image in the popup
                            document.getElementById('screenshot').src = dataUrl;
                        });
                    } else {
                        // If no specific element is found, capture the full screen
                        chrome.tabs.captureVisibleTab(null, {format: 'png'}, (dataUrl) => {
                        // Save the screenshot to local storage
                            chrome.storage.local.set({latestScreenshot: dataUrl}, () => {
                                // Update the image in the popup
                                document.getElementById('screenshot').src = dataUrl;
                            });
                        });
                    }
                });
            });
        });
    });

    // Add zoom in and zoom out functionality with cursor follow
    const screenshotElement = document.getElementById('screenshot');
    let zoomedIn = false;

    screenshotElement.addEventListener('mousemove', (event) => {
        if (zoomedIn) {
            const rect = screenshotElement.getBoundingClientRect();
            const x = event.clientX - rect.left; // x position within the element
            const y = event.clientY - rect.top; // y position within the element

            const xPercent = (x / rect.width) * 100;
            const yPercent = (y / rect.height) * 100;

            screenshotElement.style.transformOrigin = `${xPercent}% ${yPercent}%`;
        }
    });

    screenshotElement.addEventListener('click', () => {
        if (zoomedIn) {
            screenshotElement.style.transform = 'scale(1)';
            screenshotElement.style.cursor = 'zoom-in';
        } else {
            screenshotElement.style.transform = 'scale(2)';
            screenshotElement.style.cursor = 'zoom-out';
        }
        zoomedIn = !zoomedIn;
    });
});