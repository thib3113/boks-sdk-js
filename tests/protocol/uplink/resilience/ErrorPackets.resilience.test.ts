import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { ErrorBadRequestPacket } from '@/protocol/uplink/ErrorBadRequestPacket';
import { ErrorCrcPacket } from '@/protocol/uplink/ErrorCrcPacket';
import { ErrorNfcScanTimeoutPacket } from '@/protocol/uplink/ErrorNfcScanTimeoutPacket';
import { ErrorNfcTagAlreadyExistsScanPacket } from '@/protocol/uplink/ErrorNfcTagAlreadyExistsScanPacket';
import { ErrorUnauthorizedPacket } from '@/protocol/uplink/ErrorUnauthorizedPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('ErrorPackets - Resilience & Edge Cases', () => {
  const PACKETS = [
    { packetClass: ErrorBadRequestPacket, opcode: BoksOpcode.ERROR_BAD_REQUEST },
    { packetClass: ErrorCrcPacket, opcode: BoksOpcode.ERROR_CRC },
    { packetClass: ErrorNfcScanTimeoutPacket, opcode: BoksOpcode.ERROR_NFC_SCAN_TIMEOUT, hasStatus: true, status: 'timeout' },
    { packetClass: ErrorNfcTagAlreadyExistsScanPacket, opcode: BoksOpcode.ERROR_NFC_TAG_ALREADY_EXISTS_SCAN, hasStatus: true, status: 'already_exists' },
    { packetClass: ErrorUnauthorizedPacket, opcode: BoksOpcode.ERROR_UNAUTHORIZED }
  ];

  describe.each(PACKETS)('$packetClass.name', ({ packetClass, opcode, hasStatus, status }) => {
    describe('fromPayload()', () => {
      it('should parse valid arbitrary payloads without crashing', () => {
        fc.assert(
          fc.property(fc.uint8Array(), (payload) => {
            const packet = packetClass.fromPayload(payload);
            expect(packet).toBeInstanceOf(packetClass);
            expect(packet.opcode).toBe(opcode);
            expect((packet as any).rawPayload).toEqual(payload);
            if (hasStatus) {
              expect((packet as any).status).toBe(status);
            }
          })
        );
      });

      it('should instantiate cleanly with empty payload', () => {
        const payload = new Uint8Array(0);
        const packet = packetClass.fromPayload(payload);
        expect(packet.opcode).toBe(opcode);
        if (hasStatus) {
          expect((packet as any).status).toBe(status);
        }
      });
    });

    describe('constructor()', () => {
      it('should handle undefined payload safely', () => {
        const packet = new packetClass();
        expect(packet).toBeInstanceOf(packetClass);
        expect(packet.opcode).toBe(opcode);
        expect((packet as any).rawPayload).toEqual(new Uint8Array(0));
        if (hasStatus) {
          expect((packet as any).status).toBe(status);
        }
      });
    });
  });
});
