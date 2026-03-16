import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  validatePinCode,
  validateMasterCodeIndex,
  validateSeed,
  validateCredentialsKey,
  validateConfigKeyFormat,
  validateNfcUid
} from '../../../../src/utils/validation';
import { BoksProtocolError } from '../../../../src/errors/BoksProtocolError';

describe('Validation Utils Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: validatePinCode should safely handle arbitrary strings', () => {
    fc.assert(
      fc.property(fc.string(), (str) => {
        try {
          validatePinCode(str);
          expect(str.length).toBe(6);
          expect(/^[0-9A-Ba-b]{6}$/.test(str)).toBe(true);
        } catch (e) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: validateMasterCodeIndex should safely handle arbitrary numbers', () => {
    fc.assert(
      fc.property(fc.integer(), fc.double(), fc.float(), (intVal, doubleVal, floatVal) => {
        try {
          validateMasterCodeIndex(intVal);
          expect(intVal >= 0 && intVal <= 255).toBe(true);
        } catch (e) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
        try {
          validateMasterCodeIndex(doubleVal);
          expect(doubleVal >= 0 && doubleVal <= 255).toBe(true);
        } catch (e) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
        try {
          validateMasterCodeIndex(floatVal);
          expect(floatVal >= 0 && floatVal <= 255).toBe(true);
        } catch (e) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: validateSeed should safely handle arbitrary strings and Uint8Arrays', () => {
    fc.assert(
      fc.property(fc.string(), fc.uint8Array({ minLength: 0, maxLength: 256 }), (str, arr) => {
        try {
          validateSeed(str);
          expect(str.length).toBe(64);
          expect(/^[0-9A-Fa-f]{64}$/.test(str)).toBe(true);
        } catch (e) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
        try {
          validateSeed(arr);
          expect(arr.length).toBe(32);
        } catch (e) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: validateCredentialsKey should safely handle arbitrary strings and Uint8Arrays', () => {
    fc.assert(
      fc.property(fc.string(), fc.uint8Array({ minLength: 0, maxLength: 256 }), (str, arr) => {
        try {
          validateCredentialsKey(str);
          expect(str.length === 64 || str.length === 8).toBe(true);
          expect(/^[0-9A-Fa-f]+$/.test(str)).toBe(true);
        } catch (e) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
        try {
          validateCredentialsKey(arr);
          expect(arr.length === 32 || arr.length === 4).toBe(true);
        } catch (e) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: validateConfigKeyFormat should safely handle arbitrary strings', () => {
    fc.assert(
      fc.property(fc.string(), (str) => {
        try {
          validateConfigKeyFormat(str);
          expect(str.length).toBe(8);
          expect(/^[0-9A-Fa-f]{8}$/.test(str)).toBe(true);
        } catch (e) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: validateNfcUid should safely handle arbitrary strings', () => {
    fc.assert(
      fc.property(fc.string(), (str) => {
        try {
          validateNfcUid(str);
          const clean = str.replace(/:/g, '');
          expect(clean.length === 8 || clean.length === 14 || clean.length === 20).toBe(true);
          expect(/^[0-9A-Fa-f]+$/.test(clean)).toBe(true);
        } catch (e) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });
});
