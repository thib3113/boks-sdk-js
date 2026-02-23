import { describe, it, expect } from 'vitest';
import { OpenDoorPacket } from '@/protocol/downlink/OpenDoorPacket';
import { BoksProtocolError, BoksProtocolErrorId } from '@/errors/BoksProtocolError';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex, stringToBytes } from '@/utils/converters';

describe('OpenDoorPacket', () => {
  const validPin = '123456';

  it('should construct with valid parameters', () => {
    const packet = new OpenDoorPacket(validPin);
    expect(packet.opcode).toBe(BoksOpcode.OPEN_DOOR);
    expect(packet.pin).toBe(validPin);
  });

  it('should encode correctly', () => {
    const packet = new OpenDoorPacket(validPin);
    const encoded = packet.encode();
    expect(encoded[0]).toBe(0x01);
    expect(encoded[1]).toBe(6);

    // Pin "123456" -> 313233343536
    const expectedPayload = '313233343536';
    expect(bytesToHex(encoded.subarray(2, 8))).toBe(expectedPayload);
  });

  it('should parse from payload correctly', () => {
    const payload = stringToBytes(validPin);
    const packet = OpenDoorPacket.fromPayload(payload);
    expect(packet.pin).toBe(validPin);
  });

  it('should throw INVALID_PIN_FORMAT for invalid pin', () => {
      expect(() => new OpenDoorPacket('123')).toThrowError(BoksProtocolError);
      expect(() => new OpenDoorPacket('12345C')).toThrowError(BoksProtocolError);
  });

  it('should fail parsing if payload is too short', () => {
      const shortPayload = new Uint8Array(5);
      expect(() => OpenDoorPacket.fromPayload(shortPayload)).toThrowError(BoksProtocolError);
  });
});
