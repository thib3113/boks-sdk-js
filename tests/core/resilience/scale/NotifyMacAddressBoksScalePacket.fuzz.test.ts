import { BoksProtocolError } from '@/errors/BoksProtocolError';
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { NotifyMacAddressBoksScalePacket } from '../../../../src/protocol/scale/NotifyMacAddressBoksScalePacket';
import { BoksOpcode } from '../../../../src/protocol/constants';

describe('NotifyMacAddressBoksScalePacket Resilience (Fuzzing)', () => {
  it('should not crash on arbitrary random payloads', () => {
    // Catch expected errors
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (data) => {
        try {
          const packet = NotifyMacAddressBoksScalePacket.fromRaw(buildMockRawPacket(NotifyMacAddressBoksScalePacket.opcode, data));
          expect(packet).toBeInstanceOf(NotifyMacAddressBoksScalePacket);
          expect(packet.opcode).toBe(BoksOpcode.NOTIFY_MAC_ADDRESS_BOKS_SCALE);
          expect(typeof packet.macAddress).toBe('string');
        } catch (e) {
          if (!(e instanceof BoksProtocolError)) throw e;
        }
      }),
      { numRuns: 1000 }
    );
  });
});
