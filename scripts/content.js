// Function to read list items and get data
function readListTaskItems() {
    const targetClassName = 'Store_card-content';
    const targetDivs = document.querySelectorAll(`div.${targetClassName}`);
    const items = [];

    const divs = document.querySelectorAll('div');
    for (let div of divs) {
        if (div.className.includes(targetClassName)) {
            const skippedClassName = 'Store_card-content-wrapper';
            if (div.className.includes(skippedClassName)) {
                continue;
            }
            
            items.push(div.outerHTML);
        }
    }

    return items;
}

document.addEventListener('DOMContentLoaded', () => {
    const taskboardContent = readListTaskItems();
    chrome.runtime.sendMessage({ action: 'readTaskboardView', data: taskboardContent });
});