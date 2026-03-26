import { BoksPacketFactory } from '@/protocol/BoksPacketFactory';
import { describe, it, expect } from 'vitest';
import { NotifyNfcTagUnregisteredPacket } from '@/protocol/uplink/NotifyNfcTagUnregisteredPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('NotifyNfcTagUnregisteredPacket', () => {
  it('should parse correctly', () => {
    const payload = new Uint8Array(0);
    const packet = NotifyNfcTagUnregisteredPacket.fromRaw(payload);
    expect(packet.opcode).toBe(BoksOpcode.NOTIFY_NFC_TAG_UNREGISTERED);
  });

  it('should retain the exact raw payload when constructed from hex via factory', () => {
    const dummyPayload = new Uint8Array([NotifyNfcTagUnregisteredPacket.opcode, 0x05, 0x01, 0x02, 0x03, 0x04, 0x05, 0x00]);
    const hex = bytesToHex(dummyPayload);
    const packet = BoksPacketFactory.fromHex(hex, { strict: false });
    expect(bytesToHex(packet.raw).toUpperCase()).toBe(hex.toUpperCase());
  });
});
