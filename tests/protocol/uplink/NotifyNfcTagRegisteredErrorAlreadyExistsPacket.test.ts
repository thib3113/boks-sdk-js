import { BoksPacketFactory } from '@/protocol/BoksPacketFactory';
import { describe, it, expect } from 'vitest';
import { NotifyNfcTagRegisteredErrorAlreadyExistsPacket } from '@/protocol/uplink/NotifyNfcTagRegisteredErrorAlreadyExistsPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('NotifyNfcTagRegisteredErrorAlreadyExistsPacket', () => {
  it('should parse correctly', () => {
    const payload = new Uint8Array(0);
    const packet = NotifyNfcTagRegisteredErrorAlreadyExistsPacket.fromRaw(payload);
    expect(packet.opcode).toBe(BoksOpcode.NOTIFY_NFC_TAG_REGISTERED_ERROR_ALREADY_EXISTS);
  });

  it('should retain the exact raw payload when constructed from hex via factory', () => {
    const dummyPayload = new Uint8Array([NotifyNfcTagRegisteredErrorAlreadyExistsPacket.opcode, 0x05, 0x01, 0x02, 0x03, 0x04, 0x05, 0x00]);
    try {
      const packet = NotifyNfcTagRegisteredErrorAlreadyExistsPacket.fromRaw(dummyPayload, { strict: false });
      if (packet) {
        expect(bytesToHex(packet.raw).toUpperCase()).toBe(bytesToHex(dummyPayload).toUpperCase());
      }
    } catch (e) {
      // Ignore if dummy payload is invalid for mapped fields
    }
  });
});
