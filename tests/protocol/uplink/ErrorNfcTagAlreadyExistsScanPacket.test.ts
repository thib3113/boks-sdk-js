import { describe, it, expect } from 'vitest';
import { ErrorNfcTagAlreadyExistsScanPacket } from '@/protocol/uplink/ErrorNfcTagAlreadyExistsScanPacket';

describe('ErrorNfcTagAlreadyExistsScanPacket', () => {
  it('should have correct status', () => {
    const packet = ErrorNfcTagAlreadyExistsScanPacket.fromPayload(new Uint8Array(0));
    expect(packet.status).toBe('already_exists');
  });
});
