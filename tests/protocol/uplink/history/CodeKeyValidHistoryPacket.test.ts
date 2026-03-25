import { describe, expect, it } from 'vitest';
import { CodeKeyValidHistoryPacket } from '@/protocol/uplink/history/CodeKeyValidHistoryPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

describe('CodeKeyValidHistoryPacket', () => {
  it('should parse correctly with age and code', () => {
    const payload = new Uint8Array([0, 0, 10, 49, 50, 51, 52, 53, 54]);
    const packet = CodeKeyValidHistoryPacket.fromRaw(payload);

    expect(packet.opcode).toBe(BoksOpcode.LOG_CODE_KEY_VALID);
    expect(packet.age).toBe(10);
    expect(packet.code).toBe('123456');
  });

  it('should encode correctly', () => {
    const packet = new CodeKeyValidHistoryPacket({ age: 200, code: '654321' });
    const encoded = packet.encode();
    // 0x87 + 9 + 0000C8 + 363534333231
    expect(encoded[0]).toBe(0x87);
    expect(encoded[1]).toBe(9);
    expect(bytesToHex(encoded.subarray(2, 5))).toBe('0000C8');
    expect(bytesToHex(encoded.subarray(5, 11))).toBe('363534333231');
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = CodeKeyValidHistoryPacket.fromRaw(new Uint8Array([0, 0, 10, 49, 50, 51, 52, 53, 54]));
    const json = packet.toJSON();
    expect(json).toStrictEqual({ validChecksum: null,
        "age": 10,
        "code": "123456",
        "opcode": 135,
      });
  });
});
