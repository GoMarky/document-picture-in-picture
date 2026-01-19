// ============================================================================
// Global Type Augmentation
// ============================================================================

declare global {
  /**
   * Options for creating Document Picture-in-Picture window
   * @see https://developer.chrome.com/docs/web-platform/document-picture-in-picture
   */
  interface DocumentPictureInPictureOptions {
    /** Width of PiP window in pixels */
    width?: number;
    /** Height of PiP window in pixels */
    height?: number;
    /** Disallow showing "Return to tab" button in PiP window */
    disallowReturnToOpener?: boolean;
  }

  interface DocumentPictureInPictureEvent extends Event {
    readonly window: Window;
  }

  interface DocumentPictureInPictureEventMap {
    enter: DocumentPictureInPictureEvent;
  }

  /**
   * Document Picture-in-Picture API
   * @see https://developer.chrome.com/docs/web-platform/document-picture-in-picture
   */
  interface DocumentPictureInPicture extends EventTarget {
    /**
     * Opens a new PiP window
     * @param options - window options (size and behavior)
     * @returns Promise with Window object of the new PiP window
     */
    requestWindow(options?: DocumentPictureInPictureOptions): Promise<Window>;

    /** Currently open PiP window or null */
    readonly window: Window | null;

    addEventListener<K extends keyof DocumentPictureInPictureEventMap>(
      type: K,
      listener: (ev: DocumentPictureInPictureEventMap[K]) => void,
      options?: boolean | AddEventListenerOptions,
    ): void;

    addEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ): void;

    removeEventListener<K extends keyof DocumentPictureInPictureEventMap>(
      type: K,
      listener: (ev: DocumentPictureInPictureEventMap[K]) => void,
      options?: boolean | EventListenerOptions,
    ): void;

    removeEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | EventListenerOptions,
    ): void;
  }

  interface Window {
    documentPictureInPicture?: DocumentPictureInPicture;
  }
}

// ============================================================================
// Library Types
// ============================================================================

/**
 * Options for PictureInPictureWindow
 */
export interface PictureInPictureWindowOptions {
  /** Width of PiP window in pixels */
  width?: number;
  /** Height of PiP window in pixels */
  height?: number;
  /** Disallow showing "Return to tab" button in PiP window */
  disallowReturnToOpener?: boolean;
  /** Automatically copy styles from main document to PiP window */
  copyStyles?: boolean;
  /** Callback when PiP window opens */
  onOpen?: (pipWindow: Window) => void;
  /** Callback when PiP window closes */
  onClose?: (event: PageTransitionEvent) => void;
}

/**
 * State of PictureInPictureWindow
 */
export interface PictureInPictureWindowState {
  /** Whether Document Picture-in-Picture API is supported in current browser */
  isSupported: boolean;
  /** Whether PiP window is currently open */
  isOpen: boolean;
  /** Reference to current PiP window (or null if closed) */
  pipWindow: Window | null;
}

/**
 * Event types for PictureInPictureWindow
 */
export type PictureInPictureWindowEventType = 'open' | 'close' | 'statechange';

/**
 * Event listener for PictureInPictureWindow
 */
export type PictureInPictureWindowEventListener = (state: PictureInPictureWindowState) => void;
