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
    const packet = RequestLogsPacket.fromPayload(new Uint8Array(0));
    expect(packet).toBeInstanceOf(RequestLogsPacket);
    expect(packet.opcode).toBe(BoksOpcode.REQUEST_LOGS);
  });
});
