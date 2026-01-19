import { describe, it, expect } from 'vitest';

describe('usePictureInPictureWindow exports', () => {
  it('should export usePictureInPictureWindow function', async () => {
    const module = await import('./index');
    
    expect(module.usePictureInPictureWindow).toBeDefined();
    expect(typeof module.usePictureInPictureWindow).toBe('function');
  });

  it('should re-export core utilities', async () => {
    const module = await import('./index');
    
    expect(module.isDocumentPipSupported).toBeDefined();
    expect(module.copyDocumentStylesToWindow).toBeDefined();
  });
});
