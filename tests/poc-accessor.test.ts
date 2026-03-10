import { describe, it, expect } from 'vitest';
import { TestClass, PayloadPinCode } from '@/poc-accessor';

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

  it('should ignore decorators that are not applied to accessors', () => {
    const decorator = PayloadPinCode(8);
    // Simulate applying the decorator to a method instead of an accessor
    const fakeContext = { kind: 'method', name: 'myMethod' } as any;
    const fakeTarget = function() {};

    const result = decorator(fakeTarget as any, fakeContext);
    expect(result).toBeUndefined();
  });
});
