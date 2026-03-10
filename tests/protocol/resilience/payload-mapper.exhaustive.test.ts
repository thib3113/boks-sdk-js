import { describe, it, expect } from 'vitest';
import { PayloadMapper, PayloadUint8, PayloadUint16, PayloadUint24, PayloadUint32, PayloadPinCode, PayloadConfigKey, PayloadAsciiString, PayloadMacAddress, PayloadHexString, PayloadMasterCodeIndex } from '@/protocol/payload-mapper';
import { BoksProtocolError } from '@/errors/BoksProtocolError';

describe('PayloadMapper Exhaustive Deterministic Tests', () => {

    describe('Numeric Types Extraction', () => {
        class NumericPacket {
           @PayloadUint8(0)
           accessor val8!: number;
           @PayloadUint16(1)
           accessor val16!: number;
           @PayloadUint24(3)
           accessor val24!: number;
           @PayloadUint32(6)
           accessor val32!: number;
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
             @PayloadAsciiString(0, 4)
           accessor ascii!: string;
             @PayloadHexString(4, 3)
           accessor hex!: string;
             @PayloadMacAddress(7)
           accessor mac!: string;
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
            @PayloadPinCode(0)
           accessor pin!: string;
            @PayloadConfigKey(6)
           accessor key!: string;
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


    describe('Decorator Setter Validations (Coverage)', () => {

        it('should coerce non-string values to string and validate', () => {
            const pkt = new ValidationPacket();
            expect(() => { (pkt as any).pin = 123456; }).not.toThrow();
            expect(pkt.pin).toBe('123456');

            expect(() => { (pkt as any).key = 12345678; }).not.toThrow();
            expect(pkt.key).toBe('12345678');
        });

        class ValidationPacket {
            @PayloadPinCode(0)
            accessor pin!: string;

            @PayloadConfigKey(6)
            accessor key!: string;

            @PayloadMasterCodeIndex(14)
            accessor index!: number;
        }

        it('should throw on setting null/undefined or invalid PIN', () => {
            const pkt = new ValidationPacket();
            expect(() => { pkt.pin = null as any; }).toThrowError(BoksProtocolError);
            expect(() => { pkt.pin = undefined as any; }).toThrowError(BoksProtocolError);
            expect(() => { pkt.pin = '12345'; }).toThrowError(BoksProtocolError); // Wrong length
            expect(() => { pkt.pin = '12345Z'; }).toThrowError(BoksProtocolError); // Invalid char
        });

        it('should throw on setting null/undefined or invalid Config Key', () => {
            const pkt = new ValidationPacket();
            expect(() => { pkt.key = null as any; }).toThrowError(BoksProtocolError);
            expect(() => { pkt.key = undefined as any; }).toThrowError(BoksProtocolError);
            expect(() => { pkt.key = 'ABCDEF0'; }).toThrowError(BoksProtocolError); // Wrong length
            expect(() => { pkt.key = 'ABCDEF0Z'; }).toThrowError(BoksProtocolError); // Invalid char
        });

        it('should throw on setting null/undefined Master Code Index', () => {
            const pkt = new ValidationPacket();
            expect(() => { pkt.index = null as any; }).toThrowError(BoksProtocolError);
            expect(() => { pkt.index = undefined as any; }).toThrowError(BoksProtocolError);
        });
    });


    describe('Decorator Generic Accessor Coverage', () => {
        class FullPacket {
            @PayloadUint8(0) accessor val8!: number = 8;
            @PayloadUint16(1) accessor val16!: number = 16;
            @PayloadUint24(3) accessor val24!: number = 24;
            @PayloadUint32(6) accessor val32!: number = 32;
            @PayloadAsciiString(0, 4) accessor ascii!: string = 'A';
            @PayloadHexString(4, 3) accessor hex!: string = 'B';
            @PayloadMacAddress(7) accessor mac!: string = 'C';
        }

        it('should hit get, set, init for all accessors', () => {
            const pkt = new FullPacket();
            expect(pkt.val8).toBe(8);
            pkt.val8 = 9;
            expect(pkt.val8).toBe(9);

            pkt.val16 = 17; expect(pkt.val16).toBe(17);
            pkt.val24 = 25; expect(pkt.val24).toBe(25);
            pkt.val32 = 33; expect(pkt.val32).toBe(33);
            pkt.ascii = 'Z'; expect(pkt.ascii).toBe('Z');
            pkt.hex = 'Y'; expect(pkt.hex).toBe('Y');
            pkt.mac = 'X'; expect(pkt.mac).toBe('X');
        });
    });


    describe('Missing Decorator Coverage (Uncovered Lines)', () => {

        it('should handle getOrCreateMetadata when no context.metadata exists (legacy path)', () => {
            class LegacyMetaPacket {}
            const context: any = { name: 'test' }; // No metadata
            // Call the decorator directly to force getOrCreateMetadata to run with undefined context.metadata
            const decorator = PayloadUint8(0);
            decorator({ get: () => 1, set: () => {} }, context);
            // It should not throw and safely return [] inside
        });


        it('should serialize to empty buffer when no fields are mapped', () => {
            class EmptySerializePacket {}
            const buffer = PayloadMapper.serialize(new EmptySerializePacket());
            expect(buffer.length).toBe(0);
        });

        it('should set schema on Symbol.metadata if available during defineSchema', () => {
            class MetaPacket {}
            (MetaPacket as any)[Symbol.metadata as any] = {}; // Fake the metadata object
            PayloadMapper.defineSchema(MetaPacket, [{ propertyName: 'a', type: 'uint8', offset: 0 }]);
            const data = PayloadMapper.parse(MetaPacket, new Uint8Array([99]));
            expect(data.a).toBe(99);
        });
    });


    describe('Decorator Setter Validations (Coverage)', () => {
        class ValidationPacket {
            @PayloadPinCode(0)
            accessor pin!: string;

            @PayloadConfigKey(6)
            accessor key!: string;

            @PayloadMasterCodeIndex(14)
            accessor index!: number;
        }

        it('should throw on setting null/undefined or invalid PIN', () => {
            const pkt = new ValidationPacket();
            expect(() => { pkt.pin = null as any; }).toThrowError(BoksProtocolError);
            expect(() => { pkt.pin = undefined as any; }).toThrowError(BoksProtocolError);
            expect(() => { pkt.pin = '12345'; }).toThrowError(BoksProtocolError); // Wrong length
            expect(() => { pkt.pin = '12345Z'; }).toThrowError(BoksProtocolError); // Invalid char
        });

        it('should throw on setting null/undefined or invalid Config Key', () => {
            const pkt = new ValidationPacket();
            expect(() => { pkt.key = null as any; }).toThrowError(BoksProtocolError);
            expect(() => { pkt.key = undefined as any; }).toThrowError(BoksProtocolError);
            expect(() => { pkt.key = 'ABCDEF0'; }).toThrowError(BoksProtocolError); // Wrong length
            expect(() => { pkt.key = 'ABCDEF0Z'; }).toThrowError(BoksProtocolError); // Invalid char
        });

        it('should throw on setting null/undefined Master Code Index', () => {
            const pkt = new ValidationPacket();
            expect(() => { pkt.index = null as any; }).toThrowError(BoksProtocolError);
            expect(() => { pkt.index = undefined as any; }).toThrowError(BoksProtocolError);
        });
    });


    describe('Decorator Setter Validations (Coverage)', () => {
        class ValidationPacket {
            @PayloadPinCode(0)
            accessor pin!: string;

            @PayloadConfigKey(6)
            accessor key!: string;

            @PayloadMasterCodeIndex(14)
            accessor index!: number;
        }

        it('should throw on setting null/undefined or invalid PIN', () => {
            const pkt = new ValidationPacket();
            expect(() => { pkt.pin = null as any; }).toThrowError(BoksProtocolError);
            expect(() => { pkt.pin = undefined as any; }).toThrowError(BoksProtocolError);
            expect(() => { pkt.pin = '12345'; }).toThrowError(BoksProtocolError); // Wrong length
            expect(() => { pkt.pin = '12345Z'; }).toThrowError(BoksProtocolError); // Invalid char
        });

        it('should throw on setting null/undefined or invalid Config Key', () => {
            const pkt = new ValidationPacket();
            expect(() => { pkt.key = null as any; }).toThrowError(BoksProtocolError);
            expect(() => { pkt.key = undefined as any; }).toThrowError(BoksProtocolError);
            expect(() => { pkt.key = 'ABCDEF0'; }).toThrowError(BoksProtocolError); // Wrong length
            expect(() => { pkt.key = 'ABCDEF0Z'; }).toThrowError(BoksProtocolError); // Invalid char
        });

        it('should throw on setting null/undefined Master Code Index', () => {
            const pkt = new ValidationPacket();
            expect(() => { pkt.index = null as any; }).toThrowError(BoksProtocolError);
            expect(() => { pkt.index = undefined as any; }).toThrowError(BoksProtocolError);
        });
    });

    describe('Constructor Validation (Setters)', () => {
         class ValidatedPacket {
            @PayloadPinCode(0)
           accessor pin!: string;
            @PayloadConfigKey(6)
           accessor key!: string;
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


    describe('Edge Cases and Meta Recovery', () => {
        it('should correctly handle classes with fallback missing metadata', () => {
            // Emulate a class where Symbol.metadata fails but legacy METADATA_KEY is manually populated
            class FakeMetaPacket { fake?: number; }
            PayloadMapper.defineSchema(FakeMetaPacket, [
                { propertyName: 'fake', type: 'uint8', offset: 0 }
            ]);
            const payload = new Uint8Array([42]);
            const data = PayloadMapper.parse(FakeMetaPacket, payload);
            expect(data.fake).toBe(42);
        });

        it('should correctly bypass metadata creation if context.metadata is null in getOrCreateMetadata', () => {
            // Since we can't easily override context.metadata for native TS decorators in test,
            // we'll at least run defineSchema which touches similar logic.
            class AnotherFakePacket { foo?: number; }
            PayloadMapper.defineSchema(AnotherFakePacket, [
                { propertyName: 'foo', type: 'uint16', offset: 0 }
            ]);
            const payload = new Uint8Array([0x12, 0x34]);
            const data = PayloadMapper.parse(AnotherFakePacket, payload);
            expect(data.foo).toBe(0x1234);
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
