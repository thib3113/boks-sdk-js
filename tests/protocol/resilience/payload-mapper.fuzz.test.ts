import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { PayloadMapper, FieldDefinition, FieldType } from '@/protocol/payload-mapper';
import { BoksProtocolError } from '@/errors/BoksProtocolError';

describe('PayloadMapper JIT Fuzzing', () => {
  const fieldTypes: FieldType[] = [
    'uint8', 'uint16', 'uint24', 'uint32', 'ascii_string', 'mac_address',
    'hex_string', 'pin_code', 'config_key', 'boolean', 'byte_array',
    'var_len_hex', 'bit'
  ];

  // Generator for valid and malformed JIT schema fields
  const fieldDefinitionArbitrary = fc.record({
    propertyName: fc.string({ maxLength: 50 }),
    type: fc.constantFrom(...fieldTypes),
    offset: fc.integer({ min: -10, max: 2000 }), // Including some OOB
    length: fc.option(fc.integer({ min: -10, max: 100 }), { nil: undefined }), // Optional length for some types
    bitIndex: fc.option(fc.integer({ min: -5, max: 15 }), { nil: undefined })
  }) as fc.Arbitrary<FieldDefinition>;

  const payloadArbitrary = fc.uint8Array({ maxLength: 1024 });

  it('never crashes ungracefully when parsing random schemas with random payloads', async () => {
    await fc.assert(
      fc.property(fc.array(fieldDefinitionArbitrary, { maxLength: 10 }), payloadArbitrary, (schema, payload) => {
        class FuzzPacket {}

        // Fuzz the schema definition
        try {
          PayloadMapper.defineSchema(FuzzPacket, schema);
        } catch (e) {
          // It's allowed to throw BoksProtocolError during definition (e.g., bad property name, bad bounds)
          expect(e).toBeInstanceOf(BoksProtocolError);
          return true; // Test passes for this iteration
        }

        // Fuzz the JIT parse
        try {
          PayloadMapper.parse(FuzzPacket, payload);
          // If it parses, it means bounds and names were safe enough.
        } catch (e) {
          // The ONLY error that should ever escape the PayloadMapper is a BoksProtocolError.
          // SyntaxError (bad JIT), RangeError, TypeError should cause test failure!
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
        return true;
      }),
      { numRuns: 1000 } // Aggressive JIT testing
    );
  });

  it('never crashes ungracefully when serializing random values into JIT schema', async () => {
    await fc.assert(
      fc.property(
        fc.array(fieldDefinitionArbitrary, { maxLength: 10 }),
        fc.dictionary(fc.string(), fc.anything({ maxDepth: 1 })), // Random instance properties
        (schema, instanceProps) => {
        class FuzzPacket {}

        try {
          PayloadMapper.defineSchema(FuzzPacket, schema);
        } catch (e) {
          expect(e).toBeInstanceOf(BoksProtocolError);
          return true;
        }

        const instance = new FuzzPacket();
        Object.assign(instance, instanceProps);

        try {
          PayloadMapper.serialize(instance);
        } catch (e) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
        return true;
      }),
      { numRuns: 1000 }
    );
  });
});
