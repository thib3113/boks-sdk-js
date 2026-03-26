import { BoksPacketFactory } from '@/protocol/BoksPacketFactory';
import { describe, it, expect } from 'vitest';
import { NotifyCodesCountPacket } from '@/protocol/uplink/NotifyCodesCountPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

describe('NotifyCodesCountPacket', () => {
  it('should parse correctly', () => {
    // 0x000A (10) master, 0x0014 (20) other
    const payload = new Uint8Array([0x00, 0x0a, 0x00, 0x14]);
    const packet = NotifyCodesCountPacket.fromRaw(payload);

    expect(packet.opcode).toBe(BoksOpcode.NOTIFY_CODES_COUNT);
    expect(packet.masterCount).toBe(10);
    expect(packet.otherCount).toBe(20);
  });

  it('should match fixed hexadecimal reference encoding', () => {
    const packet = new NotifyCodesCountPacket({ masterCount: 10, otherCount: 20 });
    const encoded = packet.encode();
    // Opcode 0xC3 (195), Total Length 7, master 10 (000A), other 20 (0014), Checksum 0xE8
    // 195+7+0+10+0+20 = 232 (0xE8)
    expect(bytesToHex(encoded)).toBe('C307000A0014E8');
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = NotifyCodesCountPacket.fromRaw(new Uint8Array([0x00, 0x0a, 0x00, 0x14]));
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "masterCount": 10,
        "opcode": 195,
        "otherCount": 20,
      "validChecksum": null,

      });
  });

  it('should retain the exact raw payload when constructed from hex via factory', () => {
    const dummyPayload = new Uint8Array([NotifyCodesCountPacket.opcode, 0x05, 0x01, 0x02, 0x03, 0x04, 0x05, 0x00]);
    const hex = bytesToHex(dummyPayload);
    const packet = BoksPacketFactory.fromHex(hex, { strict: false });
    expect(bytesToHex(packet.raw).toUpperCase()).toBe(hex.toUpperCase());
  });
});
