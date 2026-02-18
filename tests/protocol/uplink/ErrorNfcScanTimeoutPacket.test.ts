import { describe, it, expect } from 'vitest';
import { ErrorNfcScanTimeoutPacket } from '@/protocol/uplink/ErrorNfcScanTimeoutPacket';

describe('ErrorNfcScanTimeoutPacket', () => {
  it('should have correct status', () => {
    const packet = new ErrorNfcScanTimeoutPacket();
    expect(packet.status).toBe('timeout');
  });
});



