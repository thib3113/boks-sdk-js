import { describe, it, expect } from 'vitest';
import { PayloadMapper, PayloadUint8 } from '@/protocol/payload-mapper';
import { BoksProtocolError, BoksProtocolErrorId } from '@/errors/BoksProtocolError';

describe('PayloadMapper Security & Resilience', () => {
  it('prevents JIT injection via property names', () => {
    class MaliciousInjection {
      @PayloadUint8(0)
      public accessor '"); throw new Error("hacked"); //': number = 0;
    }

    // Attempting to parse should throw our structured error, not a SyntaxError or Error("hacked")
    expect(() => PayloadMapper.parse(MaliciousInjection, new Uint8Array([1]))).toThrowError(
      new BoksProtocolError(
        BoksProtocolErrorId.INTERNAL_ERROR,
        `Unsafe property name mapped: "); throw new Error("hacked"); //`
      )
    );
  });

  it('prevents JIT injection via prototype pollution names', () => {
    class PrototypePollution {
      @PayloadUint8(0)
      public accessor __proto__: number = 0;
    }

    expect(() => PayloadMapper.parse(PrototypePollution, new Uint8Array([1]))).toThrowError(
      new BoksProtocolError(
        BoksProtocolErrorId.INTERNAL_ERROR,
        `Unsafe property name mapped: __proto__`
      )
    );
  });

  it('prevents JIT compilation with out-of-bounds offsets', () => {
    expect(() => {
      class OOBOffset {
        @PayloadUint8(1050)
        public accessor val: number = 0;
      }
      PayloadMapper.parse(OOBOffset, new Uint8Array(2000));
    }).toThrowError(
      new BoksProtocolError(
        BoksProtocolErrorId.INTERNAL_ERROR,
        'Invalid mapping bounds: offset=1050, size=1'
      )
    );
  });

  it('prevents JIT compilation with NaN or non-number bounds', () => {
    expect(() => {
      class NaNOffset {
        @PayloadUint8(NaN)
        public accessor val: number = 0;
      }
      PayloadMapper.parse(NaNOffset, new Uint8Array([1]));
    }).toThrowError(
      new BoksProtocolError(
        BoksProtocolErrorId.INTERNAL_ERROR,
        'Invalid mapping bounds: offset=NaN, size=1'
      )
    );
  });

  it('prevents OOB read during parse', () => {
    class ValidPacket {
      @PayloadUint8(0)
      public accessor val1: number = 0;
      @PayloadUint8(4)
      public accessor val2: number = 0;
    }

    // Minimum size required is 5 bytes (index 4 + 1 size)
    // Passing only 3 bytes should throw
    expect(() => PayloadMapper.parse(ValidPacket, new Uint8Array([1, 2, 3]))).toThrowError(
      new BoksProtocolError(BoksProtocolErrorId.MALFORMED_DATA, 'Payload too short for mapped fields', { expectedAtLeast: 5, received: 3 })
    );
  });

  it('handles type confusion safely during serialization', () => {
    class Dummy {
      @PayloadUint8(0)
      public accessor num: number = 0;
    }

    const maliciousInstance = new Dummy();
    // Simulate prototype override or dynamic property changing the type
    (maliciousInstance as any).num = { fake: 'object' };

    // Should not crash the serializer, number values cast to 0 if NaN etc, or throw if required.
    // For uint8, it does \`payload[0] = (instance['prop'] || 0)\`
    const serialized = PayloadMapper.serialize(maliciousInstance);
    // JS object evaluates to true but binary ops or bitwise cast will probably result in 0
    expect(serialized).toBeInstanceOf(Uint8Array);
  });

  it('prevents DoS via memory allocation for variable hex fields', () => {
    class DoSPacket {
      // Using defineSchema to simulate a var_len_hex
    }
    PayloadMapper.defineSchema(DoSPacket, [
      { propertyName: 'malicious', type: 'var_len_hex', offset: 0 }
    ]);

    const instance = new DoSPacket();
    // Pass an array instead of a string to trick the length calculator
    (instance as any).malicious = new Array(1e7).fill(1);

    // The patch in compileSerializer ensures \`typeof === 'string'\` before checking length.
    // It should treat this invalid type gracefully and allocate 0 bytes for dynamic length.
    const serialized = PayloadMapper.serialize(instance);

    // 1 byte allocated minimum for var_len_hex length field
    expect(serialized.length).toBe(1);
    expect(serialized[0]).toBe(0); // length is 0
  });
});
