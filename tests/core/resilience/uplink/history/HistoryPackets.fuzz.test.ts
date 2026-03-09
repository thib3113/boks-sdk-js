import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { BleRebootHistoryPacket } from '../../../../../src/protocol/uplink/history/BleRebootHistoryPacket';
import { BlockResetHistoryPacket } from '../../../../../src/protocol/uplink/history/BlockResetHistoryPacket';
import { CodeBleInvalidHistoryPacket } from '../../../../../src/protocol/uplink/history/CodeBleInvalidHistoryPacket';
import { CodeBleValidHistoryPacket } from '../../../../../src/protocol/uplink/history/CodeBleValidHistoryPacket';
import { CodeKeyInvalidHistoryPacket } from '../../../../../src/protocol/uplink/history/CodeKeyInvalidHistoryPacket';
import { CodeKeyValidHistoryPacket } from '../../../../../src/protocol/uplink/history/CodeKeyValidHistoryPacket';
import { DoorCloseHistoryPacket } from '../../../../../src/protocol/uplink/history/DoorCloseHistoryPacket';
import { DoorOpenHistoryPacket } from '../../../../../src/protocol/uplink/history/DoorOpenHistoryPacket';
import { ErrorHistoryPacket } from '../../../../../src/protocol/uplink/history/ErrorHistoryPacket';
import { HistoryEraseHistoryPacket } from '../../../../../src/protocol/uplink/history/HistoryEraseHistoryPacket';
import { KeyOpeningHistoryPacket } from '../../../../../src/protocol/uplink/history/KeyOpeningHistoryPacket';
import { NfcOpeningHistoryPacket } from '../../../../../src/protocol/uplink/history/NfcOpeningHistoryPacket';
import { NfcRegisteringHistoryPacket } from '../../../../../src/protocol/uplink/history/NfcRegisteringHistoryPacket';
import { PowerOffHistoryPacket } from '../../../../../src/protocol/uplink/history/PowerOffHistoryPacket';
import { PowerOnHistoryPacket } from '../../../../../src/protocol/uplink/history/PowerOnHistoryPacket';
import { ScaleMeasureHistoryPacket } from '../../../../../src/protocol/uplink/history/ScaleMeasureHistoryPacket';

describe('HistoryPackets Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: BleRebootHistoryPacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = BleRebootHistoryPacket.fromPayload(payload);
        expect(packet).toBeInstanceOf(BleRebootHistoryPacket);
        expect(packet.opcode).toBe(BleRebootHistoryPacket.opcode);
        expect((packet as any).rawPayload).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: BlockResetHistoryPacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = BlockResetHistoryPacket.fromPayload(payload);
        expect(packet).toBeInstanceOf(BlockResetHistoryPacket);
        expect(packet.opcode).toBe(BlockResetHistoryPacket.opcode);
        expect((packet as any).rawPayload).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: CodeBleInvalidHistoryPacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = CodeBleInvalidHistoryPacket.fromPayload(payload);
        expect(packet).toBeInstanceOf(CodeBleInvalidHistoryPacket);
        expect(packet.opcode).toBe(CodeBleInvalidHistoryPacket.opcode);
        expect((packet as any).rawPayload).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: CodeBleValidHistoryPacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = CodeBleValidHistoryPacket.fromPayload(payload);
        expect(packet).toBeInstanceOf(CodeBleValidHistoryPacket);
        expect(packet.opcode).toBe(CodeBleValidHistoryPacket.opcode);
        expect((packet as any).rawPayload).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: CodeKeyInvalidHistoryPacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = CodeKeyInvalidHistoryPacket.fromPayload(payload);
        expect(packet).toBeInstanceOf(CodeKeyInvalidHistoryPacket);
        expect(packet.opcode).toBe(CodeKeyInvalidHistoryPacket.opcode);
        expect((packet as any).rawPayload).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: CodeKeyValidHistoryPacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = CodeKeyValidHistoryPacket.fromPayload(payload);
        expect(packet).toBeInstanceOf(CodeKeyValidHistoryPacket);
        expect(packet.opcode).toBe(CodeKeyValidHistoryPacket.opcode);
        expect((packet as any).rawPayload).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: DoorCloseHistoryPacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = DoorCloseHistoryPacket.fromPayload(payload);
        expect(packet).toBeInstanceOf(DoorCloseHistoryPacket);
        expect(packet.opcode).toBe(DoorCloseHistoryPacket.opcode);
        expect((packet as any).rawPayload).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: DoorOpenHistoryPacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = DoorOpenHistoryPacket.fromPayload(payload);
        expect(packet).toBeInstanceOf(DoorOpenHistoryPacket);
        expect(packet.opcode).toBe(DoorOpenHistoryPacket.opcode);
        expect((packet as any).rawPayload).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: ErrorHistoryPacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = ErrorHistoryPacket.fromPayload(payload);
        expect(packet).toBeInstanceOf(ErrorHistoryPacket);
        expect(packet.opcode).toBe(ErrorHistoryPacket.opcode);
        expect((packet as any).rawPayload).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: HistoryEraseHistoryPacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = HistoryEraseHistoryPacket.fromPayload(payload);
        expect(packet).toBeInstanceOf(HistoryEraseHistoryPacket);
        expect(packet.opcode).toBe(HistoryEraseHistoryPacket.opcode);
        expect((packet as any).rawPayload).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: KeyOpeningHistoryPacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = KeyOpeningHistoryPacket.fromPayload(payload);
        expect(packet).toBeInstanceOf(KeyOpeningHistoryPacket);
        expect(packet.opcode).toBe(KeyOpeningHistoryPacket.opcode);
        expect((packet as any).rawPayload).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: NfcOpeningHistoryPacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = NfcOpeningHistoryPacket.fromPayload(payload);
        expect(packet).toBeInstanceOf(NfcOpeningHistoryPacket);
        expect(packet.opcode).toBe(NfcOpeningHistoryPacket.opcode);
        expect((packet as any).rawPayload).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: NfcRegisteringHistoryPacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = NfcRegisteringHistoryPacket.fromPayload(payload);
        expect(packet).toBeInstanceOf(NfcRegisteringHistoryPacket);
        expect(packet.opcode).toBe(NfcRegisteringHistoryPacket.opcode);
        expect((packet as any).rawPayload).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: PowerOffHistoryPacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = PowerOffHistoryPacket.fromPayload(payload);
        expect(packet).toBeInstanceOf(PowerOffHistoryPacket);
        expect(packet.opcode).toBe(PowerOffHistoryPacket.opcode);
        expect((packet as any).rawPayload).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: PowerOnHistoryPacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = PowerOnHistoryPacket.fromPayload(payload);
        expect(packet).toBeInstanceOf(PowerOnHistoryPacket);
        expect(packet.opcode).toBe(PowerOnHistoryPacket.opcode);
        expect((packet as any).rawPayload).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: ScaleMeasureHistoryPacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = ScaleMeasureHistoryPacket.fromPayload(payload);
        expect(packet).toBeInstanceOf(ScaleMeasureHistoryPacket);
        expect(packet.opcode).toBe(ScaleMeasureHistoryPacket.opcode);
        expect((packet as any).rawPayload).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });
});
