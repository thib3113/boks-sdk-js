import { describe, it, expect } from 'vitest';
import { BoksProtocolErrorId } from '../../../src/errors/BoksProtocolError';
import { RequestLogsPacket } from '@/protocol/downlink/RequestLogsPacket';
import { bytesToHex } from '@/utils/converters';

describe('RequestLogsPacket', () => {
  it('should generate correct binary for RequestLogs (0x03)', () => {
    const packet = new RequestLogsPacket();
    expect(bytesToHex(packet.encode())).toBe('030003');
  });
});



