import { BoksPacketFactory } from '@/protocol/BoksPacketFactory';
import { describe, it, expect } from 'vitest';
import { PowerOffHistoryPacket } from '@/protocol/uplink/history/PowerOffHistoryPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

describe('PowerOffHistoryPacket', () => {
  it('should parse correctly with age and reason', () => {
    // age 60 (0x3c), reason 1
    const payload = new Uint8Array([0x00, 0x00, 0x3c, 0x01]);
    const packet = PowerOffHistoryPacket.fromRaw(payload);

    expect(packet.opcode).toBe(BoksOpcode.POWER_OFF);
    expect(packet.age).toBe(60);
    expect(packet.reason).toBe(1);
  });

  it('should encode correctly', () => {
    const payload = new Uint8Array([0x00, 0x00, 0x3c, 0x01]);
    const packet = new PowerOffHistoryPacket({ age: 60, reason: 1 }, payload);
    
    expect(bytesToHex(packet.toPayload())).toBe('00003C01');
    expect(bytesToHex(packet.encode())).toBe('940400003C01D5');
  });

  it('should throw error on missing reason', () => {
    const payload = new Uint8Array([0x00, 0x00, 0x0a]);
    expect(() => PowerOffHistoryPacket.fromRaw(payload)).toThrowError();
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = PowerOffHistoryPacket.fromRaw(new Uint8Array([0x00, 0x00, 0x3c, 0x01]));
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "age": 60,
        "opcode": 148,
        "reason": 1,
      "validChecksum": null,

      });
  });

  it('should retain the exact raw payload when constructed from hex via factory', () => {
    const dummyPayload = new Uint8Array([PowerOffHistoryPacket.opcode, 0x05, 0x01, 0x02, 0x03, 0x04, 0x05, 0x00]);
    const hex = bytesToHex(dummyPayload);
    const packet = BoksPacketFactory.fromHex(hex, { strict: false });
    expect(bytesToHex(packet.raw).toUpperCase()).toBe(hex.toUpperCase());
  });
});
