import { describe, it, expect } from 'vitest';
import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';

describe('BoksRXPacketBase', () => {
  it('toPayload should return the rawPayload', () => {
    class DummyPacket extends BoksRXPacket {
      constructor() {
        super(0x99, new Uint8Array([1, 2, 3]));
      }
    }
    const packet = new DummyPacket();
    expect(packet.toPayload()).toEqual(new Uint8Array([1, 2, 3]));
  });

  it('opcode getter should return the provided opcode', () => {
    class DummyPacket extends BoksRXPacket {
      constructor() {
        super(0x99);
      }
    }
    const packet = new DummyPacket();
    expect(packet.opcode).toBe(0x99);
  });


});
