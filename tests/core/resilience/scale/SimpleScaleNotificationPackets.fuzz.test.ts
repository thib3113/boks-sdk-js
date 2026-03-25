import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { NotifyScaleBondingErrorPacket } from '../../../../src/protocol/scale/NotifyScaleBondingErrorPacket';
import { NotifyScaleBondingForgetSuccessPacket } from '../../../../src/protocol/scale/NotifyScaleBondingForgetSuccessPacket';
import { NotifyScaleBondingProgressPacket } from '../../../../src/protocol/scale/NotifyScaleBondingProgressPacket';
import { NotifyScaleBondingSuccessPacket } from '../../../../src/protocol/scale/NotifyScaleBondingSuccessPacket';
import { NotifyScaleDisconnectedPacket } from '../../../../src/protocol/scale/NotifyScaleDisconnectedPacket';
import { NotifyScaleFaultyPacket } from '../../../../src/protocol/scale/NotifyScaleFaultyPacket';
import { NotifyScaleTareEmptyOkPacket } from '../../../../src/protocol/scale/NotifyScaleTareEmptyOkPacket';
import { NotifyScaleTareLoadedOkPacket } from '../../../../src/protocol/scale/NotifyScaleTareLoadedOkPacket';
import { ScalePrepareDfuPacket } from '../../../../src/protocol/scale/ScalePrepareDfuPacket';
import { ScaleReconnectPacket } from '../../../../src/protocol/scale/ScaleReconnectPacket';
import { ScaleTareEmptyPacket } from '../../../../src/protocol/scale/ScaleTareEmptyPacket';
import { ScaleTareLoadedPacket } from '../../../../src/protocol/scale/ScaleTareLoadedPacket';
import { BoksOpcode } from '../../../../src/protocol/constants';

describe('SimpleScaleNotificationPackets Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: NotifyScaleBondingErrorPacket should safely parse error code from first byte or default to 0', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 1, maxLength: 256 }), (payload) => {
        const packet = NotifyScaleBondingErrorPacket.fromRaw(buildMockRawPacket(NotifyScaleBondingErrorPacket.opcode, payload));
        expect(packet).toBeInstanceOf(NotifyScaleBondingErrorPacket);
        expect(packet.opcode).toBe(BoksOpcode.NOTIFY_SCALE_BONDING_ERROR);
        expect(packet.errorCode).toBe(payload[0]);
        expect((packet as any).raw).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: NotifyScaleBondingErrorPacket should throw a detailed BoksProtocolError for payloads that are too short', () => {
    fc.assert(
      fc.property(fc.uint8Array({ maxLength: 0 }), (payload) => {
        try {
          NotifyScaleBondingErrorPacket.fromRaw(buildMockRawPacket(NotifyScaleBondingErrorPacket.opcode, payload));
          expect.unreachable('Should have thrown an error');
        } catch (error: any) {
          expect(error.name).toBe('BoksProtocolError');
          expect(error.context).toBeDefined();
          expect(error.context.received).toBe(0);
          expect(error.context.expected).toBe(1);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('FEATURE REGRESSION: NotifyScaleBondingForgetSuccessPacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = NotifyScaleBondingForgetSuccessPacket.fromRaw(buildMockRawPacket(NotifyScaleBondingForgetSuccessPacket.opcode, payload));
        expect(packet).toBeInstanceOf(NotifyScaleBondingForgetSuccessPacket);
        expect(packet.opcode).toBe(BoksOpcode.NOTIFY_SCALE_BONDING_FORGET_SUCCESS);
        expect((packet as any).raw).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: NotifyScaleBondingProgressPacket should safely parse progress from first byte or default to 0', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 1, maxLength: 256 }), (payload) => {
        const packet = NotifyScaleBondingProgressPacket.fromRaw(buildMockRawPacket(NotifyScaleBondingProgressPacket.opcode, payload));
        expect(packet).toBeInstanceOf(NotifyScaleBondingProgressPacket);
        expect(packet.opcode).toBe(BoksOpcode.NOTIFY_SCALE_BONDING_PROGRESS);
        expect(packet.progress).toBe(payload[0]);
        expect((packet as any).raw).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: NotifyScaleBondingProgressPacket should throw a detailed BoksProtocolError for payloads that are too short', () => {
    fc.assert(
      fc.property(fc.uint8Array({ maxLength: 0 }), (payload) => {
        try {
          NotifyScaleBondingProgressPacket.fromRaw(buildMockRawPacket(NotifyScaleBondingProgressPacket.opcode, payload));
          expect.unreachable('Should have thrown an error');
        } catch (error: any) {
          expect(error.name).toBe('BoksProtocolError');
          expect(error.context).toBeDefined();
          expect(error.context.received).toBe(0);
          expect(error.context.expected).toBe(1);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('FEATURE REGRESSION: NotifyScaleBondingSuccessPacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = NotifyScaleBondingSuccessPacket.fromRaw(buildMockRawPacket(NotifyScaleBondingSuccessPacket.opcode, payload));
        expect(packet).toBeInstanceOf(NotifyScaleBondingSuccessPacket);
        expect(packet.opcode).toBe(BoksOpcode.NOTIFY_SCALE_BONDING_SUCCESS);
        expect((packet as any).raw).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: NotifyScaleDisconnectedPacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = NotifyScaleDisconnectedPacket.fromRaw(buildMockRawPacket(NotifyScaleDisconnectedPacket.opcode, payload));
        expect(packet).toBeInstanceOf(NotifyScaleDisconnectedPacket);
        expect(packet.opcode).toBe(BoksOpcode.NOTIFY_SCALE_DISCONNECTED);
        expect((packet as any).raw).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: NotifyScaleFaultyPacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = NotifyScaleFaultyPacket.fromRaw(buildMockRawPacket(NotifyScaleFaultyPacket.opcode, payload));
        expect(packet).toBeInstanceOf(NotifyScaleFaultyPacket);
        expect(packet.opcode).toBe(BoksOpcode.NOTIFY_SCALE_FAULTY);
        // data isn't mapped to raw payload, because super is called with payload, payload instead of opcode, payload
        expect(packet.data).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: NotifyScaleTareEmptyOkPacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = NotifyScaleTareEmptyOkPacket.fromRaw(buildMockRawPacket(NotifyScaleTareEmptyOkPacket.opcode, payload));
        expect(packet).toBeInstanceOf(NotifyScaleTareEmptyOkPacket);
        expect(packet.opcode).toBe(BoksOpcode.NOTIFY_SCALE_TARE_EMPTY_OK);
        expect((packet as any).raw).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: NotifyScaleTareLoadedOkPacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = NotifyScaleTareLoadedOkPacket.fromRaw(buildMockRawPacket(NotifyScaleTareLoadedOkPacket.opcode, payload));
        expect(packet).toBeInstanceOf(NotifyScaleTareLoadedOkPacket);
        expect(packet.opcode).toBe(BoksOpcode.NOTIFY_SCALE_TARE_LOADED_OK);
        expect((packet as any).raw).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: ScalePrepareDfuPacket should safely handle arbitrary payload lengths and drop them on toPayload', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = ScalePrepareDfuPacket.fromRaw(buildMockRawPacket(ScalePrepareDfuPacket.opcode, payload));
        expect(packet).toBeInstanceOf(ScalePrepareDfuPacket);
        expect(packet.opcode).toBe(BoksOpcode.SCALE_PREPARE_DFU);
        expect(packet.toPayload().length).toBe(0);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: ScaleReconnectPacket should safely handle arbitrary payload lengths and drop them on toPayload', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = ScaleReconnectPacket.fromRaw(buildMockRawPacket(ScaleReconnectPacket.opcode, payload));
        expect(packet).toBeInstanceOf(ScaleReconnectPacket);
        expect(packet.opcode).toBe(BoksOpcode.SCALE_RECONNECT);
        expect(packet.toPayload().length).toBe(0);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: ScaleTareEmptyPacket should safely handle arbitrary payload lengths and drop them on toPayload', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = ScaleTareEmptyPacket.fromRaw(buildMockRawPacket(ScaleTareEmptyPacket.opcode, payload));
        expect(packet).toBeInstanceOf(ScaleTareEmptyPacket);
        expect(packet.opcode).toBe(BoksOpcode.SCALE_TARE_EMPTY);
        expect(packet.toPayload().length).toBe(0);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: ScaleTareLoadedPacket should safely handle arbitrary payload lengths and retain them on toPayload', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = ScaleTareLoadedPacket.fromRaw(buildMockRawPacket(ScaleTareLoadedPacket.opcode, payload));
        expect(packet).toBeInstanceOf(ScaleTareLoadedPacket);
        expect(packet.opcode).toBe(BoksOpcode.SCALE_TARE_LOADED);
        expect(packet.toPayload().length).toBe(payload.length);
        expect(packet.data).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });
});
