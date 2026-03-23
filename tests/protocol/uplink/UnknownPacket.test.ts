import { describe, it, expect } from 'vitest';
import { UnknownPacket } from '../../../src/protocol/uplink/UnknownPacket';

describe('UnknownPacket', () => {
  it('should initialize correctly with opcode and payload', () => {
    const payload = new Uint8Array([0xAA, 0xBB, 0xCC]);
    const packet = new UnknownPacket(0x99, payload);

    expect(packet.opcode).toBe(0x99);
    expect(packet.payload).toEqual(payload);
  });

  it('should serialize to JSON correctly', () => {
    const payload = new Uint8Array([0xAA, 0xBB, 0xCC]);
    const packet = new UnknownPacket(0x99, payload);
    const json = packet.toJSON();

    expect(json.opcode).toBe(0x99);
    expect(json.payload).toEqual(payload);
  });
});
