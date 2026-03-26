import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { NotifyScaleRawSensorsPacket } from '../../../../src/protocol/scale/NotifyScaleRawSensorsPacket';
import { ScaleBondPacket } from '../../../../src/protocol/scale/ScaleBondPacket';
import { ScaleGetMacPacket } from '../../../../src/protocol/scale/ScaleGetMacPacket';
import { BoksOpcode } from '../../../../src/protocol/constants';
import { BoksPacket } from '../../../../src/protocol/_BoksPacketBase';
import { PayloadMapper } from '../../../../src/protocol/decorators';

describe('Scale generic packets Resilience (Fuzzing)', () => {
  it('NotifyScaleRawSensorsPacket should handle arbitrary arrays', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (data) => {
        const packet = NotifyScaleRawSensorsPacket.fromRaw(data);
        expect(packet).toBeInstanceOf(NotifyScaleRawSensorsPacket);
        expect(packet.opcode).toBe(BoksOpcode.NOTIFY_SCALE_RAW_SENSORS);
        const expectedData = PayloadMapper.parse(NotifyScaleRawSensorsPacket, data).data;
        expect(packet.data).toEqual(expectedData);
      }),
      { numRuns: 1000 }
    );
  });

  it('ScaleBondPacket should handle arbitrary arrays', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (data) => {
        const packet = ScaleBondPacket.fromRaw(data);
        expect(packet).toBeInstanceOf(ScaleBondPacket);
        expect(packet.opcode).toBe(BoksOpcode.SCALE_BOND);
        const expectedData = BoksPacket.extractPayloadData(data, BoksOpcode.SCALE_BOND);
        expect(packet.data).toEqual(expectedData);
        expect(packet.toPayload()).toEqual(expectedData);
      }),
      { numRuns: 1000 }
    );
  });

  it('ScaleGetMacPacket should handle arbitrary arrays without utilizing them', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (data) => {
        const packet = ScaleGetMacPacket.fromRaw(data);
        expect(packet).toBeInstanceOf(ScaleGetMacPacket);
        expect(packet.opcode).toBe(BoksOpcode.SCALE_GET_MAC_ADDRESS_BOKS);
        expect(packet.toPayload().length).toBe(0);
      }),
      { numRuns: 1000 }
    );
  });
});
