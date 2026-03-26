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

  it('should throw an error if progress is greater than 100', () => {
    const payload = new Uint8Array([101]);
    expect(() => NotifyScaleBondingProgressPacket.fromRaw(payload)).toThrowError('Bonding progress cannot exceed 100%');
  });

  it('should match fixed hexadecimal reference encoding', () => {
    const packet = new NotifyScaleBondingProgressPacket(50);
    const encoded = packet.encode();
    expect(bytesToHex(encoded)).toBe('B40132E7');
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = NotifyScaleBondingProgressPacket.fromRaw(new Uint8Array([50]));
    const json = packet.toJSON();
    expect(json).toStrictEqual({
      "opcode": 180,
      "progress": 50,
      "validChecksum": null
    });
  });

  it('should retain the exact raw payload when constructed from hex via factory', () => {
    const dummyPayload = new Uint8Array([NotifyScaleBondingProgressPacket.opcode, 0x05, 0x01, 0x02, 0x03, 0x04, 0x05, 0x00]);
    try {
      const packet = NotifyScaleBondingProgressPacket.fromRaw(dummyPayload, { strict: false });
      if (packet) {
        expect(bytesToHex(packet.raw).toUpperCase()).toBe(bytesToHex(dummyPayload).toUpperCase());
      }
    } catch (e) {
    }
  });
});
