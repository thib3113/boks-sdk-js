import { BoksProtocolError } from '@/errors/BoksProtocolError';
import { describe, it, expect } from 'vitest';
import { OpenDoorPacket } from '@/protocol/downlink/OpenDoorPacket';
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
    console.log('ENCODED:', bytesToHex(encoded));
    expect(encoded[0]).toBe(0x01);
    expect(encoded[1]).toBe(6);

    // Pin "123456" -> 313233343536
    const expectedPayload = '313233343536';
    expect(bytesToHex(encoded.subarray(2, 8))).toBe(expectedPayload);
  });

  it('should match fixed hexadecimal reference encoding', () => {
    const packet = new OpenDoorPacket('123456');
    const encoded = packet.encode();
    // Opcode 0x01, Len 6, Pin '123456', Checksum 0x3C
    expect(bytesToHex(encoded)).toBe('01063132333435363C');
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

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = new OpenDoorPacket(validPin);
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "opcode": 1,
        "pin": "123456",
      });
  });
});
