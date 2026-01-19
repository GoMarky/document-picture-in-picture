import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isDocumentPipSupported, copyDocumentStylesToWindow } from './utils';

describe('utils', () => {
  describe('isDocumentPipSupported', () => {
    const originalWindow = global.window;

    afterEach(() => {
      global.window = originalWindow;
    });

    it('should return false when window is undefined', () => {
      // @ts-expect-error - testing undefined window
      global.window = undefined;
      expect(isDocumentPipSupported()).toBe(false);
    });

    it('should return false when documentPictureInPicture is not available', () => {
      // @ts-expect-error - mocking partial window
      global.window = {};
      expect(isDocumentPipSupported()).toBe(false);
    });

    it('should return true when documentPictureInPicture is available', () => {
      // @ts-expect-error - mocking partial window
      global.window = {
        documentPictureInPicture: {},
      };
      expect(isDocumentPipSupported()).toBe(true);
    });
  });

  describe('copyDocumentStylesToWindow', () => {
    let mockTargetWindow: Window;
    let mockHead: HTMLHeadElement;

    beforeEach(() => {
      mockHead = {
        appendChild: vi.fn(),
      } as unknown as HTMLHeadElement;

      mockTargetWindow = {
        document: {
          head: mockHead,
        },
      } as unknown as Window;
    });

    it('should copy inline styles to target window', () => {
      const mockStyleSheet = {
        cssRules: [
          { cssText: '.test { color: red; }' },
          { cssText: '.test2 { color: blue; }' },
        ],
        href: null,
        media: { mediaText: '' },
      };

      Object.defineProperty(document, 'styleSheets', {
        value: [mockStyleSheet],
        configurable: true,
      });

      copyDocumentStylesToWindow(mockTargetWindow);

      expect(mockHead.appendChild).toHaveBeenCalled();
      const appendedElement = (mockHead.appendChild as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(appendedElement.tagName).toBe('STYLE');
      expect(appendedElement.textContent).toBe('.test { color: red; }\n.test2 { color: blue; }');
    });

    it('should create link element for external stylesheets when cssRules access fails', () => {
      const mockStyleSheet = {
        get cssRules() {
          throw new Error('CORS error');
        },
        href: 'https://example.com/styles.css',
        media: { mediaText: 'screen' },
      };

      Object.defineProperty(document, 'styleSheets', {
        value: [mockStyleSheet],
        configurable: true,
      });

      copyDocumentStylesToWindow(mockTargetWindow);

      expect(mockHead.appendChild).toHaveBeenCalled();
      const appendedElement = (mockHead.appendChild as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(appendedElement.tagName).toBe('LINK');
      expect(appendedElement.rel).toBe('stylesheet');
      expect(appendedElement.href).toBe('https://example.com/styles.css');
      expect(appendedElement.media).toBe('screen');
    });

    it('should skip stylesheets without href when cssRules access fails', () => {
      const mockStyleSheet = {
        get cssRules() {
          throw new Error('CORS error');
        },
        href: null,
        media: { mediaText: '' },
      };

      Object.defineProperty(document, 'styleSheets', {
        value: [mockStyleSheet],
        configurable: true,
      });

      copyDocumentStylesToWindow(mockTargetWindow);

      expect(mockHead.appendChild).not.toHaveBeenCalled();
    });
  });
});
