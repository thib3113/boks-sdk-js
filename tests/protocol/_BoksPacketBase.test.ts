import { describe, it, expect } from 'vitest';
import { BoksPacket } from '../../src/protocol/_BoksPacketBase';
import { BoksProtocolError, BoksProtocolErrorId } from '../../src/errors/BoksProtocolError';

describe('BoksPacketBase', () => {
  it('should throw NOT_IMPLEMENTED if fromPayload is not implemented', () => {
    expect(() => BoksPacket.fromPayload(new Uint8Array())).toThrowError(
      new BoksProtocolError(BoksProtocolErrorId.NOT_IMPLEMENTED, 'fromPayload not implemented')
    );
  });
});
