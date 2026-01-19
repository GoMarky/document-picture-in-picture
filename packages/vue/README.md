# @gomarky/picture-in-picture-window-vue

> 🖼️ Vue 3 Composable for Document Picture-in-Picture API

## Installation

```bash
npm install @gomarky/picture-in-picture-window-vue
# or
pnpm add @gomarky/picture-in-picture-window-vue
# or
yarn add @gomarky/picture-in-picture-window-vue
```

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { usePictureInPictureWindow } from '@gomarky/picture-in-picture-window-vue';

const contentRef = ref<HTMLElement>();

// Reactive dimensions
const width = ref(400);
const height = ref(300);

const {
  isSupported,
  isOpen,
  pipWindow,
  open,
  close,
  resize,
  resizeBy,
  focusOpener,
  copyStylesToWindow,
} = usePictureInPictureWindow({
  width,  // Reactive!
  height, // Reactive!
  copyStyles: true,
  disallowReturnToOpener: false,
  onOpen: (win) => {
    console.log('PiP opened');
    win.document.body.appendChild(contentRef.value!);
  },
  onClose: () => {
    console.log('PiP closed');
    document.body.appendChild(contentRef.value!);
  },
});
</script>

<template>
  <div>
    <p>Supported: {{ isSupported }}</p>
    <p>Open: {{ isOpen }}</p>
    
    <div ref="contentRef">
      <h2>This content will be in PiP window</h2>
    </div>
    
    <button @click="open" :disabled="!isSupported || isOpen">
      Open PiP
    </button>
    <button @click="close" :disabled="!isOpen">
      Close PiP
    </button>
  </div>
</template>
```

## API

### `usePictureInPictureWindow(options?)`

#### Options

```typescript
interface UsePictureInPictureWindowOptions {
  width?: MaybeRefOrGetter<number>;      // Reactive width
  height?: MaybeRefOrGetter<number>;     // Reactive height
  disallowReturnToOpener?: boolean;
  copyStyles?: boolean;
  onOpen?: (pipWindow: Window) => void;
  onClose?: (event: PageTransitionEvent) => void;
}
```

#### Returns

```typescript
interface UsePictureInPictureWindowReturn {
  isSupported: ComputedRef<boolean>;
  isOpen: Readonly<Ref<boolean>>;
  pipWindow: ShallowRef<Window | null>;
  open: () => Promise<Window | undefined>;
  close: () => void;
  resize: (width: number, height: number) => void;
  resizeBy: (deltaWidth: number, deltaHeight: number) => void;
  focusOpener: () => void;
  copyStylesToWindow: (targetWindow: Window) => void;
}
```

## Features

- ✅ Full TypeScript support
- ✅ Reactive dimensions (use `ref()` for width/height)
- ✅ Automatic cleanup on scope dispose
- ✅ Style copying to PiP window
- ✅ Readonly state refs

## License

MIT
