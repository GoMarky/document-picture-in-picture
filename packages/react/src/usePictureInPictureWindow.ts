import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  PictureInPictureWindow,
  isDocumentPipSupported,
  copyDocumentStylesToWindow,
  type PictureInPictureWindowOptions as CoreOptions,
} from '@gomarky/picture-in-picture-window';

// ============================================================================
// Types
// ============================================================================

export interface UsePictureInPictureWindowOptions {
  /** Width of PiP window */
  width?: number;
  /** Height of PiP window */
  height?: number;
  /** Disallow showing "Return to tab" button */
  disallowReturnToOpener?: boolean;
  /** Automatically copy styles from main document to PiP window */
  copyStyles?: boolean;
  /** Callback when PiP window opens */
  onOpen?: (pipWindow: Window) => void;
  /** Callback when PiP window closes */
  onClose?: (event: PageTransitionEvent) => void;
}

export interface UsePictureInPictureWindowReturn {
  /** Whether Document Picture-in-Picture API is supported in current browser */
  isSupported: boolean;
  /** Whether PiP window is currently open */
  isOpen: boolean;
  /** Reference to current PiP window (or null if closed) */
  pipWindow: Window | null;

  /**
   * Open a new PiP window
   * @returns Promise with Window object or undefined on error
   */
  open: () => Promise<Window | undefined>;

  /** Close PiP window */
  close: () => void;

  /**
   * Resize PiP window
   * @param width - new width
   * @param height - new height
   */
  resize: (width: number, height: number) => void;

  /**
   * Resize PiP window relative to current size
   * @param deltaWidth - width change
   * @param deltaHeight - height change
   */
  resizeBy: (deltaWidth: number, deltaHeight: number) => void;

  /** Focus the main (opener) window */
  focusOpener: () => void;

  /**
   * Copy all styles from main document to specified window
   * @param targetWindow - target window for style copying
   */
  copyStylesToWindow: (targetWindow: Window) => void;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * React hook for working with Document Picture-in-Picture API.
 *
 * @example
 * ```tsx
 * function App() {
 *   const videoRef = useRef<HTMLDivElement>(null);
 *   const { isSupported, isOpen, pipWindow, open, close } = usePictureInPictureWindow({
 *     width: 400,
 *     height: 300,
 *     copyStyles: true,
 *     onOpen: (win) => {
 *       if (videoRef.current) {
 *         win.document.body.appendChild(videoRef.current);
 *       }
 *     },
 *     onClose: () => {
 *       if (videoRef.current) {
 *         document.body.appendChild(videoRef.current);
 *       }
 *     },
 *   });
 *
 *   return (
 *     <div>
 *       <div ref={videoRef}>Content for PiP</div>
 *       <button onClick={isOpen ? close : open}>
 *         {isOpen ? 'Close PiP' : 'Open PiP'}
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @see https://developer.chrome.com/docs/web-platform/document-picture-in-picture
 */
export function usePictureInPictureWindow(
  options: UsePictureInPictureWindowOptions = {},
): UsePictureInPictureWindowReturn {
  const {
    width,
    height,
    disallowReturnToOpener = false,
    copyStyles = true,
    onOpen,
    onClose,
  } = options;

  // State
  const [isOpen, setIsOpen] = useState(false);
  const [pipWindow, setPipWindow] = useState<Window | null>(null);

  // Refs for callbacks (to avoid recreating PictureInPictureWindow)
  const onOpenRef = useRef(onOpen);
  const onCloseRef = useRef(onClose);

  // Update refs when callbacks change
  useEffect(() => {
    onOpenRef.current = onOpen;
  }, [onOpen]);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Memoize isSupported
  const isSupported = useMemo(() => isDocumentPipSupported(), []);

  // Create and manage core instance
  const pipRef = useRef<PictureInPictureWindow | null>(null);

  useEffect(() => {
    const coreOptions: CoreOptions = {
      width,
      height,
      disallowReturnToOpener,
      copyStyles,
      onOpen: (win) => {
        setPipWindow(win);
        setIsOpen(true);
        onOpenRef.current?.(win);
      },
      onClose: (event) => {
        setPipWindow(null);
        setIsOpen(false);
        onCloseRef.current?.(event);
      },
    };

    const pip = new PictureInPictureWindow(coreOptions);
    pipRef.current = pip;

    // Subscribe to state changes
    const unsubscribe = pip.on('statechange', (state) => {
      setIsOpen(state.isOpen);
      setPipWindow(state.pipWindow);
    });

    return () => {
      unsubscribe();
      pip.dispose();
      pipRef.current = null;
    };
  }, [width, height, disallowReturnToOpener, copyStyles]);

  // Methods
  const open = useCallback(async (): Promise<Window | undefined> => {
    return pipRef.current?.open();
  }, []);

  const close = useCallback((): void => {
    pipRef.current?.close();
  }, []);

  const resize = useCallback((newWidth: number, newHeight: number): void => {
    pipRef.current?.resize(newWidth, newHeight);
  }, []);

  const resizeBy = useCallback((deltaWidth: number, deltaHeight: number): void => {
    pipRef.current?.resizeBy(deltaWidth, deltaHeight);
  }, []);

  const focusOpener = useCallback((): void => {
    pipRef.current?.focusOpener();
  }, []);

  const copyStylesToWindowFn = useCallback((targetWindow: Window): void => {
    copyDocumentStylesToWindow(targetWindow);
  }, []);

  return {
    isSupported,
    isOpen,
    pipWindow,
    open,
    close,
    resize,
    resizeBy,
    focusOpener,
    copyStylesToWindow: copyStylesToWindowFn,
  };
}
