import { describe, it, expect } from 'vitest';
import { PayloadMapper, PayloadUint8, PayloadUint16, PayloadUint24, PayloadUint32, PayloadPinCode, PayloadConfigKey, PayloadAsciiString, PayloadMacAddress, PayloadHexString } from '@/protocol/payload-mapper';
import { BoksProtocolError } from '@/errors/BoksProtocolError';

describe('PayloadMapper Exhaustive Deterministic Tests', () => {

    describe('Numeric Types Extraction', () => {
        class NumericPacket {
           @PayloadUint8(0) accessor val8!: number;
           @PayloadUint16(1) accessor val16!: number;
           @PayloadUint24(3) accessor val24!: number;
           @PayloadUint32(6) accessor val32!: number;
        }

        it('should correctly parse boundaries and endianness', () => {
            const payload = new Uint8Array([
                0xFF, // 8: 255
                0xFF, 0xFF, // 16: 65535
                0xFF, 0xFF, 0xFF, // 24: 16777215
                0xFF, 0xFF, 0xFF, 0xFF // 32: 4294967295
            ]);
            const data = PayloadMapper.parse(NumericPacket, payload);
            expect(data.val8).toBe(255);
            expect(data.val16).toBe(65535);
            expect(data.val24).toBe(16777215);
            expect(data.val32).toBe(4294967295); // Ensure no signed 32-bit overflow (-1)
        });

        it('should correctly parse 0 values', () => {
            const payload = new Uint8Array(10); // All zeros
            const data = PayloadMapper.parse(NumericPacket, payload);
            expect(data.val8).toBe(0);
            expect(data.val16).toBe(0);
            expect(data.val24).toBe(0);
            expect(data.val32).toBe(0);
        });
    });

    describe('String Types Extraction', () => {
         class StringPacket {
             @PayloadAsciiString(0, 4) accessor ascii!: string;
             @PayloadHexString(4, 3) accessor hex!: string;
             @PayloadMacAddress(7) accessor mac!: string;
         }

         it('should correctly parse standard values and strip null bytes', () => {
             const payload = new Uint8Array([
                 65, 66, 0, 67, // 'AB\0C' -> 'ABC' (null stripped)
                 10, 255, 0, // Hex: 0A FF 00 -> 0AFF00
                 0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF // Mac: Reverse LE -> FF:EE:DD:CC:BB:AA
             ]);
             const data = PayloadMapper.parse(StringPacket, payload);
             expect(data.ascii).toBe('ABC');
             expect(data.hex).toBe('0AFF00');
             expect(data.mac).toBe('FF:EE:DD:CC:BB:AA');
         });
    });

    describe('Semantic Type Validation (PIN & Config Key)', () => {
         class SemanticPacket {
            @PayloadPinCode(0) accessor pin!: string;
            @PayloadConfigKey(6) accessor key!: string;
         }

         it('should parse valid semantic strings', () => {
              const payload = new Uint8Array([
                  49, 50, 51, 52, 65, 66, // '1234AB'
                  48, 49, 50, 51, 52, 53, 65, 70 // '012345AF'
              ]);
              const data = PayloadMapper.parse(SemanticPacket, payload);
              expect(data.pin).toBe('1234AB');
              expect(data.key).toBe('012345AF');
         });

         it('should strictly throw BoksProtocolError on inline invalid PIN character', () => {
              const payload = new Uint8Array([
                  49, 50, 51, 52, 67, 66, // '1234CB' - 'C' is invalid for PIN
                  48, 49, 50, 51, 52, 53, 65, 70
              ]);
              expect(() => PayloadMapper.parse(SemanticPacket, payload)).toThrow(BoksProtocolError);
         });

         it('should strictly throw BoksProtocolError on inline invalid Config Key character', () => {
              const payload = new Uint8Array([
                  49, 50, 51, 52, 65, 66,
                  48, 49, 50, 51, 52, 53, 71, 70 // '012345GF' - 'G' is invalid for Hex
              ]);
              expect(() => PayloadMapper.parse(SemanticPacket, payload)).toThrow(BoksProtocolError);
         });
    });

    describe('Constructor Validation (Setters)', () => {
         class ValidatedPacket {
            @PayloadPinCode(0) accessor pin!: string;
            @PayloadConfigKey(6) accessor key!: string;
            constructor(public props: { pin: any, key: any }) {
                this.pin = props.pin;
                this.key = props.key;
                PayloadMapper.validate(this);
            }
         }

         it('should pass with valid constructor properties', () => {
             expect(() => new ValidatedPacket({ pin: '123456', key: 'AABBCCDD' })).not.toThrow();
         });

         it('should throw on invalid PIN length or type in constructor', () => {
             expect(() => new ValidatedPacket({ pin: '12345', key: 'AABBCCDD' })).toThrowError(BoksProtocolError);
             // Number coercion works now: expect(() => new ValidatedPacket({ pin: 123456, key: 'AABBCCDD' })).not.toThrow();
         });

         it('should throw on invalid Config Key length or type in constructor', () => {
             expect(() => new ValidatedPacket({ pin: '123456', key: 'AABBCCD' })).toThrowError(BoksProtocolError);
             expect(() => new ValidatedPacket({ pin: '123456', key: null })).toThrowError(BoksProtocolError);
         });

         it('should bypass validation cleanly if no decorators are present', () => {
             class EmptyPacket { constructor() { PayloadMapper.validate(this); } }
             expect(() => new EmptyPacket()).not.toThrow();
         });
    });

    describe('Malformed Schema and Size Fault Tolerance', () => {

        it('should safely handle schema with no decorators', () => {
             class NoDecoPacket {}
             const payload = new Uint8Array([0x01]);
             const data = PayloadMapper.parse(NoDecoPacket, payload);
             expect(Object.keys(data).length).toBe(0);
        });
    });
});
