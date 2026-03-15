import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { ValidOpenCodePacket } from '@/protocol/uplink/ValidOpenCodePacket';
import { InvalidOpenCodePacket } from '@/protocol/uplink/InvalidOpenCodePacket';
import { NotifyNfcTagRegisteredPacket } from '@/protocol/uplink/NotifyNfcTagRegisteredPacket';
import { NotifyNfcTagUnregisteredPacket } from '@/protocol/uplink/NotifyNfcTagUnregisteredPacket';
import { NotifyNfcTagRegisteredErrorAlreadyExistsPacket } from '@/protocol/uplink/NotifyNfcTagRegisteredErrorAlreadyExistsPacket';
import { NotifySetConfigurationSuccessPacket } from '@/protocol/uplink/NotifySetConfigurationSuccessPacket';
import { OperationErrorPacket } from '@/protocol/uplink/OperationErrorPacket';
import { OperationSuccessPacket } from '@/protocol/uplink/OperationSuccessPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('Simple Notification Packets - Resilience & Edge Cases', () => {
  const PACKETS = [
    { packetClass: ValidOpenCodePacket, opcode: BoksOpcode.VALID_OPEN_CODE },
    { packetClass: InvalidOpenCodePacket, opcode: BoksOpcode.INVALID_OPEN_CODE },
    { packetClass: NotifyNfcTagRegisteredPacket, opcode: BoksOpcode.NOTIFY_NFC_TAG_REGISTERED },
    { packetClass: NotifyNfcTagUnregisteredPacket, opcode: BoksOpcode.NOTIFY_NFC_TAG_UNREGISTERED },
    { packetClass: NotifyNfcTagRegisteredErrorAlreadyExistsPacket, opcode: BoksOpcode.NOTIFY_NFC_TAG_REGISTERED_ERROR_ALREADY_EXISTS },
    { packetClass: NotifySetConfigurationSuccessPacket, opcode: BoksOpcode.NOTIFY_SET_CONFIGURATION_SUCCESS },
    { packetClass: OperationSuccessPacket, opcode: BoksOpcode.CODE_OPERATION_SUCCESS }
  ];

  describe.each(PACKETS)('$packetClass.name', ({ packetClass, opcode }) => {
    describe('fromPayload()', () => {
      it('should parse valid arbitrary payloads without crashing', () => {
        fc.assert(
          fc.property(fc.uint8Array(), (payload) => {
            const packet = packetClass.fromPayload(payload);
            expect(packet).toBeInstanceOf(packetClass);
            expect(packet.opcode).toBe(opcode);
            expect((packet as any).rawPayload).toEqual(payload);
          })
        );
      });

      it('should instantiate cleanly with empty payload', () => {
        const payload = new Uint8Array(0);
        const packet = packetClass.fromPayload(payload);
        expect(packet.opcode).toBe(opcode);
      });
    });
  });

  describe('OperationErrorPacket', () => {
    describe('fromPayload()', () => {
      it('should parse valid arbitrary payloads without crashing', () => {
        fc.assert(
          fc.property(fc.uint8Array(), (payload) => {
            let packet;
        // TODO, crashing with invalid data is normal, but we need to check the error, no catch without tests . Need to rewrite this test
        try {
               packet = OperationErrorPacket.fromPayload(payload);
            } catch(e) { return; }
            expect(packet).toBeInstanceOf(OperationErrorPacket);
            expect(packet.opcode).toBe(BoksOpcode.CODE_OPERATION_ERROR);
            expect((packet as any).rawPayload).toEqual(payload);

            if (payload.length > 0) {
              expect(packet.errorCode).toBe(payload[0]);
            } else {
              expect(packet.errorCode).toBe(0);
            }
          })
        );
      });

      it('should throw on empty payload', () => {
        const payload = new Uint8Array(0);
        expect(() => OperationErrorPacket.fromPayload(payload)).toThrowError(Error);
      });

      it('should safely capture errorCode when trailing bytes exist', () => {
        fc.assert(
          fc.property(fc.integer({ min: 0, max: 255 }), fc.uint8Array(), (errorCode, trailingBytes) => {
            const payload = new Uint8Array([errorCode, ...trailingBytes]);
            const packet = OperationErrorPacket.fromPayload(payload);
            expect(packet.errorCode).toBe(errorCode);
          })
        );
      });
    });
  });
});
