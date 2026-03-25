import { describe, expect, it } from 'vitest';
import { CodeBleValidHistoryPacket } from '@/protocol/uplink/history/CodeBleValidHistoryPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

describe('CodeBleValidHistoryPacket', () => {
  it('should parse correctly with age and code', () => {
    // Note: The MAC bytes are sent in little-endian over the air and must be parsed accordingly.
    // To yield '112233445566', the payload should have [0x66, 0x55, 0x44, 0x33, 0x22, 0x11] at offset 11.
    const payload = new Uint8Array([0, 0, 10, 49, 50, 51, 52, 53, 54, 0, 0, 0x66, 0x55, 0x44, 0x33, 0x22, 0x11]);
    const packet = CodeBleValidHistoryPacket.fromRaw(buildMockRawPacket(CodeBleValidHistoryPacket.opcode, payload));

    expect(packet.opcode).toBe(BoksOpcode.LOG_CODE_BLE_VALID);
    expect(packet.age).toBe(10);
    expect(packet.code).toBe('123456');
    expect(packet.connectedMac).toBe('112233445566');
  });

  it('should match fixed hexadecimal reference encoding', () => {
    const packet = new CodeBleValidHistoryPacket({
      age: 100,
      code: '123456',
      connectedMac: '112233445566'
    });
    const encoded = packet.encode();
    expect(bytesToHex(encoded)).toBe('8611000064313233343536000066554433221195');
  });

  it('should cover the code branch where length is strictly 17', () => {
    const payload = new Uint8Array([0, 0, 3, 49, 50, 51, 52, 53, 54, 0, 0, 53, 54, 55, 56, 57, 48]);
    const packet = CodeBleValidHistoryPacket.fromRaw(buildMockRawPacket(CodeBleValidHistoryPacket.opcode, payload));
    // 53, 54, 55, 56, 57, 48 (which is 0x35, 0x36, 0x37, 0x38, 0x39, 0x30)
    // Becomes MAC: 303938373635
    expect(packet.connectedMac).toBe('303938373635');
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = CodeBleValidHistoryPacket.fromRaw(buildMockRawPacket(CodeBleValidHistoryPacket.opcode, new Uint8Array([0, 0, 10, 49, 50, 51, 52, 53, 54, 0, 0, 0x66, 0x55, 0x44, 0x33, 0x22, 0x11])));
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "age": 10,
        "code": "123456",
        "connectedMac": "112233445566",
        "opcode": 134,
      });
  });
});
