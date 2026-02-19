import { describe, it, expect } from 'vitest';
import { AnswerDoorStatusPacket } from '@/protocol/uplink/AnswerDoorStatusPacket';
import { hexToBytes } from '@/utils/converters';

describe('AnswerDoorStatusPacket', () => {
  it('should parse closed status', () => {
    const packet = AnswerDoorStatusPacket.fromPayload(hexToBytes('0100'));
    expect(packet.isOpen).toBe(false);
  });

  it('should parse open status', () => {
    const packet = AnswerDoorStatusPacket.fromPayload(hexToBytes('0001'));
    expect(packet.isOpen).toBe(true);
  });
});
