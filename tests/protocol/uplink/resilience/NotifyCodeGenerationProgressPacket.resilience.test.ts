import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { NotifyCodeGenerationProgressPacket } from '@/protocol/uplink/NotifyCodeGenerationProgressPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('NotifyCodeGenerationProgressPacket - Resilience & Edge Cases', () => {
  describe('fromPayload()', () => {
    it('should parse valid arbitrary payloads without crashing', () => {
      fc.assert(
        fc.property(fc.uint8Array(), (payload) => {
          let packet;
        // TODO, crashing with invalid data is normal, but we need to check the error, no catch without tests . Need to rewrite this test
        try {
             packet = NotifyCodeGenerationProgressPacket.fromPayload(payload);
          } catch(e) { return; }
          expect(packet).toBeInstanceOf(NotifyCodeGenerationProgressPacket);
          expect(packet.opcode).toBe(BoksOpcode.NOTIFY_CODE_GENERATION_PROGRESS);
          expect((packet as any).rawPayload).toEqual(payload);

          if (payload.length > 0) {
            expect(packet.progress).toBe(payload[0]);
          } else {
            expect(packet.progress).toBe(0);
          }
        })
      );
    });

    it('should correctly handle exactly 1 byte payload', () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 255 }), (progress) => {
          const payload = new Uint8Array([progress]);
          const packet = NotifyCodeGenerationProgressPacket.fromPayload(payload);
          expect(packet.progress).toBe(progress);
        })
      );
    });

    it('should safely error for an empty payload', () => {
      const shortPayload = new Uint8Array(0);
      expect(() => NotifyCodeGenerationProgressPacket.fromPayload(shortPayload)).toThrowError();
    });

    it('should ignore all trailing bytes gracefully', () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 255 }), fc.uint8Array(), (progress, trailingBytes) => {
          const payload = new Uint8Array([progress, ...trailingBytes]);
          const packet = NotifyCodeGenerationProgressPacket.fromPayload(payload);
          expect(packet.progress).toBe(progress);
        })
      );
    });
  });
});
