import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { BoksHardwareSimulator } from '../../../src/simulator/BoksSimulator';
import { SimulatorTransport } from '../../../src/simulator/SimulatorTransport';
import { BoksClientError } from '../../../src/errors/BoksClientError';

describe('SimulatorTransport Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: should safely handle arbitrary GATT read requests on SimulatorTransport without crashing', async () => {
    await fc.assert(
      fc.asyncProperty(fc.string({ maxLength: 100 }), async (uuid) => {
        const simulator = new BoksHardwareSimulator();
        const transport = new SimulatorTransport(simulator);

        try {
          const result = await transport.read(uuid);
          expect(result).toBeInstanceOf(Uint8Array);
        } catch (e: any) {
          // BoksClientError is completely acceptable. Native JS crashes are not.
          if (!(e instanceof BoksClientError) && e.name !== 'BoksClientError' && e.name !== 'BoksProtocolError') {
             throw e;
          }
        } finally {
          simulator.destroy();
        }
      }),
      { numRuns: 100 }
    );
  }, 10000);

  it('FEATURE REGRESSION: should safely handle arbitrary event subscriptions', async () => {
    await fc.assert(
      fc.asyncProperty(fc.string({ maxLength: 100 }), async (uuid) => {
        const simulator = new BoksHardwareSimulator();
        const transport = new SimulatorTransport(simulator);

        try {
          const callback = (data: Uint8Array) => {};
          // Regular subscribe
          await transport.subscribe(callback);
          // GATT subscribe
          await transport.subscribeTo(uuid, callback);

          await transport.disconnect();
          expect(true).toBe(true);
        } catch (e: any) {
          if (!(e instanceof BoksClientError) && e.name !== 'BoksClientError' && e.name !== 'BoksProtocolError') {
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
