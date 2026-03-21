import { describe, it, expect, vi } from 'vitest';
import fc from 'fast-check';
import { BoksEventRouter } from '../../../src/client/BoksEventRouter';
import { BoksOpcode, BoksPacket, AskDoorStatusPacket, AnswerDoorStatusPacket, NotifyDoorStatusPacket } from '../../../src/protocol';

class MockPacket extends BoksPacket {
  constructor(public opcode: BoksOpcode, private payload: Uint8Array = new Uint8Array(0)) {
    super();
  }
  toPayload() {
    return this.payload;
  }
}

describe('BoksEventRouter Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: should not throw on arbitrary filter matching', () => {
    fc.assert(
      fc.property(
        fc.oneof(fc.string(), fc.integer(), fc.constant(null), fc.constant(undefined), fc.constant({})),
        fc.oneof(fc.string(), fc.constant('TX'), fc.constant('RX'), fc.constant(undefined)),
        fc.tuple(fc.integer({ min: 0, max: 255 }), fc.uint8Array()).map(([op, pl]) => new MockPacket(op as BoksOpcode, pl)),
        (filter, direction, packet) => {
          const router = new BoksEventRouter<any>();

          expect(() => {
            (router as any).matchesClientFilter(filter, packet, direction);
          }).not.toThrow();
        }
      ),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: should gracefully handle emitting arbitrary packets to string filters', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.oneof(fc.constant('TX'), fc.constant('RX')),
        fc.tuple(fc.integer({ min: 0, max: 255 }), fc.uint8Array()).map(([op, pl]) => new MockPacket(op as BoksOpcode, pl)),
        (filter, direction, packet) => {
          const router = new BoksEventRouter<any>();
          const listener = vi.fn();

          router.on(filter, listener);

          expect(() => {
            router.emitClientEvent(packet, direction as any);
          }).not.toThrow();
        }
      ),
      { numRuns: 1000 }
    );
  });
});
