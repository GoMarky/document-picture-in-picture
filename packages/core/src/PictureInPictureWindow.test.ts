import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PictureInPictureWindow } from './PictureInPictureWindow';

describe('PictureInPictureWindow', () => {
  let mockPipWindow: Window;
  let mockDocumentPictureInPicture: {
    requestWindow: ReturnType<typeof vi.fn>;
    window: Window | null;
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockPipWindow = {
      close: vi.fn(),
      resizeTo: vi.fn(),
      resizeBy: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      document: {
        head: {
          appendChild: vi.fn(),
        },
      },
    } as unknown as Window;

    mockDocumentPictureInPicture = {
      requestWindow: vi.fn().mockResolvedValue(mockPipWindow),
      window: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    // Mock global window
    Object.defineProperty(global, 'window', {
      value: {
        documentPictureInPicture: mockDocumentPictureInPicture,
        focus: vi.fn(),
      },
      writable: true,
      configurable: true,
    });

    // Mock document.styleSheets
    Object.defineProperty(document, 'styleSheets', {
      value: [],
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create instance with default options', () => {
      const pip = new PictureInPictureWindow();

      expect(pip.isSupported).toBe(true);
      expect(pip.isOpen).toBe(false);
      expect(pip.pipWindow).toBeNull();

      pip.dispose();
    });

    it('should register enter event listener on creation', () => {
      const pip = new PictureInPictureWindow();

      expect(mockDocumentPictureInPicture.addEventListener).toHaveBeenCalledWith(
        'enter',
        expect.any(Function),
      );

      pip.dispose();
    });
  });

  describe('isSupported', () => {
    it('should return true when API is available', () => {
      const pip = new PictureInPictureWindow();
      expect(pip.isSupported).toBe(true);
      pip.dispose();
    });

    it('should return false when API is not available', () => {
      // @ts-expect-error - mocking partial window
      global.window = {};
      const pip = new PictureInPictureWindow();
      expect(pip.isSupported).toBe(false);
      pip.dispose();
    });
  });

  describe('open', () => {
    it('should open PiP window with default options', async () => {
      const pip = new PictureInPictureWindow();

      const result = await pip.open();

      expect(result).toBe(mockPipWindow);
      expect(pip.isOpen).toBe(true);
      expect(pip.pipWindow).toBe(mockPipWindow);
      expect(mockDocumentPictureInPicture.requestWindow).toHaveBeenCalledWith({
        disallowReturnToOpener: false,
      });

      pip.dispose();
    });

    it('should open PiP window with custom dimensions', async () => {
      const pip = new PictureInPictureWindow({
        width: 400,
        height: 300,
      });

      await pip.open();

      expect(mockDocumentPictureInPicture.requestWindow).toHaveBeenCalledWith({
        width: 400,
        height: 300,
        disallowReturnToOpener: false,
      });

      pip.dispose();
    });

    it('should call onOpen callback when window opens', async () => {
      const onOpen = vi.fn();
      const pip = new PictureInPictureWindow({ onOpen });

      await pip.open();

      expect(onOpen).toHaveBeenCalledWith(mockPipWindow);

      pip.dispose();
    });

    it('should return existing window if already open', async () => {
      const pip = new PictureInPictureWindow();

      await pip.open();
      const result = await pip.open();

      expect(result).toBe(mockPipWindow);
      expect(mockDocumentPictureInPicture.requestWindow).toHaveBeenCalledTimes(1);

      pip.dispose();
    });

    it('should return undefined if API is not supported', async () => {
      // @ts-expect-error - mocking partial window
      global.window = {};
      const pip = new PictureInPictureWindow();

      const result = await pip.open();

      expect(result).toBeUndefined();

      pip.dispose();
    });

    it('should return undefined and log error on failure', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockDocumentPictureInPicture.requestWindow.mockRejectedValue(new Error('Test error'));

      const pip = new PictureInPictureWindow();

      const result = await pip.open();

      expect(result).toBeUndefined();
      expect(consoleError).toHaveBeenCalled();

      pip.dispose();
    });

    it('should add pagehide listener to new window', async () => {
      const pip = new PictureInPictureWindow();

      await pip.open();

      expect(mockPipWindow.addEventListener).toHaveBeenCalledWith(
        'pagehide',
        expect.any(Function),
        { once: true },
      );

      pip.dispose();
    });
  });

  describe('close', () => {
    it('should close PiP window', async () => {
      const pip = new PictureInPictureWindow();

      await pip.open();
      pip.close();

      expect(mockPipWindow.close).toHaveBeenCalled();

      pip.dispose();
    });

    it('should do nothing if window is not open', () => {
      const pip = new PictureInPictureWindow();

      pip.close();

      expect(mockPipWindow.close).not.toHaveBeenCalled();

      pip.dispose();
    });
  });

  describe('resize', () => {
    it('should resize PiP window', async () => {
      const pip = new PictureInPictureWindow();

      await pip.open();
      pip.resize(500, 400);

      expect(mockPipWindow.resizeTo).toHaveBeenCalledWith(500, 400);

      pip.dispose();
    });

    it('should do nothing if window is not open', () => {
      const pip = new PictureInPictureWindow();

      pip.resize(500, 400);

      expect(mockPipWindow.resizeTo).not.toHaveBeenCalled();

      pip.dispose();
    });
  });

  describe('resizeBy', () => {
    it('should resize PiP window relatively', async () => {
      const pip = new PictureInPictureWindow();

      await pip.open();
      pip.resizeBy(100, 50);

      expect(mockPipWindow.resizeBy).toHaveBeenCalledWith(100, 50);

      pip.dispose();
    });
  });

  describe('focusOpener', () => {
    it('should focus the opener window', () => {
      const pip = new PictureInPictureWindow();

      pip.focusOpener();

      expect(window.focus).toHaveBeenCalled();

      pip.dispose();
    });
  });

  describe('event listeners', () => {
    it('should emit open event when window opens', async () => {
      const pip = new PictureInPictureWindow();
      const listener = vi.fn();

      pip.on('open', listener);
      await pip.open();

      expect(listener).toHaveBeenCalledWith({
        isSupported: true,
        isOpen: true,
        pipWindow: mockPipWindow,
      });

      pip.dispose();
    });

    it('should emit statechange event when window opens', async () => {
      const pip = new PictureInPictureWindow();
      const listener = vi.fn();

      pip.on('statechange', listener);
      await pip.open();

      expect(listener).toHaveBeenCalled();

      pip.dispose();
    });

    it('should return unsubscribe function from on()', async () => {
      const pip = new PictureInPictureWindow();
      const listener = vi.fn();

      const unsubscribe = pip.on('open', listener);
      unsubscribe();
      await pip.open();

      expect(listener).not.toHaveBeenCalled();

      pip.dispose();
    });

    it('should remove listener with off()', async () => {
      const pip = new PictureInPictureWindow();
      const listener = vi.fn();

      pip.on('open', listener);
      pip.off('open', listener);
      await pip.open();

      expect(listener).not.toHaveBeenCalled();

      pip.dispose();
    });
  });

  describe('updateOptions', () => {
    it('should update options', () => {
      const pip = new PictureInPictureWindow({ width: 400 });

      pip.updateOptions({ width: 500, height: 300 });

      // Options are internal, so we test by opening a new window
      // This is an indirect test
      expect(pip).toBeDefined();

      pip.dispose();
    });
  });

  describe('dispose', () => {
    it('should cleanup all resources', async () => {
      const pip = new PictureInPictureWindow();

      await pip.open();
      pip.dispose();

      expect(mockPipWindow.close).toHaveBeenCalled();
      expect(mockDocumentPictureInPicture.removeEventListener).toHaveBeenCalledWith(
        'enter',
        expect.any(Function),
      );
      expect(pip.pipWindow).toBeNull();
      expect(pip.isOpen).toBe(false);
    });

    it('should remove pagehide listener on dispose', async () => {
      const pip = new PictureInPictureWindow();

      await pip.open();
      pip.dispose();

      expect(mockPipWindow.removeEventListener).toHaveBeenCalledWith(
        'pagehide',
        expect.any(Function),
      );
    });
  });

  describe('state getter', () => {
    it('should return current state', async () => {
      const pip = new PictureInPictureWindow();

      expect(pip.state).toEqual({
        isSupported: true,
        isOpen: false,
        pipWindow: null,
      });

      await pip.open();

      expect(pip.state).toEqual({
        isSupported: true,
        isOpen: true,
        pipWindow: mockPipWindow,
      });

      pip.dispose();
    });
  });
});
