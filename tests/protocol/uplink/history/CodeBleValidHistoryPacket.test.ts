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
    expect(packet.connectedMac).toBe('000000000000');
  });

  it('should match fixed hexadecimal reference encoding', () => {
    const packet = new CodeBleValidHistoryPacket({
      age: 100,
      code: '123456',
      connectedMac: '000000000000'
    });
    const encoded = packet.encode();
    expect(bytesToHex(encoded)).toBe('8611000064313233343536000000000000000030');
  });

  it('should cover the code branch where length is strictly 17', () => {
    const payload = new Uint8Array([0, 0, 3, 49, 50, 51, 52, 53, 54, 53, 54, 55, 56, 57, 48, 0, 0]);
    const packet = CodeBleValidHistoryPacket.fromPayload(payload);
    expect(packet.connectedMac).toBe('000030393837');
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = CodeBleValidHistoryPacket.fromPayload(new Uint8Array([0, 0, 10, 49, 50, 51, 52, 53, 54, 0, 0, 0, 0, 0, 0, 0, 0]));
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "age": 10,
        "code": "123456",
        "connectedMac": "000000000000",
        "opcode": 134,
      });
  });
});
