import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { BoksHardwareSimulator } from '../../../src/simulator/BoksSimulator';

describe('BoksHardwareSimulator Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: handlePacket should safely discard or error out on arbitrary byte buffers without crashing the simulator process', async () => {
    // Generate an arbitrary valid-looking Boks packet structure but with completely random contents
    const packetArbitrary = fc.uint8Array({ minLength: 0, maxLength: 256 }).map((payload) => {
      // Craft a full packet: STX, Length, Opcode, Payload, CRC
      const fullBuffer = new Uint8Array(2 + 1 + payload.length + 1);
      const opcode = Math.floor(Math.random() * 256);
      fullBuffer[0] = opcode;
      fullBuffer[1] = payload.length;
      fullBuffer.set(payload, 2);

      let checksum = 0;
      for (let i = 0; i < fullBuffer.length - 1; i++) {
        checksum += fullBuffer[i];
      }
      fullBuffer[fullBuffer.length - 1] = checksum & 0xFF;
      return fullBuffer;
    });

    await fc.assert(
      fc.asyncProperty(packetArbitrary, async (packet) => {
        const simulator = new BoksHardwareSimulator();

        try {
          await simulator.handlePacket(packet);
          // If it didn't throw an unhandled exception, it passed.
          expect(true).toBe(true);
        } catch (e: any) {
          // BoksProtocolError is completely acceptable, as are errors thrown intentionally by the simulator.
          const isExpectedError =
            e.name === 'BoksProtocolError' ||
            e.message.includes('Simulated error') ||
            e.message.includes('Invalid') ||
            e.message.includes('Not implemented');

          if (!isExpectedError) {
             throw e; // Rethrow native crashes
          }
        } finally {
          simulator.destroy();
        }
      }),
      { numRuns: 100 }
    );
  }, 10000);

  it('FEATURE REGRESSION: should handle malformed or truncated packets silently without crashing', async () => {
     await fc.assert(
      fc.asyncProperty(fc.uint8Array({ minLength: 0, maxLength: 5 }), async (packet) => {
        const simulator = new BoksHardwareSimulator();

        try {
          await simulator.handlePacket(packet);
          expect(true).toBe(true);
        } catch (e: any) {
          // Truncated packets should ideally just be dropped (return early).
          // If they throw, it must be a typed error.
          if (e.name !== 'BoksProtocolError') {
             throw e;
          }
        } finally {
          simulator.destroy();
        }
      }),
      { numRuns: 100 }
    );
  }, 10000);
});
