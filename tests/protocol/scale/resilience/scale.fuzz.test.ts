import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { BoksProtocolError } from '../../../../src/errors/BoksProtocolError';

import { NotifyMacAddressBoksScalePacket } from '../../../../src/protocol/scale/NotifyMacAddressBoksScalePacket';
import { NotifyScaleBondingErrorPacket } from '../../../../src/protocol/scale/NotifyScaleBondingErrorPacket';
import { NotifyScaleBondingForgetSuccessPacket } from '../../../../src/protocol/scale/NotifyScaleBondingForgetSuccessPacket';
import { NotifyScaleBondingProgressPacket } from '../../../../src/protocol/scale/NotifyScaleBondingProgressPacket';
import { NotifyScaleBondingSuccessPacket } from '../../../../src/protocol/scale/NotifyScaleBondingSuccessPacket';
import { NotifyScaleDisconnectedPacket } from '../../../../src/protocol/scale/NotifyScaleDisconnectedPacket';
import { NotifyScaleFaultyPacket } from '../../../../src/protocol/scale/NotifyScaleFaultyPacket';
import { NotifyScaleMeasureWeightPacket } from '../../../../src/protocol/scale/NotifyScaleMeasureWeightPacket';
import { NotifyScaleRawSensorsPacket } from '../../../../src/protocol/scale/NotifyScaleRawSensorsPacket';
import { NotifyScaleTareEmptyOkPacket } from '../../../../src/protocol/scale/NotifyScaleTareEmptyOkPacket';
import { NotifyScaleTareLoadedOkPacket } from '../../../../src/protocol/scale/NotifyScaleTareLoadedOkPacket';
import { ScaleBondPacket } from '../../../../src/protocol/scale/ScaleBondPacket';
import { ScaleForgetPacket } from '../../../../src/protocol/scale/ScaleForgetPacket';
import { ScaleGetMacPacket } from '../../../../src/protocol/scale/ScaleGetMacPacket';
import { ScaleGetRawSensorsPacket } from '../../../../src/protocol/scale/ScaleGetRawSensorsPacket';
import { ScaleMeasureWeightPacket } from '../../../../src/protocol/scale/ScaleMeasureWeightPacket';
import { ScalePrepareDfuPacket } from '../../../../src/protocol/scale/ScalePrepareDfuPacket';
import { ScaleReconnectPacket } from '../../../../src/protocol/scale/ScaleReconnectPacket';
import { ScaleTareEmptyPacket } from '../../../../src/protocol/scale/ScaleTareEmptyPacket';
import { ScaleTareLoadedPacket } from '../../../../src/protocol/scale/ScaleTareLoadedPacket';
import { buildMockRawPacket } from '../../../../utils/packet-builder';

const SCALE_PACKETS = [
  NotifyMacAddressBoksScalePacket,
  NotifyScaleBondingErrorPacket,
  NotifyScaleBondingForgetSuccessPacket,
  NotifyScaleBondingProgressPacket,
  NotifyScaleBondingSuccessPacket,
  NotifyScaleDisconnectedPacket,
  NotifyScaleFaultyPacket,
  NotifyScaleMeasureWeightPacket,
  NotifyScaleRawSensorsPacket,
  NotifyScaleTareEmptyOkPacket,
  NotifyScaleTareLoadedOkPacket,
  ScaleBondPacket,
  ScaleForgetPacket,
  ScaleGetMacPacket,
  ScaleGetRawSensorsPacket,
  ScaleMeasureWeightPacket,
  ScalePrepareDfuPacket,
  ScaleReconnectPacket,
  ScaleTareEmptyPacket,
  ScaleTareLoadedPacket
];

describe('Scale Packets Resilience (Fuzzing)', () => {
  for (const PacketClass of SCALE_PACKETS) {
    it(`FEATURE REGRESSION: ${PacketClass.name}.fromRaw should securely reject malformed binary payloads with BoksProtocolError`, () => {
      fc.assert(
        fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
          try {
            const packet = PacketClass.fromRaw(buildMockRawPacket(PacketClass.opcode, payload));
            expect(packet).toBeInstanceOf(PacketClass);
          } catch (e) {
            expect(e).toBeInstanceOf(BoksProtocolError);
          }
        }),
        { numRuns: 100 }
      );
    });
  }
});
