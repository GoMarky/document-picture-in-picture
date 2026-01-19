# @gomarky/picture-in-picture-window

> 🖼️ Document Picture-in-Picture API wrapper for React, Vue, and Vanilla JavaScript

[![npm version](https://img.shields.io/npm/v/@gomarky/picture-in-picture-window.svg)](https://www.npmjs.com/package/@gomarky/picture-in-picture-window)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A set of libraries for working with the [Document Picture-in-Picture API](https://developer.chrome.com/docs/web-platform/document-picture-in-picture), allowing you to open any HTML content in a floating Picture-in-Picture window.

## 📦 Packages

| Package | Description |
|---------|-------------|
| [`@gomarky/picture-in-picture-window`](./packages/core) | Core library (Vanilla JS/TS) |
| [`@gomarky/picture-in-picture-window-vue`](./packages/vue) | Vue 3 Composable |
| [`@gomarky/picture-in-picture-window-react`](./packages/react) | React Hook |

## ✨ Features

- 🎯 **Simple API** - Easy to use with any framework
- 📱 **Framework Support** - React, Vue 3, and Vanilla JS
- 🎨 **Style Copying** - Automatically copies styles to PiP window
- 📐 **Resizable** - Control window dimensions programmatically
- 🔄 **Reactive State** - Full reactive state management
- 📦 **Tree-shakeable** - Only import what you need
- 💪 **TypeScript** - Full TypeScript support

## 🚀 Quick Start

### Installation

```bash
# Vanilla JavaScript / TypeScript
npm install @gomarky/picture-in-picture-window

# Vue 3
npm install @gomarky/picture-in-picture-window-vue

# React
npm install @gomarky/picture-in-picture-window-react
```

### Vanilla JavaScript

```typescript
import { PictureInPictureWindow } from '@gomarky/picture-in-picture-window';

const pip = new PictureInPictureWindow({
  width: 400,
  height: 300,
  copyStyles: true,
  onOpen: (win) => {
    win.document.body.appendChild(myElement);
  },
  onClose: () => {
    document.body.appendChild(myElement);
  },
});

// Open PiP window
await pip.open();

// Close PiP window
pip.close();

// Cleanup when done
pip.dispose();
```

### Vue 3

```vue
<script setup>
import { ref } from 'vue';
import { usePictureInPictureWindow } from '@gomarky/picture-in-picture-window-vue';

const contentRef = ref<HTMLElement>();

const { isSupported, isOpen, open, close } = usePictureInPictureWindow({
  width: 400,
  height: 300,
  copyStyles: true,
  onOpen: (win) => {
    win.document.body.appendChild(contentRef.value);
  },
  onClose: () => {
    document.body.appendChild(contentRef.value);
  },
});
</script>

<template>
  <div ref="contentRef">Content for PiP window</div>
  <button @click="isOpen ? close() : open()">
    {{ isOpen ? 'Close' : 'Open' }} PiP
  </button>
</template>
```

### React

```tsx
import { useRef } from 'react';
import { usePictureInPictureWindow } from '@gomarky/picture-in-picture-window-react';

function App() {
  const contentRef = useRef<HTMLDivElement>(null);

  const { isSupported, isOpen, open, close } = usePictureInPictureWindow({
    width: 400,
    height: 300,
    copyStyles: true,
    onOpen: (win) => {
      if (contentRef.current) {
        win.document.body.appendChild(contentRef.current);
      }
    },
    onClose: () => {
      if (contentRef.current) {
        document.body.appendChild(contentRef.current);
      }
    },
  });

  return (
    <>
      <div ref={contentRef}>Content for PiP window</div>
      <button onClick={isOpen ? close : open}>
        {isOpen ? 'Close' : 'Open'} PiP
      </button>
    </>
  );
}
```

## 📖 API Reference

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `width` | `number` | - | Width of PiP window in pixels |
| `height` | `number` | - | Height of PiP window in pixels |
| `disallowReturnToOpener` | `boolean` | `false` | Disallow "Return to tab" button |
| `copyStyles` | `boolean` | `true` | Copy styles to PiP window |
| `onOpen` | `(window: Window) => void` | - | Callback when window opens |
| `onClose` | `(event: PageTransitionEvent) => void` | - | Callback when window closes |

### Return Values

| Property/Method | Type | Description |
|-----------------|------|-------------|
| `isSupported` | `boolean` | Whether API is supported |
| `isOpen` | `boolean` | Whether window is open |
| `pipWindow` | `Window \| null` | Reference to PiP window |
| `open()` | `() => Promise<Window \| undefined>` | Open PiP window |
| `close()` | `() => void` | Close PiP window |
| `resize(width, height)` | `(number, number) => void` | Resize window |
| `resizeBy(dw, dh)` | `(number, number) => void` | Resize relatively |
| `focusOpener()` | `() => void` | Focus main window |
| `copyStylesToWindow(win)` | `(Window) => void` | Copy styles to window |

## 🖥️ Browser Support

Document Picture-in-Picture API is supported in:
- Chrome 116+
- Edge 116+

Check support with `isSupported` property before using.

## 🧪 Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Run example apps
pnpm dev:vanilla  # http://localhost:3000
pnpm dev:vue      # http://localhost:3001
pnpm dev:react    # http://localhost:3002
```

## 📤 Publishing

All three packages are published separately to npm using [changesets](https://github.com/changesets/changesets).

```bash
# 1. Create a changeset (describe what changed)
pnpm changeset

# 2. Update versions based on changesets
pnpm changeset version

# 3. Build and publish all packages
pnpm release
```

This will publish:
- `@gomarky/picture-in-picture-window` - Core library
- `@gomarky/picture-in-picture-window-vue` - Vue 3 composable
- `@gomarky/picture-in-picture-window-react` - React hook

## 📄 License

MIT © [gomarky](https://github.com/gomarky)

## 🔗 Links

- [Document Picture-in-Picture API Documentation](https://developer.chrome.com/docs/web-platform/document-picture-in-picture)
- [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Document_Picture-in-Picture_API)
