import { describe, it, expect } from 'vitest';
import { ErrorHistoryPacket } from '@/protocol/uplink/history/ErrorHistoryPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

describe('ErrorHistoryPacket', () => {
  it('should parse correctly with age and error code', () => {
    const payload = new Uint8Array([0x00, 0x00, 0x0a, 0xff]);
    const packet = ErrorHistoryPacket.fromRaw(payload);
    expect(packet.opcode).toBe(BoksOpcode.LOG_EVENT_ERROR);
    expect(packet.age).toBe(10);
    expect(packet.errorCode).toBe(0xff);
  });

  it('should encode correctly', () => {
    const packet = new ErrorHistoryPacket({ age: 300, errorCode: 5 });
    const encoded = packet.encode();
    // 0xA0 + 4 + 00012C + 05
    expect(encoded[0]).toBe(0xA0);
    expect(encoded[1]).toBe(4);
    expect(bytesToHex(encoded.subarray(2, 5))).toBe('00012C');
    expect(encoded[5]).toBe(5);
  });

  it('should match fixed hexadecimal reference encoding', () => {
    const packet = new ErrorHistoryPacket({ age: 300, errorCode: 5 });
    // Checksum: 0x94 + 4 + 0 + 1 + 0x2C + 5 = 148 + 4 + 1 + 44 + 5 = 202 (0xCA) - Wait, let me re-calculate
    // Opcode 0x94 (148)
    // Len 4
    // Age 300 -> 00 01 2C (0, 1, 44)
    // Error 5
    // Sum: 148 + 4 + 0 + 1 + 44 + 5 = 202 (0xCA)
    expect(bytesToHex(packet.encode())).toBe('A00400012C05D6');
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = ErrorHistoryPacket.fromRaw(new Uint8Array([0x00, 0x00, 0x0a, 0xff]));
    const json = packet.toJSON();
    expect(json).toStrictEqual({ validChecksum: null,
        "age": 10,
        "errorCode": 255,
        "opcode": 160,
      });
  });
});
