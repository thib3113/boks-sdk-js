import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { PayloadMapper, FieldDefinition, FieldType } from '@/protocol/payload-mapper';
import { BoksProtocolError, BoksProtocolErrorId } from '@/errors/BoksProtocolError';

/**
 * Generates random valid property names (safe identifiers).
 */
const safeIdentifierArbitrary = fc.stringMatching(/^[a-zA-Z_$][0-9a-zA-Z_$]*$/).filter(s => s.length > 0);

/**
 * Generates malicious property names (e.g., trying to break out of JS strings or object keys).
 */
const maliciousIdentifierArbitrary = fc.string().filter(s => !/^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(s));

/**
 * Generates valid FieldTypes.
 */
const fieldTypeArbitrary = fc.constantFrom<FieldType>(
    'uint8', 'uint16', 'uint24', 'uint32', 'ascii_string', 'mac_address', 'hex_string'
);

/**
 * Generates a single valid FieldDefinition.
 */
const validFieldDefinitionArbitrary = fc.record({
    propertyName: safeIdentifierArbitrary,
    type: fieldTypeArbitrary,
    offset: fc.integer({ min: 0, max: 100 }), // Keep offsets reasonable for valid tests
    length: fc.integer({ min: 1, max: 64 }) // Only used for string types
});

/**
 * Generates a schema array.
 */
const validSchemaArbitrary = fc.array(validFieldDefinitionArbitrary, { minLength: 1, maxLength: 20 });

describe('PayloadMapper Resilience and Fuzzing', () => {

    it('should securely reject malicious property names during JIT compilation', () => {
        fc.assert(
            fc.property(maliciousIdentifierArbitrary, (maliciousName) => {
                class MaliciousClass {}
                PayloadMapper.defineSchema(MaliciousClass, [
                    { propertyName: maliciousName, type: 'uint8', offset: 0 }
                ]);

                // The JIT compiler should throw immediately upon encountering a bad name,
                // preventing the compilation of `new Function()`.
                try {
                   PayloadMapper.parse(MaliciousClass, new Uint8Array([0x00]));
                   return false; // Should not reach here
                } catch (err) {
                   expect(err).toBeInstanceOf(BoksProtocolError);
                   expect((err as BoksProtocolError).id).toBe(BoksProtocolErrorId.INTERNAL_ERROR);
                   return true;
                }
            })
        );
    });

    it('should securely reject out-of-bounds offsets or lengths during JIT compilation', () => {
         fc.assert(
            fc.property(
                fc.integer({ min: -1000, max: -1 }), // Negative offsets
                fc.integer({ min: 1025, max: Number.MAX_SAFE_INTEGER }), // Extremely large offsets
                (negativeOffset, largeOffset) => {
                    class NegativeClass {}
                    PayloadMapper.defineSchema(NegativeClass, [
                        { propertyName: 'val', type: 'uint8', offset: negativeOffset }
                    ]);
                    class LargeClass {}
                    PayloadMapper.defineSchema(LargeClass, [
                         { propertyName: 'val', type: 'uint8', offset: largeOffset }
                    ]);

                    expect(() => PayloadMapper.parse(NegativeClass, new Uint8Array(10))).toThrowError(BoksProtocolError);
                    expect(() => PayloadMapper.parse(LargeClass, new Uint8Array(10))).toThrowError(BoksProtocolError);
                }
            )
        );
    });

    it('should NEVER crash V8 when parsing valid schemas with completely random binary payloads', () => {
        // This test ensures that the compiled JIT function is completely memory-safe.
        // It should either return a mapped object or throw a BoksProtocolError (if payload too short),
        // but it must never cause an unhandled exception or V8 crash (TypeError, RangeError, etc.).
        fc.assert(
            fc.property(validSchemaArbitrary, fc.uint8Array({ maxLength: 200 }), (schema, randomBuffer) => {
                class RandomSchemaClass {}
                PayloadMapper.defineSchema(RandomSchemaClass, schema);

                try {
                    const result = PayloadMapper.parse(RandomSchemaClass, randomBuffer);
                    expect(result).toBeDefined();
                    expect(typeof result).toBe('object');
                } catch (err) {
                    // It is perfectly acceptable for the JIT function to throw if the random buffer
                    // is shorter than the maximum offset required by the random schema.
                    expect(err).toBeInstanceOf(BoksProtocolError);
                    expect((err as BoksProtocolError).id).toBe(BoksProtocolErrorId.MALFORMED_DATA);
                }
            })
        );
    });

    it('should NEVER crash V8 when serializing random objects with valid schemas', () => {
         // This test ensures the JIT serializer is memory-safe even if the input object
         // contains unexpected data types or missing properties.
         fc.assert(
             fc.property(validSchemaArbitrary, fc.object(), (schema, randomObject) => {
                 class SerializerClass {}
                 PayloadMapper.defineSchema(SerializerClass, schema);

                 // Assign random data to instance
                 const instance = new SerializerClass();
                 Object.assign(instance, randomObject);

                 try {
                     const payload = PayloadMapper.serialize(instance);
                     expect(payload).toBeInstanceOf(Uint8Array);
                 } catch (err) {
                     expect(err).toBeInstanceOf(BoksProtocolError);
                 }
             })
         );
    });

    it('should strictly throw BoksProtocolError if payload is not a Uint8Array', () => {
         class SimpleClass {}
         PayloadMapper.defineSchema(SimpleClass, [{ propertyName: 'val', type: 'uint8', offset: 0 }]);

         expect(() => PayloadMapper.parse(SimpleClass, null as any)).toThrowError(BoksProtocolError);
         expect(() => PayloadMapper.parse(SimpleClass, undefined as any)).toThrowError(BoksProtocolError);
         expect(() => PayloadMapper.parse(SimpleClass, 'string' as any)).toThrowError(BoksProtocolError);
         expect(() => PayloadMapper.parse(SimpleClass, [1,2,3] as any)).toThrowError(BoksProtocolError); // Array != Uint8Array
    });

    it('should strictly throw BoksProtocolError if instance to serialize is null', () => {
         class SimpleClass {}
         PayloadMapper.defineSchema(SimpleClass, [{ propertyName: 'val', type: 'uint8', offset: 0 }]);

         expect(() => PayloadMapper.serialize(null as any)).toThrowError(BoksProtocolError);
    });

});
