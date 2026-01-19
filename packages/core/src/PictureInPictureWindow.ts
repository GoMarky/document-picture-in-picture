import type {
  PictureInPictureWindowOptions,
  PictureInPictureWindowState,
  PictureInPictureWindowEventType,
  PictureInPictureWindowEventListener,
} from './types';
import { isDocumentPipSupported, copyDocumentStylesToWindow } from './utils';

/**
 * Class for working with Document Picture-in-Picture API.
 *
 * @example
 * ```ts
 * const pip = new PictureInPictureWindow({
 *   width: 400,
 *   height: 300,
 *   copyStyles: true,
 *   onOpen: (win) => {
 *     win.document.body.appendChild(myElement);
 *   },
 *   onClose: () => {
 *     document.body.appendChild(myElement);
 *   },
 * });
 *
 * // Open PiP window
 * await pip.open();
 *
 * // Close PiP window
 * pip.close();
 *
 * // Cleanup when done
 * pip.dispose();
 * ```
 *
 * @see https://developer.chrome.com/docs/web-platform/document-picture-in-picture
 */
export class PictureInPictureWindow {
  private _options: PictureInPictureWindowOptions;
  private _pipWindow: Window | null = null;
  private _isOpen = false;
  private _listeners = new Map<PictureInPictureWindowEventType, Set<PictureInPictureWindowEventListener>>();
  private _boundHandlePageHide: (event: PageTransitionEvent) => void;
  private _boundHandleEnter: (event: DocumentPictureInPictureEvent) => void;

  constructor(options: PictureInPictureWindowOptions = {}) {
    this._options = {
      disallowReturnToOpener: false,
      copyStyles: true,
      ...options,
    };

    this._boundHandlePageHide = this._handlePageHide.bind(this);
    this._boundHandleEnter = this._handleEnter.bind(this);

    // Setup event listener for external PiP opens
    if (this.isSupported && window.documentPictureInPicture) {
      window.documentPictureInPicture.addEventListener('enter', this._boundHandleEnter);
    }
  }

  // ============================================================================
  // Getters
  // ============================================================================

  /**
   * Whether Document Picture-in-Picture API is supported in current browser
   */
  get isSupported(): boolean {
    return isDocumentPipSupported();
  }

  /**
   * Whether PiP window is currently open
   */
  get isOpen(): boolean {
    return this._isOpen;
  }

  /**
   * Reference to current PiP window (or null if closed)
   */
  get pipWindow(): Window | null {
    return this._pipWindow;
  }

  /**
   * Current state of the PiP window
   */
  get state(): PictureInPictureWindowState {
    return {
      isSupported: this.isSupported,
      isOpen: this._isOpen,
      pipWindow: this._pipWindow,
    };
  }

  // ============================================================================
  // Event Handlers
  // ============================================================================

  private _handlePageHide(event: PageTransitionEvent): void {
    this._isOpen = false;
    this._pipWindow = null;
    this._options.onClose?.(event);
    this._emit('close');
    this._emit('statechange');
  }

  private _handleEnter(event: DocumentPictureInPictureEvent): void {
    this._pipWindow = event.window;
    this._isOpen = true;
    this._emit('open');
    this._emit('statechange');
  }

  // ============================================================================
  // Event Emitter
  // ============================================================================

  private _emit(type: PictureInPictureWindowEventType): void {
    const listeners = this._listeners.get(type);
    if (listeners) {
      const state = this.state;
      for (const listener of listeners) {
        listener(state);
      }
    }
  }

  /**
   * Subscribe to events
   * @param type - event type ('open', 'close', 'statechange')
   * @param listener - callback function
   */
  on(type: PictureInPictureWindowEventType, listener: PictureInPictureWindowEventListener): () => void {
    if (!this._listeners.has(type)) {
      this._listeners.set(type, new Set());
    }
    this._listeners.get(type)!.add(listener);

    // Return unsubscribe function
    return () => {
      this._listeners.get(type)?.delete(listener);
    };
  }

  /**
   * Unsubscribe from events
   * @param type - event type
   * @param listener - callback function to remove
   */
  off(type: PictureInPictureWindowEventType, listener: PictureInPictureWindowEventListener): void {
    this._listeners.get(type)?.delete(listener);
  }

  // ============================================================================
  // Public Methods
  // ============================================================================

  /**
   * Open a new PiP window
   * @returns Promise with Window object or undefined on error
   */
  async open(): Promise<Window | undefined> {
    if (!this.isSupported || !window.documentPictureInPicture) {
      return undefined;
    }

    // If already open, return current window
    if (this._pipWindow) {
      return this._pipWindow;
    }

    try {
      const requestOptions: DocumentPictureInPictureOptions = {
        disallowReturnToOpener: this._options.disallowReturnToOpener,
      };

      // Add dimensions if specified
      if (this._options.width !== undefined) {
        requestOptions.width = this._options.width;
      }

      if (this._options.height !== undefined) {
        requestOptions.height = this._options.height;
      }

      const newWindow = await window.documentPictureInPicture.requestWindow(requestOptions);

      // Subscribe to window close
      newWindow.addEventListener('pagehide', this._boundHandlePageHide, { once: true });

      // Copy styles if needed
      if (this._options.copyStyles) {
        copyDocumentStylesToWindow(newWindow);
      }

      this._pipWindow = newWindow;
      this._isOpen = true;

      this._options.onOpen?.(newWindow);
      this._emit('open');
      this._emit('statechange');

      return newWindow;
    } catch (error) {
      console.error('[PictureInPictureWindow] Failed to open PiP window:', error);
      return undefined;
    }
  }

  /**
   * Close PiP window
   */
  close(): void {
    if (this._pipWindow) {
      this._pipWindow.close();
      // _handlePageHide will be called automatically
    }
  }

  /**
   * Resize PiP window
   * @param width - new width
   * @param height - new height
   */
  resize(width: number, height: number): void {
    if (this._pipWindow) {
      this._pipWindow.resizeTo(width, height);
    }
  }

  /**
   * Resize PiP window relative to current size
   * @param deltaWidth - width change
   * @param deltaHeight - height change
   */
  resizeBy(deltaWidth: number, deltaHeight: number): void {
    if (this._pipWindow) {
      this._pipWindow.resizeBy(deltaWidth, deltaHeight);
    }
  }

  /**
   * Focus the main (opener) window
   */
  focusOpener(): void {
    if (typeof window !== 'undefined') {
      window.focus();
    }
  }

  /**
   * Copy all styles from main document to specified window
   * @param targetWindow - target window for style copying
   */
  copyStylesToWindow(targetWindow: Window): void {
    copyDocumentStylesToWindow(targetWindow);
  }

  /**
   * Update options
   * @param options - new options to merge
   */
  updateOptions(options: Partial<PictureInPictureWindowOptions>): void {
    this._options = { ...this._options, ...options };
  }

  /**
   * Dispose and cleanup all resources
   */
  dispose(): void {
    // Close window
    if (this._pipWindow) {
      this._pipWindow.removeEventListener('pagehide', this._boundHandlePageHide);
      this._pipWindow.close();
    }

    // Unsubscribe from enter event
    if (this.isSupported && window.documentPictureInPicture) {
      window.documentPictureInPicture.removeEventListener('enter', this._boundHandleEnter);
    }

    // Clear state
    this._pipWindow = null;
    this._isOpen = false;
    this._listeners.clear();
  }
}
