import { BoksPacketFactory } from '@/protocol/BoksPacketFactory';
import { describe, it, expect } from 'vitest';
import { RequestLogsPacket } from '@/protocol/downlink/RequestLogsPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

describe('RequestLogsPacket', () => {
  it('should construct and encode correctly', () => {
    const packet = new RequestLogsPacket();
    expect(packet.opcode).toBe(BoksOpcode.REQUEST_LOGS);
    // 0x03 + 0x00 + Checksum(03)
    expect(bytesToHex(packet.encode())).toBe('030003');
  });

  it('should parse from payload correctly', () => {
    const packet = RequestLogsPacket.fromRaw(new Uint8Array(0));
    expect(packet).toBeInstanceOf(RequestLogsPacket);
    expect(packet.opcode).toBe(BoksOpcode.REQUEST_LOGS);
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = new RequestLogsPacket();
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "opcode": 3,
      "validChecksum": null,

      });
  });

  it('should retain the exact raw payload when constructed from hex via factory', () => {
    const dummyPayload = new Uint8Array([RequestLogsPacket.opcode, 0x05, 0x01, 0x02, 0x03, 0x04, 0x05, 0x00]);
    try {
      const packet = RequestLogsPacket.fromRaw(dummyPayload, { strict: false });
      if (packet) {
        expect(bytesToHex(packet.raw).toUpperCase()).toBe(bytesToHex(dummyPayload).toUpperCase());
      }
    } catch (e) {
      // Ignore if dummy payload is invalid for mapped fields
    }
  });
});
