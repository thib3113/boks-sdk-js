import { describe, it, expect } from 'vitest';
import { PayloadMapper } from '@/protocol/payload-mapper';
import { BoksProtocolError, BoksProtocolErrorId } from '@/errors/BoksProtocolError';

describe('PayloadMapper Security and Penetration Testing', () => {

    describe('JIT Injection Vectors (Parser)', () => {
        it('should block explicit JavaScript injection in propertyName', () => {
            class ExploitClass {}
            // Attempting to break out of the result string allocation to execute arbitrary JS
            const maliciousName = "prop']; console.log('HACKED'); //";

            PayloadMapper.defineSchema(ExploitClass, [
                { propertyName: maliciousName, type: 'uint8', offset: 0 }
            ]);

            // The JIT compiler MUST throw immediately, before even constructing the function string
            let err: any;
            try {
                 PayloadMapper.parse(ExploitClass, new Uint8Array([0x01]));
            } catch (e) { err = e; }

            expect(err).toBeDefined(); if (err) expect(err).toBeInstanceOf(BoksProtocolError);
            expect(err.id).toBe(BoksProtocolErrorId.INTERNAL_ERROR);
            expect(err.message).toContain('Unsafe property name mapped');
        });

        it('should block implicit method overrides (Prototype Pollution attempt)', () => {
            class ExploitClass {}
            // Attempt to map to __proto__
            PayloadMapper.defineSchema(ExploitClass, [
                { propertyName: '__proto__', type: 'uint8', offset: 0 }
            ]);

            let err: any;
            try {
                 PayloadMapper.parse(ExploitClass, new Uint8Array([0x01]));
            } catch (e) { err = e; }

            expect(err).toBeDefined(); if (err) expect(err).toBeInstanceOf(BoksProtocolError);
            expect(err.id).toBe(BoksProtocolErrorId.INTERNAL_ERROR);
        });

        it('should strictly throw if missing length parameter on strings (Denial of Service vector)', () => {
            class ExploitClass {}
            PayloadMapper.defineSchema(ExploitClass, [
                { propertyName: 'str', type: 'ascii_string', offset: 0 } // No length!
            ]);

            let err: any;
            try {
                 PayloadMapper.parse(ExploitClass, new Uint8Array([0x01]));
            } catch (e) { err = e; }

            expect(err).toBeDefined(); if (err) expect(err).toBeInstanceOf(BoksProtocolError);
            expect(err.message).toContain('Length required');
        });
    });

    describe('JIT Injection Vectors (Serializer)', () => {
        it('should block explicit JavaScript injection in propertyName during compilation', () => {
            class ExploitClass {}
            const maliciousName = "prop']; process.exit(1); //";

            PayloadMapper.defineSchema(ExploitClass, [
                { propertyName: maliciousName, type: 'uint8', offset: 0 }
            ]);

            let err: any;
            try {
                 PayloadMapper.serialize(new ExploitClass());
            } catch (e) { err = e; }

            expect(err).toBeDefined(); if (err) expect(err).toBeInstanceOf(BoksProtocolError);
            expect(err.id).toBe(BoksProtocolErrorId.INTERNAL_ERROR);
        });

        it('should handle undefined instances gracefully without throwing unhandled exceptions', () => {
             class EmptyClass {}
             PayloadMapper.defineSchema(EmptyClass, [{ propertyName: 'val', type: 'uint8', offset: 0 }]);
             expect(() => PayloadMapper.serialize(undefined as any)).toThrow(BoksProtocolError);
             expect(() => PayloadMapper.serialize(null as any)).toThrow(BoksProtocolError);
        });
    });

    describe('Memory Access Violations (Buffer Overflows)', () => {
        it('should strictly block outrageously large offset values (Integer Overflow vectors)', () => {
            class ExploitClass {}
            PayloadMapper.defineSchema(ExploitClass, [
                { propertyName: 'val', type: 'uint8', offset: 99999999999999999 } // Beyond max safe size
            ]);

            expect(() => PayloadMapper.parse(ExploitClass, new Uint8Array(10))).toThrow(BoksProtocolError);
            expect(() => PayloadMapper.serialize(new ExploitClass())).toThrow(BoksProtocolError);
        });

        it('should strictly block negative offsets (Buffer Underflow vectors)', () => {
             class ExploitClass {}
             PayloadMapper.defineSchema(ExploitClass, [
                 { propertyName: 'val', type: 'uint8', offset: -5 }
             ]);
             expect(() => PayloadMapper.parse(ExploitClass, new Uint8Array(10))).toThrow(BoksProtocolError);
        });

        it('should strictly enforce minSize payload constraints to prevent JS RangeError', () => {
             class ValidClass {}
             PayloadMapper.defineSchema(ValidClass, [
                 { propertyName: 'val', type: 'uint32', offset: 10 } // requires at least 14 bytes
             ]);

             // Providing 13 bytes must result in BoksProtocolError, not a RangeError or crash
             const payload = new Uint8Array(13);
             let err: any;
             try {
                  PayloadMapper.parse(ValidClass, payload);
             } catch (e) { err = e; }

             expect(err).toBeDefined(); if (err) expect(err).toBeInstanceOf(BoksProtocolError);
             expect(err.id).toBe(BoksProtocolErrorId.MALFORMED_DATA);
             expect(err.message).toContain('Payload too short');
        });
    });
});
