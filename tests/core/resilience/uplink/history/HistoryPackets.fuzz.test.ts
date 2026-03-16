import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { BleRebootHistoryPacket } from '@/protocol/uplink/history/BleRebootHistoryPacket';
import { BlockResetHistoryPacket } from '@/protocol/uplink/history/BlockResetHistoryPacket';
import { CodeBleInvalidHistoryPacket } from '@/protocol/uplink/history/CodeBleInvalidHistoryPacket';
import { CodeBleValidHistoryPacket } from '@/protocol/uplink/history/CodeBleValidHistoryPacket';
import { CodeKeyInvalidHistoryPacket } from '@/protocol/uplink/history/CodeKeyInvalidHistoryPacket';
import { CodeKeyValidHistoryPacket } from '@/protocol/uplink/history/CodeKeyValidHistoryPacket';
import { DoorCloseHistoryPacket } from '@/protocol/uplink/history/DoorCloseHistoryPacket';
import { DoorOpenHistoryPacket } from '@/protocol/uplink/history/DoorOpenHistoryPacket';
import { ErrorHistoryPacket } from '@/protocol/uplink/history/ErrorHistoryPacket';
import { HistoryEraseHistoryPacket } from '@/protocol/uplink/history/HistoryEraseHistoryPacket';
import { KeyOpeningHistoryPacket } from '@/protocol/uplink/history/KeyOpeningHistoryPacket';
import { NfcOpeningHistoryPacket } from '@/protocol/uplink/history/NfcOpeningHistoryPacket';
import { NfcRegisteringHistoryPacket } from '@/protocol/uplink/history/NfcRegisteringHistoryPacket';
import { PowerOffHistoryPacket } from '@/protocol/uplink/history/PowerOffHistoryPacket';
import { PowerOnHistoryPacket } from '@/protocol/uplink/history/PowerOnHistoryPacket';
import { ScaleMeasureHistoryPacket } from '@/protocol/uplink/history/ScaleMeasureHistoryPacket';

describe('HistoryPackets Resilience (Fuzzing)', () => {
  const classes = [
    BleRebootHistoryPacket,
    BlockResetHistoryPacket,
    CodeBleInvalidHistoryPacket,
    CodeBleValidHistoryPacket,
    CodeKeyInvalidHistoryPacket,
    CodeKeyValidHistoryPacket,
    DoorCloseHistoryPacket,
    DoorOpenHistoryPacket,
    ErrorHistoryPacket,
    HistoryEraseHistoryPacket,
    KeyOpeningHistoryPacket,
    NfcOpeningHistoryPacket,
    NfcRegisteringHistoryPacket,
    PowerOffHistoryPacket,
    PowerOnHistoryPacket,
    ScaleMeasureHistoryPacket
  ];

  for (const PacketClass of classes) {
    it(`FEATURE REGRESSION: ${PacketClass.name} should safely handle arbitrary payload lengths`, () => {
      fc.assert(
        fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
          try {
            const packet = PacketClass.fromPayload(payload);
            expect(packet).toBeInstanceOf(PacketClass);
            expect(packet.opcode).toBe((PacketClass as any).opcode);
            expect((packet as any).rawPayload).toEqual(payload);
          } catch (e: any) {
            if (
              e.id === 'MALFORMED_DATA' ||
              e.id === 'INVALID_PIN_FORMAT' ||
              e.id === 'INVALID_CONFIG_KEY'
            ) {
              return;
            }
            throw e;
          }
        }),
        { numRuns: 1000 }
      );
    });
  }
});
