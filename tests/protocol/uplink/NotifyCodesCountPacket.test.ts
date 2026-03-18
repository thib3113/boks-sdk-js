import { describe, it, expect } from 'vitest';
import { NotifyCodesCountPacket } from '@/protocol/uplink/NotifyCodesCountPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

describe('NotifyCodesCountPacket', () => {
  it('should parse correctly', () => {
    // 0x000A (10) master, 0x0014 (20) other
    const payload = new Uint8Array([0x00, 0x0a, 0x00, 0x14]);
    const packet = NotifyCodesCountPacket.fromPayload(payload);

    expect(packet.opcode).toBe(BoksOpcode.NOTIFY_CODES_COUNT);
    expect(packet.masterCount).toBe(10);
    expect(packet.otherCount).toBe(20);
  });

  it('should match fixed hexadecimal reference encoding', () => {
    const packet = new NotifyCodesCountPacket({ masterCount: 10, otherCount: 20 });
    const encoded = packet.encode();
    // Opcode 0xC3 (195), Len 4, master 10 (000A), other 20 (0014), Checksum 0xEB (195+4+10+20=229=0xE5 ? Wait)
    // 195+4+0+10+0+20 = 229 (0xE5)
    // Re-calculate: 195+4+10+20 = 229. 229 % 256 = 229 (0xE5).
    expect(bytesToHex(encoded)).toBe('C304000A0014E5');
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = NotifyCodesCountPacket.fromPayload(new Uint8Array([0x00, 0x0a, 0x00, 0x14]));
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "masterCount": 10,
        "opcode": 195,
        "otherCount": 20,
      });
  });
});
