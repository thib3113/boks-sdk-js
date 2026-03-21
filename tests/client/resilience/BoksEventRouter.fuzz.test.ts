import { describe, it, expect, vi } from 'vitest';
import fc from 'fast-check';
import { BoksEventRouter } from '../../../src/client/BoksEventRouter';
import { BoksOpcode, BoksPacket } from '../../../src/protocol';

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

  it('FEATURE REGRESSION: should handle unregistration safely even with mismatched objects', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.string(),
        (eventName1, eventName2) => {
          const router = new BoksEventRouter<any>();
          const listener = vi.fn();

          router.on(eventName1, listener);

          // attempt to remove a different listener
          expect(() => {
            router.off(eventName2, vi.fn());
          }).not.toThrow();

          // listener should still be registered for eventName1
          router.emit(eventName1, {});
          expect(listener).toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('FEATURE REGRESSION: should gracefully handle emitting generic events with arbitrary payloads, arrays of filters, and error handlers', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.string(),
        fc.anything(),
        (eventName1, eventName2, payload) => {
          const router = new BoksEventRouter<any>();
          const listener = vi.fn();
          const throwingListener = vi.fn().mockImplementation(() => {
            throw new Error('Test error');
          });

          // Test array filters and error throwing inside emit
          router.on([eventName1, eventName2], listener);
          router.on(eventName1, throwingListener);

          expect(() => {
            router.emit(eventName1, payload);
          }).not.toThrow();

          // if event is emited successfully, listener should be called
          expect(listener).toHaveBeenCalledWith(payload, undefined);
          expect(throwingListener).toHaveBeenCalledWith(payload, undefined);
        }
      ),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: should handle emitClientEvent errors properly when listeners match', () => {
    fc.assert(
      fc.property(
        fc.oneof(fc.constant('TX'), fc.constant('RX')),
        fc.tuple(fc.integer({ min: 0, max: 255 }), fc.uint8Array()).map(([op, pl]) => new MockPacket(op as BoksOpcode, pl)),
        (direction, packet) => {
          const router = new BoksEventRouter<any>();
          const listener = vi.fn().mockImplementation(() => {
            throw new Error('Test error');
          });
          const onError = vi.fn();

          // Use direction as filter so it is guaranteed to match
          router.on(direction, listener);

          expect(() => {
            router.emitClientEvent(packet, direction as any, onError);
            // Also test without onError to cover the other branch
            router.emitClientEvent(packet, direction as any);
          }).not.toThrow();

          expect(listener).toHaveBeenCalled();
          expect(onError).toHaveBeenCalled();
        }
      ),
      { numRuns: 1000 }
    );
  });
});
