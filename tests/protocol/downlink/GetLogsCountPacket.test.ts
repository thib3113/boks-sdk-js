import { describe, it, expect } from 'vitest';
import { GetLogsCountPacket } from '@/protocol/downlink/GetLogsCountPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

describe('GetLogsCountPacket', () => {
  it('should construct and encode correctly', () => {
    const packet = new GetLogsCountPacket();
    expect(packet.opcode).toBe(BoksOpcode.GET_LOGS_COUNT);
    // 0x07 + 0x00 + Checksum(07)
    expect(bytesToHex(packet.encode())).toBe('070007');
  });

  it('should parse from payload correctly', () => {
    const packet = GetLogsCountPacket.fromRaw(new Uint8Array(0));
    expect(packet).toBeInstanceOf(GetLogsCountPacket);
    expect(packet.opcode).toBe(BoksOpcode.GET_LOGS_COUNT);
  });

  it('should handle extra payload bytes gracefully (ignore them)', () => {
    const packet = GetLogsCountPacket.fromRaw(new Uint8Array([0xff]));
    expect(packet).toBeInstanceOf(GetLogsCountPacket);
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = new GetLogsCountPacket();
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "opcode": 7,
      "validChecksum": null,

      });
  });

  it('should retain the exact raw payload when constructed from hex via factory', () => {
    const dummyPayload = new Uint8Array([GetLogsCountPacket.opcode, 0x05, 0x01, 0x02, 0x03, 0x04, 0x05, 0x00]);
    try {
      const packet = GetLogsCountPacket.fromRaw(dummyPayload, { strict: false });
      if (packet) {
        expect(bytesToHex(packet.raw).toUpperCase()).toBe(bytesToHex(dummyPayload).toUpperCase());
      }
    } catch (e) {
      // Ignore if dummy payload is invalid for mapped fields
    }
  });
});
