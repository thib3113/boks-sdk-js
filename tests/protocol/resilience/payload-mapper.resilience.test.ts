import { describe, expect, it } from 'vitest';
import {
  PayloadMapper,
  PayloadUint8,
  PayloadAsciiString,
  PayloadBit,
  PayloadBoolean,
  PayloadByteArray,
  PayloadConfigKey,
  PayloadHexString,
  PayloadMacAddress,
  PayloadMasterCodeIndex,
  PayloadNfcUid,
  PayloadPinCode,
  PayloadSeed,
  PayloadUint16,
  PayloadUint24,
  PayloadUint32,
  PayloadVarLenHex
} from '@/protocol/decorators';
import { BoksProtocolError } from '@/errors/BoksProtocolError';

class DummyPacket {
  @PayloadUint8(0) public accessor valUint8!: number;
  @PayloadAsciiString(1, 4) public accessor valAscii!: string;
  @PayloadBit(5, 1) public accessor valBit!: number;
  @PayloadBoolean(6) public accessor valBool!: boolean;
  @PayloadByteArray(7, 2) public accessor valBytes!: Uint8Array;
  @PayloadConfigKey(9) public accessor valConfigKey!: string;
  @PayloadHexString(17, 2) public accessor valHex!: string;
  @PayloadMacAddress(19) public accessor valMac!: string;
  @PayloadMasterCodeIndex(25) public accessor valMaster!: number;
  @PayloadNfcUid(26) public accessor valNfc!: string;
  @PayloadPinCode(27) public accessor valPin!: string;
  @PayloadSeed(33) public accessor valSeed!: string;
  @PayloadUint16(35) public accessor valUint16!: number;
  @PayloadUint24(37) public accessor valUint24!: number;
  @PayloadUint32(40) public accessor valUint32!: number;
  @PayloadVarLenHex(44) public accessor valVarLenHex!: string;

  constructor(public rawPayload?: Uint8Array) {}
}

class EmptyPacket {}

describe('PayloadMapper Resilience Exhaustive', () => {
  it('should throw BoksProtocolError for PayloadHexString when string contains invalid hex characters', () => {
    class HexPacket {
      @PayloadHexString(0, 5) public accessor valHex!: string;
    }
    const pkt = new HexPacket();
    expect(() => {
      pkt.valHex = '012345678G';
    }).toThrow(BoksProtocolError);
  });

  it('should throw BoksProtocolError for PayloadHexString when type is invalid', () => {
    class HexPacket {
      @PayloadHexString(0, 5) public accessor valHex!: string;
    }
    const pkt = new HexPacket();
    expect(() => {
      // @ts-expect-error
      pkt.valHex = 12345;
    }).toThrow(BoksProtocolError);
  });

  it('should throw BoksProtocolError for PayloadByteArray when length is invalid', () => {
    class BytePacket {
      @PayloadByteArray(0, 5) public accessor valBytes!: Uint8Array;
    }
    const pkt = new BytePacket();
    expect(() => {
      pkt.valBytes = new Uint8Array(2);
    }).toThrow(BoksProtocolError);
  });

  it('should throw BoksProtocolError when parsing invalid object types', () => {
    expect(() => PayloadMapper.parse(null, new Uint8Array(2))).toThrow(BoksProtocolError);
    expect(() => PayloadMapper.parse(undefined, new Uint8Array(2))).toThrow(BoksProtocolError);
    expect(() => PayloadMapper.parse(123, new Uint8Array(2))).toThrow(BoksProtocolError);
    expect(() => PayloadMapper.parse('string', new Uint8Array(2))).toThrow(
      BoksProtocolError
    );

    // @ts-expect-error - Testing invalid input
    expect(() => PayloadMapper.parse(EmptyPacket, 'string')).toThrow(BoksProtocolError);
  });

  it('should throw BoksProtocolError when serializing invalid instances', () => {
    expect(() => PayloadMapper.serialize(null)).toThrow(BoksProtocolError);
    expect(() => PayloadMapper.serialize(undefined)).toThrow(BoksProtocolError);
    expect(() => PayloadMapper.serialize(123)).toThrow(BoksProtocolError);
    expect(() => PayloadMapper.serialize('string')).toThrow(BoksProtocolError);
  });

  it('should initialize properties on accessors', () => {
    const obj = new DummyPacket();
    expect(obj.valUint8).toBeUndefined();

    // Assigning invalid values to test setter throws
    // The decorators throw BoksProtocolError on undefined/null
    // @ts-expect-error - Testing invalid input
    expect(() => (obj.valUint8 = undefined)).toThrow(BoksProtocolError);
    // @ts-expect-error - Testing invalid input
    expect(() => (obj.valAscii = null)).toThrow(BoksProtocolError);
    // @ts-expect-error - Testing invalid input
    expect(() => (obj.valBit = null)).toThrow(BoksProtocolError);
    // @ts-expect-error - Testing invalid input
    expect(() => (obj.valBool = null)).toThrow(BoksProtocolError);
    // @ts-expect-error - Testing invalid input
    expect(() => (obj.valBytes = null)).toThrow(BoksProtocolError);
    // @ts-expect-error - Testing invalid input
    expect(() => (obj.valConfigKey = null)).toThrow(BoksProtocolError);
    // @ts-expect-error - Testing invalid input
    expect(() => (obj.valHex = null)).toThrow(BoksProtocolError);
    // @ts-expect-error - Testing invalid input
    expect(() => (obj.valMac = null)).toThrow(BoksProtocolError);
    // @ts-expect-error - Testing invalid input
    expect(() => (obj.valMaster = null)).toThrow(BoksProtocolError);
    // @ts-expect-error - Testing invalid input
    expect(() => (obj.valNfc = null)).toThrow(BoksProtocolError);
    // @ts-expect-error - Testing invalid input
    expect(() => (obj.valPin = null)).toThrow(BoksProtocolError);
    // @ts-expect-error - Testing invalid input
    expect(() => (obj.valSeed = null)).toThrow(BoksProtocolError);
    // @ts-expect-error - Testing invalid input
    expect(() => (obj.valUint16 = null)).toThrow(BoksProtocolError);
    // @ts-expect-error - Testing invalid input
    expect(() => (obj.valUint24 = null)).toThrow(BoksProtocolError);
    // @ts-expect-error - Testing invalid input
    expect(() => (obj.valUint32 = null)).toThrow(BoksProtocolError);
    // @ts-expect-error - Testing invalid input
    expect(() => (obj.valVarLenHex = null)).toThrow(BoksProtocolError);
  });
});
