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
    const packet = GetLogsCountPacket.fromPayload(new Uint8Array(0));
    expect(packet).toBeInstanceOf(GetLogsCountPacket);
    expect(packet.opcode).toBe(BoksOpcode.GET_LOGS_COUNT);
  });

  it('should handle extra payload bytes gracefully (ignore them)', () => {
      const packet = GetLogsCountPacket.fromPayload(new Uint8Array([0xFF]));
      expect(packet).toBeInstanceOf(GetLogsCountPacket);
  });
});
