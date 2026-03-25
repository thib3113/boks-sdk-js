import { describe, it, expect } from 'vitest';
import { BleRebootHistoryPacket } from '@/protocol/uplink/history/BleRebootHistoryPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';
import { buildMockRawPacket } from '../../../../utils/packet-builder';

describe('BleRebootHistoryPacket', () => {
  it('should parse correctly with age', () => {
    // Age 10 (0x0a)
    const payload = new Uint8Array([0x00, 0x00, 0x0a]);
    const packet = BleRebootHistoryPacket.fromRaw(buildMockRawPacket(BleRebootHistoryPacket.opcode, payload));

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
    expect(() => BleRebootHistoryPacket.fromRaw(buildMockRawPacket(BleRebootHistoryPacket.opcode, payload))).toThrowError();
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = BleRebootHistoryPacket.fromRaw(buildMockRawPacket(BleRebootHistoryPacket.opcode, new Uint8Array([0x00, 0x00, 0x0a])));
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "age": 10,
        "opcode": 151,
      });
  });
});
