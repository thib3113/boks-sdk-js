import { describe, expect, it } from 'vitest';
import { CodeBleInvalidHistoryPacket } from '@/protocol/uplink/history/CodeBleInvalidHistoryPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

describe('CodeBleInvalidHistoryPacket', () => {
  it('should parse correctly with age and code', () => {
    const payload = new Uint8Array([0, 0, 10, 49, 50, 51, 52, 53, 54, 0x66, 0x55, 0x44, 0x33, 0x22, 0x11, 0, 0]);
    const packet = CodeBleInvalidHistoryPacket.fromPayload(payload);

    expect(packet.opcode).toBe(BoksOpcode.LOG_CODE_BLE_INVALID);
    expect(packet.age).toBe(10);
    expect(packet.code).toBe('123456');
    expect(packet.connectedMac).toBe('112233445566');
  });

  it('should match fixed hexadecimal reference encoding', () => {
    const packet = new CodeBleInvalidHistoryPacket({
      age: 100,
      code: '123456',
      connectedMac: '112233445566'
    });
    const encoded = packet.encode();
    // 0x32 (old checksum) + 0x171 = 0x1A3 -> A3
    expect(bytesToHex(encoded)).toBe('88110000643132333435366655443322110000A3');
  });

  it('should cover the code branch where length is strictly 17', () => {
    const payload = new Uint8Array([0, 0, 3, 49, 50, 51, 52, 53, 54, 53, 54, 55, 56, 57, 48, 0, 0]);
    const packet = CodeBleInvalidHistoryPacket.fromPayload(payload);
    expect(packet.connectedMac).toBe('303938373635');
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = CodeBleInvalidHistoryPacket.fromPayload(new Uint8Array([0, 0, 10, 49, 50, 51, 52, 53, 54, 0x66, 0x55, 0x44, 0x33, 0x22, 0x11, 0, 0]));
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "age": 10,
        "code": "123456",
        "connectedMac": "112233445566",
        "opcode": 136,
      });
  });
});
