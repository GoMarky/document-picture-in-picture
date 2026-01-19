# @gomarky/picture-in-picture-window

> 🖼️ Document Picture-in-Picture API wrapper for Vanilla JavaScript/TypeScript

## Installation

```bash
npm install @gomarky/picture-in-picture-window
# or
pnpm add @gomarky/picture-in-picture-window
# or
yarn add @gomarky/picture-in-picture-window
```

## Usage

```typescript
import { PictureInPictureWindow, isDocumentPipSupported } from '@gomarky/picture-in-picture-window';

// Check support
if (!isDocumentPipSupported()) {
  console.log('Document Picture-in-Picture is not supported');
}

// Create instance
const pip = new PictureInPictureWindow({
  width: 400,
  height: 300,
  copyStyles: true,
  onOpen: (pipWindow) => {
    // Move content to PiP window
    pipWindow.document.body.appendChild(myElement);
  },
  onClose: () => {
    // Move content back
    document.body.appendChild(myElement);
  },
});

// Open PiP window
const window = await pip.open();

// Resize window
pip.resize(500, 400);

// Close window
pip.close();

// Subscribe to events
pip.on('statechange', (state) => {
  console.log('State changed:', state);
});

// Cleanup
pip.dispose();
```

## API

### `PictureInPictureWindow`

Main class for managing PiP windows.

#### Constructor Options

```typescript
interface PictureInPictureWindowOptions {
  width?: number;
  height?: number;
  disallowReturnToOpener?: boolean;
  copyStyles?: boolean;
  onOpen?: (pipWindow: Window) => void;
  onClose?: (event: PageTransitionEvent) => void;
}
```

#### Properties

- `isSupported: boolean` - Whether API is supported
- `isOpen: boolean` - Whether window is currently open
- `pipWindow: Window | null` - Reference to PiP window
- `state: PictureInPictureWindowState` - Current state object

#### Methods

- `open(): Promise<Window | undefined>` - Open PiP window
- `close(): void` - Close PiP window
- `resize(width: number, height: number): void` - Resize window
- `resizeBy(deltaWidth: number, deltaHeight: number): void` - Resize relatively
- `focusOpener(): void` - Focus main window
- `copyStylesToWindow(targetWindow: Window): void` - Copy styles
- `updateOptions(options: Partial<Options>): void` - Update options
- `on(type, listener): () => void` - Subscribe to events
- `off(type, listener): void` - Unsubscribe from events
- `dispose(): void` - Cleanup resources

### Utility Functions

- `isDocumentPipSupported(): boolean` - Check API support
- `copyDocumentStylesToWindow(targetWindow: Window): void` - Copy styles

## License

MIT
