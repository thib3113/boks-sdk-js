import { BoksPacketFactory } from '@/protocol/BoksPacketFactory';
import { describe, it, expect } from 'vitest';
import { BleRebootHistoryPacket } from '@/protocol/uplink/history/BleRebootHistoryPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

describe('BleRebootHistoryPacket', () => {
  it('should parse correctly with age', () => {
    // Age 10 (0x0a)
    const payload = new Uint8Array([0x00, 0x00, 0x0a]);
    const packet = BleRebootHistoryPacket.fromRaw(payload);

    expect(packet.opcode).toBe(BoksOpcode.BLE_REBOOT);
    expect(packet.age).toBe(10);
  });

  it('should encode correctly', () => {
    const payload = new Uint8Array([0x00, 0x00, 0x0a]);
    const packet = new BleRebootHistoryPacket({ age: 10 }, payload);
    
    expect(bytesToHex(packet.toPayload())).toBe('00000A');
    expect(bytesToHex(packet.encode())).toBe('970300000AA4');
  });

  it('should match fixed hexadecimal reference encoding', () => {
    const packet = new BleRebootHistoryPacket({ age: 10 });
    expect(bytesToHex(packet.encode())).toBe('970300000AA4');
  });

  it('should throw error on short payload', () => {
    const payload = new Uint8Array(2);
    expect(() => BleRebootHistoryPacket.fromRaw(payload)).toThrowError();
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = BleRebootHistoryPacket.fromRaw(new Uint8Array([0x00, 0x00, 0x0a]));
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "age": 10,
        "opcode": 151,
      "validChecksum": null,

      });
  });

  it('should retain the exact raw payload when constructed from hex via factory', () => {
    const dummyPayload = new Uint8Array([BleRebootHistoryPacket.opcode, 0x05, 0x01, 0x02, 0x03, 0x04, 0x05, 0x00]);
    const hex = bytesToHex(dummyPayload);
    const packet = BoksPacketFactory.fromHex(hex, { strict: false });
    expect(bytesToHex(packet.raw).toUpperCase()).toBe(hex.toUpperCase());
  });
});
