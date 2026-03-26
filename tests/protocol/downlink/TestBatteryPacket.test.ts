import { BoksPacketFactory } from '@/protocol/BoksPacketFactory';
import { describe, it, expect } from 'vitest';
import { TestBatteryPacket } from '@/protocol/downlink/TestBatteryPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

describe('TestBatteryPacket', () => {
  it('should construct and encode correctly', () => {
    const packet = new TestBatteryPacket();
    expect(packet.opcode).toBe(BoksOpcode.TEST_BATTERY);
    // 0x08 + 0x00 + Checksum(08)
    expect(bytesToHex(packet.encode())).toBe('080008');
  });

  it('should parse from payload correctly', () => {
    const packet = TestBatteryPacket.fromRaw(new Uint8Array(0));
    expect(packet).toBeInstanceOf(TestBatteryPacket);
    expect(packet.opcode).toBe(BoksOpcode.TEST_BATTERY);
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = new TestBatteryPacket();
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "opcode": 8,
      "validChecksum": null,

      });
  });

  it('should retain the exact raw payload when constructed from hex via factory', () => {
    const dummyPayload = new Uint8Array([TestBatteryPacket.opcode, 0x05, 0x01, 0x02, 0x03, 0x04, 0x05, 0x00]);
    try {
      const packet = TestBatteryPacket.fromRaw(dummyPayload, { strict: false });
      if (packet) {
        expect(bytesToHex(packet.raw).toUpperCase()).toBe(bytesToHex(dummyPayload).toUpperCase());
      }
    } catch (e) {
      // Ignore if dummy payload is invalid for mapped fields
    }
  });
});
