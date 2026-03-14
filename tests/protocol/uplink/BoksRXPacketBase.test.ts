import { BoksOpcode } from '@/protocol/constants';
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
    expect(packet.toPayload()).toEqual(new Uint8Array([1, 2, 3]));});


  it('opcode getter should return the provided opcode', () => {
    class DummyPacket extends BoksRXPacket {
        constructor() {
            super(0x99);
        }
    }
    const packet = new DummyPacket();
    expect(packet.opcode).toBe(0x99);});
  it('should return EMPTY_BUFFER if rawPayload is empty or undefined', () => {
    class TestRXPacket2 extends BoksRXPacket {}
    const packet = new TestRXPacket2(BoksOpcode.NOTIFY_NFC_TAG_REGISTERED, undefined);
    expect(packet.toPayload()).toEqual(new Uint8Array(0));
  });
});
