import { describe, it, expect } from 'vitest';
import { TestClass } from '@/poc-accessor';

describe('poc-accessor', () => {
  it('should initialize and validate property correctly', () => {
    const obj = new TestClass();
    expect(obj.pin).toBe('12345678');

    obj.pin = 'abcdefgh';
    expect(obj.pin).toBe('abcdefgh');

    expect(() => {
      obj.pin = '123';
    }).toThrow('Length must be 8');
  });
});
