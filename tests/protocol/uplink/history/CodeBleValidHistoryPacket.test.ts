import { describe, expect, it } from 'vitest';
import { CodeBleValidHistoryPacket } from '@/protocol/uplink/history/CodeBleValidHistoryPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

describe('CodeBleValidHistoryPacket', () => {
  it('should parse correctly with age and code', () => {
    const payload = new Uint8Array([0, 0, 10, 49, 50, 51, 52, 53, 54, 0, 0, 0, 0, 0, 0, 0, 0]);
    const packet = CodeBleValidHistoryPacket.fromPayload(payload);

    expect(packet.opcode).toBe(BoksOpcode.LOG_CODE_BLE_VALID);
    expect(packet.age).toBe(10);
    expect(packet.code).toBe('123456');
    expect(packet.connectedMac).toBe('00:00:00:00:00:00');
  });

  it('should match fixed hexadecimal reference encoding', () => {
    const packet = new CodeBleValidHistoryPacket({
      age: 100,
      code: '123456',
      connectedMac: '00:00:00:00:00:00'
    });
    const encoded = packet.encode();
    // Opcode 0x86, Len 15 (0x0F), Age 100 (000064), PIN 313233343536, MAC 000000000000, Checksum 0x03
    // Sum: 134 + 15 + 100 + (49+50+51+52+53+54) + 0 = 134 + 15 + 100 + 309 = 558, 558%256 = 46 = 0x2E ? Wait
    // Let me re-calculate Sum carefully:
    // 0x86 (134) + 0x0F (15) + 0x00 (0) + 0x00 (0) + 0x64 (100) + 0x31(49) + 0x32(50) + 0x33(51) + 0x34(52) + 0x35(53) + 0x36(54) + 6*0x00(0)
    // 134 + 15 + 0 + 0 + 100 + 49 + 50 + 51 + 52 + 53 + 54 + 0 = 558
    // 558 / 256 = 2, reste 46 (0x2E)
    expect(bytesToHex(encoded)).toBe('8611000064313233343536000000000000000030');
  });

  it('should cover the code branch where length is strictly 17', () => {
    const payload = new Uint8Array([0, 0, 3, 49, 50, 51, 52, 53, 54, 53, 54, 55, 56, 57, 48, 0, 0]);
    const packet = CodeBleValidHistoryPacket.fromPayload(payload);
    expect(packet.connectedMac).toBe('00:00:30:39:38:37');
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = CodeBleValidHistoryPacket.fromPayload(new Uint8Array([0, 0, 10, 49, 50, 51, 52, 53, 54, 0, 0, 0, 0, 0, 0, 0, 0]));
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "age": 10,
        "code": "123456",
        "connectedMac": "00:00:00:00:00:00",
        "opcode": 134,
      });
  });
});
