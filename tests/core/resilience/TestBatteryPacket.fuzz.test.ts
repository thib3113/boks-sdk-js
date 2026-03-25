import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { TestBatteryPacket } from '../../../src/protocol/downlink/TestBatteryPacket';
import { BoksProtocolError } from '../../../src/errors/BoksProtocolError';

describe('TestBatteryPacket Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: should securely reject malformed binary payloads in fromRaw with BoksProtocolError', () => {
    // Fuzz the binary parser
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        try {
          const packet = TestBatteryPacket.fromRaw(buildMockRawPacket(TestBatteryPacket.opcode, payload));
          expect(packet).toBeInstanceOf(TestBatteryPacket);
        } catch (e) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });
});
