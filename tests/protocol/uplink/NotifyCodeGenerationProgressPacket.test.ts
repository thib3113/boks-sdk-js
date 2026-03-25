import { BoksPacketFactory } from '@/protocol/BoksPacketFactory';
import { describe, it, expect } from 'vitest';
import { NotifyCodeGenerationProgressPacket } from '@/protocol/uplink/NotifyCodeGenerationProgressPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

describe('NotifyCodeGenerationProgressPacket', () => {
  it('should parse correctly', () => {
    // 50%
    const payload = new Uint8Array([50]);
    const packet = NotifyCodeGenerationProgressPacket.fromRaw(payload);

    expect(packet.opcode).toBe(BoksOpcode.NOTIFY_CODE_GENERATION_PROGRESS);
    expect(packet.progress).toBe(50);
  });

  it('should match fixed hexadecimal reference encoding', () => {
    const packet = new NotifyCodeGenerationProgressPacket(50);
    const encoded = packet.encode();
    // Opcode 0xC2 (194), Len 1, Progress 50 (0x32), Checksum 0xF5 (194+1+50=245=0xF5)
    expect(bytesToHex(encoded)).toBe('C20132F5');
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = NotifyCodeGenerationProgressPacket.fromRaw(new Uint8Array([50]));
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "opcode": 194,
        "progress": 50,
      "validChecksum": null,

      });
  });

  it('should retain the exact raw payload when constructed from hex via factory', () => {
    const dummyPayload = new Uint8Array([NotifyCodeGenerationProgressPacket.opcode, 0x05, 0x01, 0x02, 0x03, 0x04, 0x05, 0x00]);
    const hex = bytesToHex(dummyPayload);
    const packet = BoksPacketFactory.fromRaw(hexToBytes(hex, { strict: false });
    expect(bytesToHex(packet.raw).toUpperCase()).toBe(hex.toUpperCase());
  });
});
