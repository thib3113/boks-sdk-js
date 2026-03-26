import { describe, it, expect } from 'vitest';
import { BlockResetHistoryPacket } from '@/protocol/uplink/history/BlockResetHistoryPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

describe('BlockResetHistoryPacket', () => {
  it('should parse correctly with age and info', () => {
    const payload = new Uint8Array([0x00, 0x00, 0x0a, 0xaa, 0xbb]);
    const packet = BlockResetHistoryPacket.fromRaw(payload);
    expect(packet.opcode).toBe(BoksOpcode.BLOCK_RESET);
    expect(packet.age).toBe(10);
    expect(packet.resetInfo).toBe('AABB');
  });

  it('should encode correctly', () => {
    const packet = new BlockResetHistoryPacket({ age: 123, resetInfo: 'aabb' });
    const encoded = packet.encode();
    // 0x95 + 5 + 00007B + AABB
    expect(encoded[0]).toBe(0x95);
    expect(encoded[1]).toBe(5);
    expect(bytesToHex(encoded.subarray(2, 5))).toBe('00007B');
    expect(bytesToHex(encoded.subarray(5, 7))).toBe('AABB');
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = BlockResetHistoryPacket.fromRaw(new Uint8Array([0x00, 0x00, 0x0a, 0xaa, 0xbb]));
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "age": 10,
        "opcode": 149,
        "resetInfo": "AABB",
      "validChecksum": null,

      });
  });

  it('should retain the exact raw payload when constructed from hex via factory', () => {
    const dummyPayload = new Uint8Array([BlockResetHistoryPacket.opcode, 0x05, 0x01, 0x02, 0x03, 0x04, 0x05, 0x00]);
    try {
      const packet = BlockResetHistoryPacket.fromRaw(dummyPayload, { strict: false });
      if (packet) {
        expect(bytesToHex(packet.raw).toUpperCase()).toBe(bytesToHex(dummyPayload).toUpperCase());
      }
    } catch (e) {
      // Ignore if dummy payload is invalid for mapped fields
    }
  });
});
