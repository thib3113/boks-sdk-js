import { BoksPacketFactory } from '@/protocol/BoksPacketFactory';
import { describe, expect, it } from 'vitest';
import { CodeBleInvalidHistoryPacket } from '@/protocol/uplink/history/CodeBleInvalidHistoryPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

describe('CodeBleInvalidHistoryPacket', () => {
  it('should parse correctly with age and code', () => {
    // Length 17: Age (3), Code (6), Padding (2), Mac (6)
    // Offset 11: 0x66, 0x55, 0x44, 0x33, 0x22, 0x11
    const payload = new Uint8Array([0, 0, 10, 49, 50, 51, 52, 53, 54, 0, 0, 0x66, 0x55, 0x44, 0x33, 0x22, 0x11]);
    const packet = CodeBleInvalidHistoryPacket.fromRaw(payload);

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
    expect(bytesToHex(encoded)).toBe('8811000064313233343536000066554433221197');
  });

  it('should cover the code branch where length is strictly 17', () => {
    const payload = new Uint8Array([0, 0, 3, 49, 50, 51, 52, 53, 54, 0, 0, 53, 54, 55, 56, 57, 48]);
    const packet = CodeBleInvalidHistoryPacket.fromRaw(payload);
    expect(packet.connectedMac).toBe('303938373635');
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = CodeBleInvalidHistoryPacket.fromRaw(new Uint8Array([0, 0, 10, 49, 50, 51, 52, 53, 54, 0, 0, 0x66, 0x55, 0x44, 0x33, 0x22, 0x11]));
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "age": 10,
        "code": "123456",
        "connectedMac": "112233445566",
        "opcode": 136,
      "validChecksum": null,

      });
  });

  it('should retain the exact raw payload when constructed from hex via factory', () => {
    const dummyPayload = new Uint8Array([CodeBleInvalidHistoryPacket.opcode, 0x05, 0x01, 0x02, 0x03, 0x04, 0x05, 0x00]);
    const hex = bytesToHex(dummyPayload);
    const packet = BoksPacketFactory.fromRaw(hexToBytes(hex, { strict: false });
    expect(bytesToHex(packet.raw).toUpperCase()).toBe(hex.toUpperCase());
  });
});
