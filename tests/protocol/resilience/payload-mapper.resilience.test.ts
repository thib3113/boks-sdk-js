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
  it('should throw BoksProtocolError when parsing invalid object types', () => {
    expect(() => PayloadMapper.parse(null, new Uint8Array(2))).toThrow(BoksProtocolError);
    expect(() => PayloadMapper.parse(undefined, new Uint8Array(2))).toThrow(BoksProtocolError);
    expect(() => PayloadMapper.parse(123 as any, new Uint8Array(2))).toThrow(BoksProtocolError);
    expect(() => PayloadMapper.parse('string' as any, new Uint8Array(2))).toThrow(
      BoksProtocolError
    );

    expect(() => PayloadMapper.parse(EmptyPacket, 'string' as any)).toThrow(BoksProtocolError);
  });

  it('should throw BoksProtocolError when serializing invalid instances', () => {
    expect(() => PayloadMapper.serialize(null)).toThrow(BoksProtocolError);
    expect(() => PayloadMapper.serialize(undefined)).toThrow(BoksProtocolError);
    expect(() => PayloadMapper.serialize(123 as any)).toThrow(BoksProtocolError);
    expect(() => PayloadMapper.serialize('string' as any)).toThrow(BoksProtocolError);
  });

  it('should initialize properties on accessors', () => {
    const obj = new DummyPacket();
    expect(obj.valUint8).toBeUndefined();

    // Assigning invalid values to test setter throws
    // The decorators throw BoksProtocolError on undefined/null
    expect(() => (obj.valUint8 = undefined as any)).toThrow(BoksProtocolError);
    expect(() => (obj.valAscii = null as any)).toThrow(BoksProtocolError);
    expect(() => (obj.valBit = null as any)).toThrow(BoksProtocolError);
    expect(() => (obj.valBool = null as any)).toThrow(BoksProtocolError);
    expect(() => (obj.valBytes = null as any)).toThrow(BoksProtocolError);
    expect(() => (obj.valConfigKey = null as any)).toThrow(BoksProtocolError);
    expect(() => (obj.valHex = null as any)).toThrow(BoksProtocolError);
    expect(() => (obj.valMac = null as any)).toThrow(BoksProtocolError);
    expect(() => (obj.valMaster = null as any)).toThrow(BoksProtocolError);
    expect(() => (obj.valNfc = null as any)).toThrow(BoksProtocolError);
    expect(() => (obj.valPin = null as any)).toThrow(BoksProtocolError);
    expect(() => (obj.valSeed = null as any)).toThrow(BoksProtocolError);
    expect(() => (obj.valUint16 = null as any)).toThrow(BoksProtocolError);
    expect(() => (obj.valUint24 = null as any)).toThrow(BoksProtocolError);
    expect(() => (obj.valUint32 = null as any)).toThrow(BoksProtocolError);
    expect(() => (obj.valVarLenHex = null as any)).toThrow(BoksProtocolError);
  });
});
