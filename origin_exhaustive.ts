import { describe, it, expect } from 'vitest';
import {
  PayloadMapper,
  PayloadUint8,
  PayloadUint16,
  PayloadUint24,
  PayloadUint32,
  PayloadBoolean,
  PayloadBit,
  PayloadHexString,
  PayloadByteArray,
  PayloadAsciiString,
  PayloadConfigKey,
  PayloadPinCode,
  PayloadMacAddress,
  PayloadVarLenHex,
  PayloadNfcUid,
  PayloadMasterCodeIndex
} from '@/protocol/decorators';
import { BoksProtocolError } from '@/errors/BoksProtocolError';

class ExhaustiveTestPacket {
  @PayloadUint8(0) public accessor u8!: number;
  @PayloadUint16(1) public accessor u16!: number;
  @PayloadUint24(3) public accessor u24!: number;
  @PayloadUint32(6) public accessor u32!: number;
  @PayloadBoolean(10) public accessor bool!: boolean;
  @PayloadBit(11, 0) public accessor bit0!: boolean;
  @PayloadBit(11, 7) public accessor bit7!: boolean;
  @PayloadHexString(12, 2) public accessor hex2!: string;
  @PayloadByteArray(14, 2) public accessor bytes2!: Uint8Array;
  @PayloadAsciiString(16, 4) public accessor ascii4!: string;
  @PayloadConfigKey(20) public accessor configKey!: string;
  @PayloadPinCode(28) public accessor pin!: string;
  @PayloadMacAddress(34) public accessor mac!: string;
  @PayloadVarLenHex(40) public accessor varLenHex!: string;
}

class DecoratorSetterPacket {
    @PayloadHexString(0, 2) public accessor hex!: string;
    @PayloadNfcUid(2) public accessor uid!: string;
    @PayloadConfigKey(10) public accessor ck!: string;
    @PayloadMasterCodeIndex(18) public accessor index!: number;
    @PayloadBoolean(19) public accessor bool!: boolean;
}

class EmptyPacket {}

describe('PayloadMapper Exhaustive Coverage', () => {
  it('should parse all types correctly', () => {
    const payload = new Uint8Array(50);
    payload[0] = 0xFE; // uint8
    payload[1] = 0x12; payload[2] = 0x34; // uint16 = 0x1234
    payload[3] = 0x12; payload[4] = 0x34; payload[5] = 0x56; // uint24 = 0x123456
    payload[6] = 0x12; payload[7] = 0x34; payload[8] = 0x56; payload[9] = 0x78; // uint32 = 0x12345678
    payload[10] = 0x01; // boolean true
    payload[11] = 0x81; // bit0=true, bit7=true (10000001)
    payload[12] = 0xAA; payload[13] = 0xBB; // hex2 = AABB
    payload[14] = 0x01; payload[15] = 0x02; // bytes2

    // ascii4 "BOKS"
    payload[16] = 66; payload[17] = 79; payload[18] = 75; payload[19] = 83;

    // configKey "12345678"
    const ck = "12345678";
    for(let i=0; i<8; i++) payload[20+i] = ck.charCodeAt(i);

    // pin "123456"
    const pin = "123456";
    for(let i=0; i<6; i++) payload[28+i] = pin.charCodeAt(i);

    // mac "001122334455" -> expected 55:44:33:22:11:00 due to reverse order in JIT
    const mac = [0x00, 0x11, 0x22, 0x33, 0x44, 0x55];
    for(let i=0; i<6; i++) payload[34+i] = mac[i];

    // varLenHex: len 2, data AABB
    payload[40] = 2;
    payload[41] = 0xAA; payload[42] = 0xBB;

    const result = PayloadMapper.parse(ExhaustiveTestPacket, payload.slice(0, 43));

    expect(result.u8).toBe(0xFE);
    expect(result.u16).toBe(0x1234);
    expect(result.u24).toBe(0x123456);
    expect(result.u32).toBe(0x12345678);
    expect(result.bool).toBe(true);
    expect(result.bit0).toBe(true);
    expect(result.bit7).toBe(true);
    expect(result.hex2).toBe('AABB');
    expect(result.bytes2).toEqual(new Uint8Array([0x01, 0x02]));
    expect(result.ascii4).toBe('BOKS');
    expect(result.configKey).toBe('12345678');
    expect(result.pin).toBe('123456');
    expect(result.mac).toBe('554433221100');
    expect(result.varLenHex).toBe('AABB');
  });

  it('should hit all decorator setters and their validation', () => {
      const inst = new DecoratorSetterPacket();
      inst.hex = 'AABB';
      inst.uid = '00:11:22:33:44:55:66';
      inst.ck = '12345678';
      inst.index = 5;
      inst.bool = true;

      expect(inst.hex).toBe('AABB');
      expect(inst.index).toBe(5);

      // @ts-expect-error - Testing invalid input
      expect(() => { inst.hex = null }).toThrow(BoksProtocolError);
      // @ts-expect-error - Testing invalid input
      expect(() => { inst.uid = null }).toThrow(BoksProtocolError);
      // @ts-expect-error - Testing invalid input
      expect(() => { inst.ck = null }).toThrow(BoksProtocolError);
      // @ts-expect-error - Testing invalid input
      expect(() => { inst.index = null }).toThrow(BoksProtocolError);
      // @ts-expect-error - Testing invalid input
      expect(() => { inst.bool = null }).toThrow(BoksProtocolError);
  });

  it('should throw on invalid bitIndex', () => {
      expect(() => {
          class InvalidBit {
              @PayloadBit(0, 8) public accessor bit!: boolean;
          }
          return new InvalidBit();
      }).toThrow();
  });

  it('should validate empty class correctly', () => {
      const inst = new EmptyPacket();
      PayloadMapper.validate(inst); // hit line 478
  });

  it('should serialize all types correctly', () => {
    const inst = new ExhaustiveTestPacket();
    inst.u8 = 0xFE; inst.u16 = 0x1234; inst.u24 = 0x123456; inst.u32 = 0x12345678;
    inst.bool = true; inst.bit0 = true; inst.bit7 = true;
    inst.hex2 = 'AABB';
    inst.bytes2 = new Uint8Array([0x01, 0x02]);
    inst.ascii4 = 'BOKS';
    inst.configKey = '12345678';
    inst.pin = '123456';
    inst.mac = '00:11:22:33:44:55';
    inst.varLenHex = 'AABB';

    const payload = PayloadMapper.serialize(inst);

    expect(payload[0]).toBe(0xFE);
    expect(payload[1]).toBe(0x12); expect(payload[2]).toBe(0x34);
    expect(payload[10]).toBe(0x01);
    expect(payload[11]).toBe(0x81);
    expect(payload[12]).toBe(0xAA); expect(payload[13]).toBe(0xBB);
    expect(payload[16]).toBe(66);
    expect(payload[20]).toBe(49); // '1'
    expect(payload[28]).toBe(49); // '1'
    expect(payload[40]).toBe(2);
    expect(payload[41]).toBe(0xAA);
  });
});
