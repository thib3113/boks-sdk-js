import { describe, it, expect } from 'vitest';
import { BoksProtocolErrorId } from '../../../src/errors/BoksProtocolError';
import { GetLogsCountPacket } from '@/protocol/downlink/GetLogsCountPacket';
import { bytesToHex } from '@/utils/converters';

describe('GetLogsCountPacket', () => {
  it('should generate correct binary for GetLogsCount (0x07)', () => {
    const packet = new GetLogsCountPacket();
    expect(bytesToHex(packet.encode())).toBe('070007');
  });
});



