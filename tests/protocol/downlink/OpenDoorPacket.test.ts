import { BoksProtocolError } from '@/errors/BoksProtocolError';
import { describe, it, expect } from 'vitest';
import { OpenDoorPacket, PayloadPinCode } from '@/protocol/downlink/OpenDoorPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex, stringToBytes } from '@/utils/converters';

describe('OpenDoorPacket', () => {
  const validPin = '12345A';

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

    // Pin "12345A" -> 313233343541
    const expectedPayload = '313233343541';
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

  it('PayloadPinCode decorator ignores non-accessors', () => {
    const decorator = PayloadPinCode();
    const fakeContext = { kind: 'method' } as any;
    expect(decorator({} as any, fakeContext)).toBeUndefined();
  });

  it('PayloadPinCode handles initialized properties correctly', () => {
    class MockPacket {
      @PayloadPinCode()
      accessor pin: string = '12345a';
    }
    const p = new MockPacket();
    expect(p.pin).toBe('12345A'); // It validates and upper cases on init
  });
});
