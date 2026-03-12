import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { validatePinCode, validateMasterCodeIndex, validateSeed, validateCredentialsKey, validateConfigKeyFormat, validateNfcUid } from '../../../../src/utils/validation';
import { BoksProtocolError } from '../../../../src/errors/BoksProtocolError';

describe('Validation Utils Resilience (Fuzzing)', () => {

  it('FEATURE REGRESSION: validatePinCode should safely handle arbitrary strings', () => {
    fc.assert(
      fc.property(fc.string(), (str) => {
        try {
          validatePinCode(str);
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
        try { validateMasterCodeIndex(intVal); } catch (e) { expect(e).toBeInstanceOf(BoksProtocolError); }
        try { validateMasterCodeIndex(doubleVal); } catch (e) { expect(e).toBeInstanceOf(BoksProtocolError); }
        try { validateMasterCodeIndex(floatVal); } catch (e) { expect(e).toBeInstanceOf(BoksProtocolError); }
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: validateSeed should safely handle arbitrary strings and Uint8Arrays', () => {
    fc.assert(
      fc.property(fc.string(), fc.uint8Array({ minLength: 0, maxLength: 256 }), (str, arr) => {
        try { validateSeed(str); } catch (e) { expect(e).toBeInstanceOf(BoksProtocolError); }
        try { validateSeed(arr); } catch (e) { expect(e).toBeInstanceOf(BoksProtocolError); }
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: validateCredentialsKey should safely handle arbitrary strings and Uint8Arrays', () => {
    fc.assert(
      fc.property(fc.string(), fc.uint8Array({ minLength: 0, maxLength: 256 }), (str, arr) => {
        try { validateCredentialsKey(str); } catch (e) { expect(e).toBeInstanceOf(BoksProtocolError); }
        try { validateCredentialsKey(arr); } catch (e) { expect(e).toBeInstanceOf(BoksProtocolError); }
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: validateConfigKeyFormat should safely handle arbitrary strings', () => {
    fc.assert(
      fc.property(fc.string(), (str) => {
        try {
          validateConfigKeyFormat(str);
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
        } catch (e) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });
});
