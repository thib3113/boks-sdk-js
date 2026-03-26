import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { ScaleGetRawSensorsPacket } from '../../../../src/protocol/scale/ScaleGetRawSensorsPacket';
import { ScaleMeasureWeightPacket } from '../../../../src/protocol/scale/ScaleMeasureWeightPacket';
import { ScaleForgetPacket } from '../../../../src/protocol/scale/ScaleForgetPacket';
import { ScaleTareEmptyPacket } from '../../../../src/protocol/scale/ScaleTareEmptyPacket';
import { ScaleTareLoadedPacket } from '../../../../src/protocol/scale/ScaleTareLoadedPacket';
import { BoksOpcode } from '../../../../src/protocol/constants';

describe('Scale additional simple packets Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: ScaleGetRawSensorsPacket should safely handle arbitrary payload lengths and drop them on toPayload', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = ScaleGetRawSensorsPacket.fromRaw(payload);
        expect(packet).toBeInstanceOf(ScaleGetRawSensorsPacket);
        expect(packet.opcode).toBe(BoksOpcode.SCALE_GET_RAW_SENSORS);
        expect(packet.toPayload().length).toBe(0);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: ScaleMeasureWeightPacket should safely handle arbitrary payload lengths and drop them on toPayload', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = ScaleMeasureWeightPacket.fromRaw(payload);
        expect(packet).toBeInstanceOf(ScaleMeasureWeightPacket);
        expect(packet.opcode).toBe(BoksOpcode.SCALE_MEASURE_WEIGHT);
        expect(packet.toPayload().length).toBe(0);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: ScaleForgetPacket should safely handle arbitrary payload lengths and drop them on toPayload', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = ScaleForgetPacket.fromRaw(payload);
        expect(packet).toBeInstanceOf(ScaleForgetPacket);
        expect(packet.opcode).toBe(BoksOpcode.SCALE_FORGET_BONDING);
        expect(packet.toPayload().length).toBe(0);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: ScaleTareEmptyPacket should safely handle arbitrary payload lengths and drop them on toPayload', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = ScaleTareEmptyPacket.fromRaw(payload);
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
        const packet = ScaleTareLoadedPacket.fromRaw(payload);
        expect(packet).toBeInstanceOf(ScaleTareLoadedPacket);
        expect(packet.opcode).toBe(BoksOpcode.SCALE_TARE_LOADED);
        expect(packet.toPayload()).toBeInstanceOf(Uint8Array);
        expect(packet.data).toBeInstanceOf(Uint8Array);
      }),
      { numRuns: 1000 }
    );
  });
});
