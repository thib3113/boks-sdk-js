import { describe, it, expect } from 'vitest';
import { PayloadMapper } from '../../src/protocol/decorators/PayloadMapper';
import { BoksPacket } from '../../src/protocol/_BoksPacketBase';
import { BoksProtocolError, BoksProtocolErrorId } from '../../src/errors/BoksProtocolError';

describe('BoksPacketBase', () => {
  it('should throw NOT_IMPLEMENTED if fromRaw is not implemented', () => {
    expect(() => BoksPacket.fromRaw(new Uint8Array())).toThrowError(
      new BoksProtocolError(BoksProtocolErrorId.NOT_IMPLEMENTED, 'fromRaw not implemented')
    );
  });
});

  it('should test missing property in toJSON', () => {
    class DummyPacket extends BoksPacket {
      get opcode() { return 0x99; }
      constructor() { super(); }
    }
    // inject a fake mapped field

    PayloadMapper.defineSchema(DummyPacket, [{ propertyName: 'fakeProp', type: 'uint8', offset: 0 }]);
    const packet = new DummyPacket();
    const json = packet.toJSON();
    expect(json).toEqual({ opcode: 0x99 });
  });
