import { describe, it, expect } from 'vitest';
import { BoksPacket } from '../../src/protocol/_BoksPacketBase';
import { BoksProtocolError, BoksProtocolErrorId } from '../../src/errors/BoksProtocolError';

describe('BoksPacketBase', () => {
  it('should throw MALFORMED_DATA if fromPayload is not implemented', () => {
    expect(() => BoksPacket.fromPayload(new Uint8Array())).toThrowError(
      new BoksProtocolError(BoksProtocolErrorId.MALFORMED_DATA, 'fromPayload not implemented', { expected: 'implemented function', received: 'not implemented' })
    );
  });
});
