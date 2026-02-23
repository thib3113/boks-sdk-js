import { describe, it, expect } from 'vitest';
import { AnswerDoorStatusPacket } from '@/protocol/uplink/AnswerDoorStatusPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('AnswerDoorStatusPacket', () => {
  it('should detect OPEN state (inv=0, raw=1)', () => {
    const payload = new Uint8Array([0x00, 0x01]);
    const packet = AnswerDoorStatusPacket.fromPayload(payload);
    expect(packet.opcode).toBe(BoksOpcode.ANSWER_DOOR_STATUS);
    expect(packet.isOpen).toBe(true);
  });

  it('should detect CLOSED state (inv=1, raw=0)', () => {
    const payload = new Uint8Array([0x01, 0x00]);
    const packet = AnswerDoorStatusPacket.fromPayload(payload);
    expect(packet.isOpen).toBe(false);
  });

  it('should default to CLOSED if payload too short', () => {
    const payload = new Uint8Array(1);
    const packet = AnswerDoorStatusPacket.fromPayload(payload);
    expect(packet.isOpen).toBe(false);
  });
});
