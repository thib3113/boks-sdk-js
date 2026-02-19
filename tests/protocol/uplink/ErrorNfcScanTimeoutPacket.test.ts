import { describe, it, expect } from 'vitest';
import { ErrorNfcScanTimeoutPacket } from '@/protocol/uplink/ErrorNfcScanTimeoutPacket';

describe('ErrorNfcScanTimeoutPacket', () => {
  it('should have correct status', () => {
    const packet = ErrorNfcScanTimeoutPacket.fromPayload(new Uint8Array(0));
    expect(packet.status).toBe('timeout');
  });
});
