<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { usePictureInPictureWindow } from '@gomarky/picture-in-picture-window-vue';

// Refs for inputs
const width = ref(400);
const height = ref(300);
const pipContentRef = ref<HTMLElement | null>(null);
const currentTime = ref('00:00:00');

let timeInterval: number | undefined;

// Use the composable with reactive dimensions
const { isSupported, isOpen, pipWindow, open, close, resize, focusOpener } = usePictureInPictureWindow({
  width,
  height,
  copyStyles: true,
  onOpen: (win) => {
    console.log('PiP window opened!', win);
    if (pipContentRef.value) {
      win.document.body.appendChild(pipContentRef.value);
    }
  },
  onClose: () => {
    console.log('PiP window closed!');
    // Content is automatically returned to DOM by Vue's reactivity
  },
});

// Computed properties
const buttonText = computed(() => (isOpen.value ? 'Close PiP Window' : 'Open PiP Window'));

// Methods
async function togglePip() {
  if (isOpen.value) {
    close();
  } else {
    await open();
  }
}

function handleResize() {
  resize(500, 400);
}

function updateTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  currentTime.value = `${hours}:${minutes}:${seconds}`;
}

onMounted(() => {
  updateTime();
  timeInterval = window.setInterval(updateTime, 1000);
});

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
});
</script>

<template>
  <div class="container">
    <header>
      <h1>🖼️ Picture-in-Picture Window</h1>
      <p class="subtitle">Vue 3 Composable Demo</p>
      <div class="vue-badge">
        <svg width="16" height="16" viewBox="0 0 256 221" fill="currentColor">
          <path d="M204.8 0H256L128 220.8 0 0h97.92L128 51.2 157.44 0h47.36z" />
          <path d="M0 0l128 220.8L256 0h-51.2L128 132.48 51.2 0H0z" opacity="0.5" />
        </svg>
        Vue 3
      </div>
    </header>

    <div class="status-bar">
      <div class="status-item">
        <span class="status-dot" :class="{ active: isSupported }"></span>
        <span>{{ isSupported ? 'API Supported' : 'Not Supported' }}</span>
      </div>
      <div class="status-item">
        <span class="status-dot" :class="{ active: isOpen }"></span>
        <span>{{ isOpen ? 'Window open' : 'Window closed' }}</span>
      </div>
    </div>

    <div class="card">
      <h2 class="card-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
        Controls
      </h2>

      <div class="input-group">
        <div class="input-wrapper">
          <label for="width">Width (px)</label>
          <input type="number" id="width" v-model.number="width" min="200" max="800" />
        </div>
        <div class="input-wrapper">
          <label for="height">Height (px)</label>
          <input type="number" id="height" v-model.number="height" min="150" max="600" />
        </div>
      </div>

      <div class="controls">
        <button class="btn-primary" @click="togglePip" :disabled="!isSupported">
          <svg v-if="!isOpen" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 3h6v6M14 10l7-7M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/>
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          {{ buttonText }}
        </button>
        <button class="btn-secondary" @click="handleResize" :disabled="!isOpen">
          Resize to 500x400
        </button>
        <button class="btn-secondary" @click="focusOpener" :disabled="!isOpen">
          Focus Main Window
        </button>
      </div>
    </div>

    <div class="card">
      <h2 class="card-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="23 7 16 12 23 17 23 7"></polygon>
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
        </svg>
        PiP Content
      </h2>
      <p style="color: var(--text-secondary); margin-bottom: 1rem;">
        This content will be moved to the Picture-in-Picture window when opened.
      </p>
      <div ref="pipContentRef" class="pip-content" :class="{ 'in-pip': isOpen }">
        <div class="video-placeholder">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          <span>Video Player Placeholder</span>
        </div>
        <p>Current time: <code>{{ currentTime }}</code></p>
      </div>
    </div>

    <div v-if="!isSupported" class="not-supported">
      ⚠️ Document Picture-in-Picture API is not supported in your browser.
      <br />
      Please use Chrome 116+ or Edge 116+.
    </div>
  </div>
</template>
