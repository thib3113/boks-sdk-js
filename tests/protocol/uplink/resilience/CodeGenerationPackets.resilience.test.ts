import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { NotifyCodeGenerationErrorPacket } from '@/protocol/uplink/NotifyCodeGenerationErrorPacket';
import { NotifyCodeGenerationSuccessPacket } from '@/protocol/uplink/NotifyCodeGenerationSuccessPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('CodeGenerationPackets - Resilience & Edge Cases', () => {
  const PACKETS = [
    {
      packetClass: NotifyCodeGenerationErrorPacket,
      opcode: BoksOpcode.NOTIFY_CODE_GENERATION_ERROR
    },
    {
      packetClass: NotifyCodeGenerationSuccessPacket,
      opcode: BoksOpcode.NOTIFY_CODE_GENERATION_SUCCESS
    }
  ];

  describe.each(PACKETS)('$packetClass.name', ({ packetClass, opcode }) => {
    describe('fromRaw()', () => {
      it('should parse valid arbitrary payloads without crashing', () => {
        fc.assert(
          fc.property(fc.uint8Array(), (payload) => {
            const packet = packetClass.fromRaw(buildMockRawPacket(packetClass.opcode, payload));
            expect(packet).toBeInstanceOf(packetClass);
            expect(packet.opcode).toBe(opcode);
            expect((packet as any).raw).toEqual(payload);
          })
        );
      });

      it('should instantiate cleanly with empty payload', () => {
        const payload = new Uint8Array(0);
        const packet = packetClass.fromRaw(buildMockRawPacket(packetClass.opcode, payload));
        expect(packet.opcode).toBe(opcode);
      });
    });

    describe('constructor()', () => {
      it('should handle undefined payload safely', () => {
        const packet = new packetClass();
        expect(packet).toBeInstanceOf(packetClass);
        expect(packet.opcode).toBe(opcode);
        expect((packet as any).raw).toEqual(new Uint8Array(0));
      });
    });
  });
});
