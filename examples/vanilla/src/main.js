import { PictureInPictureWindow } from '@gomarky/picture-in-picture-window';
// DOM Elements
const supportStatus = document.getElementById('supportStatus');
const supportText = document.getElementById('supportText');
const openStatus = document.getElementById('openStatus');
const openText = document.getElementById('openText');
const toggleBtn = document.getElementById('toggleBtn');
const resizeBtn = document.getElementById('resizeBtn');
const focusBtn = document.getElementById('focusBtn');
const widthInput = document.getElementById('width');
const heightInput = document.getElementById('height');
const pipContent = document.getElementById('pipContent');
const currentTimeEl = document.getElementById('currentTime');
const notSupported = document.getElementById('notSupported');
// Original parent for restoring content
let originalParent = null;
// Create PiP instance
const pip = new PictureInPictureWindow({
    width: 400,
    height: 300,
    copyStyles: true,
    onOpen: (pipWindow) => {
        console.log('PiP window opened!', pipWindow);
        // Save original parent and move content to PiP window
        originalParent = pipContent.parentElement;
        pipWindow.document.body.appendChild(pipContent);
        pipContent.classList.add('in-pip');
        updateUI();
    },
    onClose: () => {
        console.log('PiP window closed!');
        // Move content back to original parent
        if (originalParent) {
            originalParent.appendChild(pipContent);
            pipContent.classList.remove('in-pip');
        }
        updateUI();
    },
});
// Update UI based on state
function updateUI() {
    const isSupported = pip.isSupported;
    const isOpen = pip.isOpen;
    // Support status
    if (isSupported) {
        supportStatus.classList.add('active');
        supportText.textContent = 'API Supported';
        toggleBtn.disabled = false;
        notSupported.style.display = 'none';
    }
    else {
        supportStatus.classList.remove('active');
        supportStatus.classList.add('warning');
        supportText.textContent = 'Not Supported';
        toggleBtn.disabled = true;
        notSupported.style.display = 'block';
    }
    // Open status
    if (isOpen) {
        openStatus.classList.add('active');
        openText.textContent = 'Window open';
        toggleBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
      Close PiP Window
    `;
        resizeBtn.disabled = false;
        focusBtn.disabled = false;
    }
    else {
        openStatus.classList.remove('active');
        openText.textContent = 'Window closed';
        toggleBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M15 3h6v6M14 10l7-7M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/>
      </svg>
      Open PiP Window
    `;
        resizeBtn.disabled = true;
        focusBtn.disabled = true;
    }
}
// Event handlers
toggleBtn.addEventListener('click', async () => {
    if (pip.isOpen) {
        pip.close();
    }
    else {
        // Update dimensions from inputs
        pip.updateOptions({
            width: parseInt(widthInput.value, 10),
            height: parseInt(heightInput.value, 10),
        });
        await pip.open();
    }
});
resizeBtn.addEventListener('click', () => {
    pip.resize(500, 400);
});
focusBtn.addEventListener('click', () => {
    pip.focusOpener();
});
// Update current time display
function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    currentTimeEl.textContent = `${hours}:${minutes}:${seconds}`;
}
setInterval(updateTime, 1000);
updateTime();
// Initial UI update
updateUI();
// Subscribe to state changes
pip.on('statechange', () => {
    updateUI();
});
