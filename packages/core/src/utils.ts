/**
 * Check if Document Picture-in-Picture API is supported
 */
export function isDocumentPipSupported(): boolean {
  return typeof window !== 'undefined' && 'documentPictureInPicture' in window;
}

/**
 * Copy all styles (styleSheets) from current document to target window.
 * Handles both inline styles and external stylesheet links.
 */
export function copyDocumentStylesToWindow(targetWindow: Window): void {
  const styleSheets = [...document.styleSheets];

  for (const styleSheet of styleSheets) {
    try {
      // Try to copy inline styles
      const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('\n');
      const styleElement = document.createElement('style');

      styleElement.textContent = cssRules;
      targetWindow.document.head.appendChild(styleElement);
    } catch {
      // If failed (CORS), create link to external stylesheet
      if (styleSheet.href) {
        const linkElement = document.createElement('link');

        linkElement.rel = 'stylesheet';
        linkElement.href = styleSheet.href;

        if (styleSheet.media.mediaText) {
          linkElement.media = styleSheet.media.mediaText;
        }

        targetWindow.document.head.appendChild(linkElement);
      }
    }
  }
}
