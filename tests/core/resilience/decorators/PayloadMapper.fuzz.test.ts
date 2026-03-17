import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { PayloadMapper } from '../../../../src/protocol/decorators/PayloadMapper';
import { PayloadUint8, PayloadUint16, PayloadUint24, PayloadUint32, PayloadAsciiString, PayloadMacAddress, PayloadHexString, PayloadPinCode, PayloadConfigKey, PayloadBoolean, PayloadByteArray, PayloadBit } from '../../../../src/protocol/decorators/index';
import { BoksProtocolError } from '../../../../src/errors/BoksProtocolError';

class FuzzTestPacket {
  @PayloadUint8(0) public accessor uint8Val!: number;
  @PayloadUint16(1) public accessor uint16Val!: number;
  @PayloadUint24(3) public accessor uint24Val!: number;
  @PayloadUint32(6) public accessor uint32Val!: number;
  @PayloadAsciiString(10, 5) public accessor asciiVal!: string;
  @PayloadMacAddress(15) public accessor macVal!: string;
  @PayloadHexString(21, 4) public accessor hexVal!: string;
  @PayloadPinCode(25) public accessor pinVal!: string;
  @PayloadConfigKey(31) public accessor configVal!: string;
  @PayloadBoolean(39) public accessor boolVal!: boolean;
  @PayloadByteArray(40, 4) public accessor byteArrVal!: Uint8Array;
  @PayloadBit(44, 0) public accessor bitVal0!: boolean;
  @PayloadBit(44, 7) public accessor bitVal7!: boolean;

  constructor(data: Partial<FuzzTestPacket>) {
    Object.assign(this, data);
  }
}

describe('PayloadMapper Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: should safely parse completely arbitrary payloads without crashing for complex packet', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        try {
          // Parse should either succeed or throw a typed BoksProtocolError
          const parsed = PayloadMapper.parse(FuzzTestPacket, payload);
          expect(parsed).toBeDefined();
        } catch (e: any) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: should safely handle malformed PIN characters (crash prevention)', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 31, maxLength: 31 }), (payload) => {
        // Attempting to parse a random byte sequence as a PIN will often trigger the inline PIN validation error
        try {
          PayloadMapper.parse(FuzzTestPacket, payload);
        } catch (e: any) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 500 }
    );
  });

  it('FEATURE REGRESSION: should safely serialize valid data', () => {
    // Generate valid random instance values
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 65535 }),
        fc.integer({ min: 0, max: 16777215 }),
        fc.integer({ min: 0, max: 4294967295 }),
        fc.string({ minLength: 5, maxLength: 5 }), // ASCII string
        fc.array(fc.integer({ min: 0, max: 255 }), { minLength: 6, maxLength: 6 }).map(a => a.map(n => n.toString(16).padStart(2, '0')).join(':').toUpperCase()), // MAC
        fc.string({ minLength: 8, maxLength: 8 }).map(s => Buffer.from(s).toString('hex').toUpperCase().substring(0, 8)), // Hex
        fc.constantFrom('012345', '123456', 'AB1234', '111111'), // Valid PIN (only 0-9, A, B)
        fc.string({ minLength: 8, maxLength: 8 }).map(s => Buffer.from(s).toString('hex').toUpperCase().substring(0, 8)), // Valid Config Key
        fc.boolean(),
        fc.uint8Array({ minLength: 4, maxLength: 4 }),
        fc.boolean(),
        fc.boolean(),
        (u8, u16, u24, u32, ascii, mac, hex, pin, cfg, bool, byteArr, bit0, bit7) => {
          const packet = new FuzzTestPacket({
            uint8Val: u8,
            uint16Val: u16,
            uint24Val: u24,
            uint32Val: u32,
            asciiVal: ascii,
            macVal: mac,
            hexVal: hex,
            pinVal: pin,
            configVal: cfg,
            boolVal: bool,
            byteArrVal: byteArr,
            bitVal0: bit0,
            bitVal7: bit7,
          });

          // Serialization should succeed and return a Uint8Array
          const serialized = PayloadMapper.serialize(packet);
          expect(serialized).toBeInstanceOf(Uint8Array);
          // 44 (last offset) + 1 byte for bits = 45 bytes expected
          expect(serialized.length).toBe(45);
        }
      ),
      { numRuns: 1000 }
    );
  });
});
