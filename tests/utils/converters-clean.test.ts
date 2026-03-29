import { describe, it, expect } from 'vitest';
import { cleanHexString } from '../../src/utils/converters';

describe('cleanHexString', () => {
  it('should remove invalid characters and return uppercase', () => {
    expect(cleanHexString('a1-B2:c3_D4')).toBe('A1B2C3D4');
  });

  it('should return uppercase for already clean string', () => {
    expect(cleanHexString('a1b2c3d4')).toBe('A1B2C3D4');
  });

  it('should handle string with only invalid characters', () => {
    expect(cleanHexString('---::___')).toBe('');
  });

  it('should handle empty string', () => {
    expect(cleanHexString('')).toBe('');
  });
});
