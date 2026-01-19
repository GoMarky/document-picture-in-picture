# @gomarky/picture-in-picture-window-react

> 🖼️ React Hook for Document Picture-in-Picture API

## Installation

```bash
npm install @gomarky/picture-in-picture-window-react
# or
pnpm add @gomarky/picture-in-picture-window-react
# or
yarn add @gomarky/picture-in-picture-window-react
```

## Usage

```tsx
import { useRef } from 'react';
import { usePictureInPictureWindow } from '@gomarky/picture-in-picture-window-react';

function VideoPlayer() {
  const contentRef = useRef<HTMLDivElement>(null);

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
    width: 400,
    height: 300,
    copyStyles: true,
    disallowReturnToOpener: false,
    onOpen: (win) => {
      console.log('PiP opened');
      if (contentRef.current) {
        win.document.body.appendChild(contentRef.current);
      }
    },
    onClose: () => {
      console.log('PiP closed');
      if (contentRef.current) {
        document.body.appendChild(contentRef.current);
      }
    },
  });

  return (
    <div>
      <p>Supported: {isSupported ? 'Yes' : 'No'}</p>
      <p>Open: {isOpen ? 'Yes' : 'No'}</p>

      <div ref={contentRef}>
        <h2>This content will be in PiP window</h2>
        <video src="video.mp4" controls />
      </div>

      <button onClick={open} disabled={!isSupported || isOpen}>
        Open PiP
      </button>
      <button onClick={close} disabled={!isOpen}>
        Close PiP
      </button>
    </div>
  );
}
```

## API

### `usePictureInPictureWindow(options?)`

#### Options

```typescript
interface UsePictureInPictureWindowOptions {
  width?: number;
  height?: number;
  disallowReturnToOpener?: boolean;
  copyStyles?: boolean;
  onOpen?: (pipWindow: Window) => void;
  onClose?: (event: PageTransitionEvent) => void;
}
```

#### Returns

```typescript
interface UsePictureInPictureWindowReturn {
  isSupported: boolean;
  isOpen: boolean;
  pipWindow: Window | null;
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
- ✅ Stable function references (memoized with `useCallback`)
- ✅ Automatic cleanup on unmount
- ✅ Style copying to PiP window
- ✅ React 18+ support

## License

MIT
