import { BoksPacketFactory } from '@/protocol/BoksPacketFactory';
import { describe, it, expect } from 'vitest';
import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';

describe('BoksRXPacketBase', () => {
  it('toPayload should return the raw', () => {
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



  it('should retain the exact raw payload when constructed from hex via factory', () => {
    const dummyPayload = new Uint8Array([BoksRXPacketBase.opcode, 0x05, 0x01, 0x02, 0x03, 0x04, 0x05, 0x00]);
    const hex = bytesToHex(dummyPayload);
    const packet = BoksPacketFactory.fromHex(hex, { strict: false });
    expect(bytesToHex(packet.raw).toUpperCase()).toBe(hex.toUpperCase());
  });
});
