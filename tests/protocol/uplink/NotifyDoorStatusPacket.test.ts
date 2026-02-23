import { describe, it, expect } from 'vitest';
import { NotifyDoorStatusPacket } from '@/protocol/uplink/NotifyDoorStatusPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('NotifyDoorStatusPacket', () => {
  it('should detect OPEN state (inv=0, raw=1)', () => {
    const payload = new Uint8Array([0x00, 0x01]);
    const packet = NotifyDoorStatusPacket.fromPayload(payload);
    expect(packet.opcode).toBe(BoksOpcode.NOTIFY_DOOR_STATUS);
    expect(packet.isOpen).toBe(true);
  });

  it('should detect CLOSED state (inv=1, raw=0)', () => {
    const payload = new Uint8Array([0x01, 0x00]);
    const packet = NotifyDoorStatusPacket.fromPayload(payload);
    expect(packet.isOpen).toBe(false);
  });

  it('should detect CLOSED state if inconsistent (inv=0, raw=0)', () => {
    const payload = new Uint8Array([0x00, 0x00]);
    const packet = NotifyDoorStatusPacket.fromPayload(payload);
    expect(packet.isOpen).toBe(false);
  });

  it('should default to CLOSED if payload too short', () => {
    const payload = new Uint8Array(1);
    const packet = NotifyDoorStatusPacket.fromPayload(payload);
    expect(packet.isOpen).toBe(false);
  });
});
