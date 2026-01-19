import type { ComputedRef, MaybeRefOrGetter, Ref, ShallowRef } from 'vue';
import { computed, onScopeDispose, readonly, ref, shallowRef, toValue, watch } from 'vue';
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
  /** Width of PiP window (can be reactive) */
  width?: MaybeRefOrGetter<number>;
  /** Height of PiP window (can be reactive) */
  height?: MaybeRefOrGetter<number>;
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
  isSupported: ComputedRef<boolean>;
  /** Whether PiP window is currently open */
  isOpen: Readonly<Ref<boolean>>;
  /** Reference to current PiP window (or null if closed) */
  pipWindow: ShallowRef<Window | null>;

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
// Composable
// ============================================================================

/**
 * Vue 3 composable for working with Document Picture-in-Picture API.
 *
 * @example
 * ```vue
 * <script setup>
 * const videoRef = ref<HTMLElement>();
 * const { isSupported, isOpen, pipWindow, open, close, copyStylesToWindow } = usePictureInPictureWindow({
 *   width: 400,
 *   height: 300,
 *   copyStyles: true,
 *   onOpen: (win) => {
 *     win.document.body.appendChild(videoRef.value);
 *   },
 *   onClose: () => {
 *     document.body.appendChild(videoRef.value);
 *   },
 * });
 * </script>
 * ```
 *
 * @see https://developer.chrome.com/docs/web-platform/document-picture-in-picture
 */
export function usePictureInPictureWindow(
  options: UsePictureInPictureWindowOptions = {},
): UsePictureInPictureWindowReturn {
  const { width, height, disallowReturnToOpener = false, copyStyles = true, onOpen, onClose } = options;

  // State
  const isOpen = ref(false);
  const pipWindow = shallowRef<Window | null>(null);

  // Computed
  const isSupported = computed(() => isDocumentPipSupported());

  // Create core instance
  const coreOptions: CoreOptions = {
    width: toValue(width),
    height: toValue(height),
    disallowReturnToOpener,
    copyStyles,
    onOpen: (win) => {
      pipWindow.value = win;
      isOpen.value = true;
      onOpen?.(win);
    },
    onClose: (event) => {
      pipWindow.value = null;
      isOpen.value = false;
      onClose?.(event);
    },
  };

  const pip = new PictureInPictureWindow(coreOptions);

  // Watch for reactive dimension changes
  if (width !== undefined) {
    watch(
      () => toValue(width),
      (newWidth) => {
        pip.updateOptions({ width: newWidth });
      },
    );
  }

  if (height !== undefined) {
    watch(
      () => toValue(height),
      (newHeight) => {
        pip.updateOptions({ height: newHeight });
      },
    );
  }

  // Sync state from core on enter event
  pip.on('statechange', (state) => {
    isOpen.value = state.isOpen;
    pipWindow.value = state.pipWindow;
  });

  // Methods
  const open = async (): Promise<Window | undefined> => {
    // Update dimensions before opening
    const widthValue = toValue(width);
    const heightValue = toValue(height);

    if (widthValue !== undefined || heightValue !== undefined) {
      pip.updateOptions({
        width: widthValue,
        height: heightValue,
      });
    }

    return pip.open();
  };

  const close = (): void => {
    pip.close();
  };

  const resize = (newWidth: number, newHeight: number): void => {
    pip.resize(newWidth, newHeight);
  };

  const resizeBy = (deltaWidth: number, deltaHeight: number): void => {
    pip.resizeBy(deltaWidth, deltaHeight);
  };

  const focusOpener = (): void => {
    pip.focusOpener();
  };

  const copyStylesToWindowFn = (targetWindow: Window): void => {
    copyDocumentStylesToWindow(targetWindow);
  };

  // Cleanup
  onScopeDispose(() => {
    pip.dispose();
  });

  return {
    isSupported,
    isOpen: readonly(isOpen),
    pipWindow,
    open,
    close,
    resize,
    resizeBy,
    focusOpener,
    copyStylesToWindow: copyStylesToWindowFn,
  };
}
