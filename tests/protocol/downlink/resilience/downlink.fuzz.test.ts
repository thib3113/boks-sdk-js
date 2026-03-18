import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { BoksProtocolError } from '../../../../src/errors/BoksProtocolError';

import { AskDoorStatusPacket } from '../../../../src/protocol/downlink/AskDoorStatusPacket';
import { CountCodesPacket } from '../../../../src/protocol/downlink/CountCodesPacket';
import { CreateMasterCodePacket } from '../../../../src/protocol/downlink/CreateMasterCodePacket';
import { CreateMultiUseCodePacket } from '../../../../src/protocol/downlink/CreateMultiUseCodePacket';
import { CreateSingleUseCodePacket } from '../../../../src/protocol/downlink/CreateSingleUseCodePacket';
import { DeleteMasterCodePacket } from '../../../../src/protocol/downlink/DeleteMasterCodePacket';
import { DeleteMultiUseCodePacket } from '../../../../src/protocol/downlink/DeleteMultiUseCodePacket';
import { DeleteSingleUseCodePacket } from '../../../../src/protocol/downlink/DeleteSingleUseCodePacket';
import { GenerateCodesPacket } from '../../../../src/protocol/downlink/GenerateCodesPacket';
import { GenerateCodesSupportPacket } from '../../../../src/protocol/downlink/GenerateCodesSupportPacket';
import { GetLogsCountPacket } from '../../../../src/protocol/downlink/GetLogsCountPacket';
import { MasterCodeEditPacket } from '../../../../src/protocol/downlink/MasterCodeEditPacket';
import { MultiToSingleCodePacket } from '../../../../src/protocol/downlink/MultiToSingleCodePacket';
import { NfcRegisterPacket } from '../../../../src/protocol/downlink/NfcRegisterPacket';
import { OpenDoorPacket } from '../../../../src/protocol/downlink/OpenDoorPacket';
import { ReactivateCodePacket } from '../../../../src/protocol/downlink/ReactivateCodePacket';
import { RebootPacket } from '../../../../src/protocol/downlink/RebootPacket';
import { RegeneratePartAPacket } from '../../../../src/protocol/downlink/RegeneratePartAPacket';
import { RegeneratePartBPacket } from '../../../../src/protocol/downlink/RegeneratePartBPacket';
import { RegisterNfcTagScanStartPacket } from '../../../../src/protocol/downlink/RegisterNfcTagScanStartPacket';
import { RequestLogsPacket } from '../../../../src/protocol/downlink/RequestLogsPacket';
import { SetConfigurationPacket } from '../../../../src/protocol/downlink/SetConfigurationPacket';
import { SingleToMultiCodePacket } from '../../../../src/protocol/downlink/SingleToMultiCodePacket';
import { TestBatteryPacket } from '../../../../src/protocol/downlink/TestBatteryPacket';
import { UnregisterNfcTagPacket } from '../../../../src/protocol/downlink/UnregisterNfcTagPacket';

const DOWNLINK_PACKETS = [
  AskDoorStatusPacket,
  CountCodesPacket,
  CreateMasterCodePacket,
  CreateMultiUseCodePacket,
  CreateSingleUseCodePacket,
  DeleteMasterCodePacket,
  DeleteMultiUseCodePacket,
  DeleteSingleUseCodePacket,
  GenerateCodesPacket,
  GenerateCodesSupportPacket,
  GetLogsCountPacket,
  MasterCodeEditPacket,
  MultiToSingleCodePacket,
  NfcRegisterPacket,
  OpenDoorPacket,
  ReactivateCodePacket,
  RebootPacket,
  RegeneratePartAPacket,
  RegeneratePartBPacket,
  RegisterNfcTagScanStartPacket,
  RequestLogsPacket,
  SetConfigurationPacket,
  SingleToMultiCodePacket,
  TestBatteryPacket,
  UnregisterNfcTagPacket
];

describe('Downlink Packets Resilience (Fuzzing)', () => {
  for (const PacketClass of DOWNLINK_PACKETS) {
    it(`FEATURE REGRESSION: ${PacketClass.name}.fromPayload should securely reject malformed binary payloads with BoksProtocolError`, () => {
      fc.assert(
        fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
          try {
            const packet = PacketClass.fromPayload(payload);
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
