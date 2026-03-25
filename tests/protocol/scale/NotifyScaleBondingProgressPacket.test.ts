import { describe, it, expect } from 'vitest';
import { NotifyScaleBondingProgressPacket } from '@/protocol/scale/NotifyScaleBondingProgressPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

describe('NotifyScaleBondingProgressPacket', () => {
  it('should parse correctly with progress', () => {
    const payload = new Uint8Array([50]);
    const packet = NotifyScaleBondingProgressPacket.fromRaw(payload);
    expect(packet.opcode).toBe(BoksOpcode.NOTIFY_SCALE_BONDING_PROGRESS);
    expect(packet.progress).toBe(50);
  });

  it('should match fixed hexadecimal reference encoding', () => {
    const packet = new NotifyScaleBondingProgressPacket(50);
    const encoded = packet.encode();
    // Opcode 0xB4 (180), Len 1, Progress 50 (0x32), Checksum 0xE7 (180+1+50=231=0xE7)
    expect(bytesToHex(encoded)).toBe('B40132E7');
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = NotifyScaleBondingProgressPacket.fromRaw(new Uint8Array([50]));
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "opcode": 180,
        "progress": 50,
      "validChecksum": null,

      });
  });
});
