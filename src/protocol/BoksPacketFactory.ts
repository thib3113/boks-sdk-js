import { BoksPacket, BoksPacketConstructor } from './_BoksPacketBase';
import { OpenDoorPacket } from './downlink/OpenDoorPacket';
import { AskDoorStatusPacket } from './downlink/AskDoorStatusPacket';
import { RequestLogsPacket } from './downlink/RequestLogsPacket';
import { RebootPacket } from './downlink/RebootPacket';
import { GetLogsCountPacket } from './downlink/GetLogsCountPacket';
import { TestBatteryPacket } from './downlink/TestBatteryPacket';
import { MasterCodeEditPacket } from './downlink/MasterCodeEditPacket';
import { SingleToMultiCodePacket } from './downlink/SingleToMultiCodePacket';
import { MultiToSingleCodePacket } from './downlink/MultiToSingleCodePacket';
import { DeleteMasterCodePacket } from './downlink/DeleteMasterCodePacket';
import { DeleteSingleUseCodePacket } from './downlink/DeleteSingleUseCodePacket';
import { DeleteMultiUseCodePacket } from './downlink/DeleteMultiUseCodePacket';
import { ReactivateCodePacket } from './downlink/ReactivateCodePacket';
import { GenerateCodesPacket } from './downlink/GenerateCodesPacket';
import { CreateMasterCodePacket } from './downlink/CreateMasterCodePacket';
import { CreateSingleUseCodePacket } from './downlink/CreateSingleUseCodePacket';
import { CreateMultiUseCodePacket } from './downlink/CreateMultiUseCodePacket';
import { CountCodesPacket } from './downlink/CountCodesPacket';
import { GenerateCodesSupportPacket } from './downlink/GenerateCodesSupportPacket';
import { SetConfigurationPacket } from './downlink/SetConfigurationPacket';
import { RegisterNfcTagScanStartPacket } from './downlink/RegisterNfcTagScanStartPacket';
import { NfcRegisterPacket } from './downlink/NfcRegisterPacket';
import { UnregisterNfcTagPacket } from './downlink/UnregisterNfcTagPacket';
import { RegeneratePartAPacket } from './downlink/RegeneratePartAPacket';
import { RegeneratePartBPacket } from './downlink/RegeneratePartBPacket';

// Scale
import { ScaleBondPacket } from './scale/ScaleBondPacket';
import { ScaleGetMacPacket } from './scale/ScaleGetMacPacket';
import { ScaleForgetPacket } from './scale/ScaleForgetPacket';
import { ScaleTareEmptyPacket } from './scale/ScaleTareEmptyPacket';
import { ScaleTareLoadedPacket } from './scale/ScaleTareLoadedPacket';
import { ScaleMeasureWeightPacket } from './scale/ScaleMeasureWeightPacket';
import { ScalePrepareDfuPacket } from './scale/ScalePrepareDfuPacket';
import { ScaleGetRawSensorsPacket } from './scale/ScaleGetRawSensorsPacket';
import { ScaleReconnectPacket } from './scale/ScaleReconnectPacket';

// Scale Notifications
import { NotifyScaleBondingSuccessPacket } from './scale/NotifyScaleBondingSuccessPacket';
import { NotifyScaleBondingErrorPacket } from './scale/NotifyScaleBondingErrorPacket';
import { NotifyMacAddressBoksScalePacket } from './scale/NotifyMacAddressBoksScalePacket';
import { NotifyScaleBondingForgetSuccessPacket } from './scale/NotifyScaleBondingForgetSuccessPacket';
import { NotifyScaleBondingProgressPacket } from './scale/NotifyScaleBondingProgressPacket';
import { NotifyScaleTareEmptyOkPacket } from './scale/NotifyScaleTareEmptyOkPacket';
import { NotifyScaleTareLoadedOkPacket } from './scale/NotifyScaleTareLoadedOkPacket';
import { NotifyScaleMeasureWeightPacket } from './scale/NotifyScaleMeasureWeightPacket';
import { NotifyScaleDisconnectedPacket } from './scale/NotifyScaleDisconnectedPacket';
import { NotifyScaleRawSensorsPacket } from './scale/NotifyScaleRawSensorsPacket';
import { NotifyScaleFaultyPacket } from './scale/NotifyScaleFaultyPacket';

// RX / Notifications
import { OperationSuccessPacket } from './uplink/OperationSuccessPacket';
import { OperationErrorPacket } from './uplink/OperationErrorPacket';
import { NotifyLogsCountPacket } from './uplink/NotifyLogsCountPacket';
import { ValidOpenCodePacket } from './uplink/ValidOpenCodePacket';
import { InvalidOpenCodePacket } from './uplink/InvalidOpenCodePacket';
import { NotifyDoorStatusPacket } from './uplink/NotifyDoorStatusPacket';
import { AnswerDoorStatusPacket } from './uplink/AnswerDoorStatusPacket';
import { NotifyCodesCountPacket } from './uplink/NotifyCodesCountPacket';
import { NotifyNfcTagFoundPacket } from './uplink/NotifyNfcTagFoundPacket';
import { ErrorNfcTagAlreadyExistsScanPacket } from './uplink/ErrorNfcTagAlreadyExistsScanPacket';
import { ErrorNfcScanTimeoutPacket } from './uplink/ErrorNfcScanTimeoutPacket';
import { NotifyNfcTagRegisteredPacket } from './uplink/NotifyNfcTagRegisteredPacket';
import { NotifyNfcTagRegisteredErrorAlreadyExistsPacket } from './uplink/NotifyNfcTagRegisteredErrorAlreadyExistsPacket';
import { NotifyNfcTagUnregisteredPacket } from './uplink/NotifyNfcTagUnregisteredPacket';
import { EndHistoryPacket } from './uplink/EndHistoryPacket';
import { NotifyCodeGenerationSuccessPacket } from './uplink/NotifyCodeGenerationSuccessPacket';
import { NotifyCodeGenerationErrorPacket } from './uplink/NotifyCodeGenerationErrorPacket';
import { NotifyCodeGenerationProgressPacket } from './uplink/NotifyCodeGenerationProgressPacket';
import { NotifySetConfigurationSuccessPacket } from './uplink/NotifySetConfigurationSuccessPacket';
import { ErrorCrcPacket } from './uplink/ErrorCrcPacket';
import { ErrorUnauthorizedPacket } from './uplink/ErrorUnauthorizedPacket';
import { ErrorBadRequestPacket } from './uplink/ErrorBadRequestPacket';

// Logs
import { CodeBleValidHistoryPacket } from './uplink/history/CodeBleValidHistoryPacket';
import { CodeBleInvalidHistoryPacket } from './uplink/history/CodeBleInvalidHistoryPacket';
import { CodeKeyValidHistoryPacket } from './uplink/history/CodeKeyValidHistoryPacket';
import { CodeKeyInvalidHistoryPacket } from './uplink/history/CodeKeyInvalidHistoryPacket';
import { DoorOpenHistoryPacket } from './uplink/history/DoorOpenHistoryPacket';
import { DoorCloseHistoryPacket } from './uplink/history/DoorCloseHistoryPacket';
import { HistoryEraseHistoryPacket } from './uplink/history/HistoryEraseHistoryPacket';
import { PowerOnHistoryPacket } from './uplink/history/PowerOnHistoryPacket';
import { PowerOffHistoryPacket } from './uplink/history/PowerOffHistoryPacket';
import { BlockResetHistoryPacket } from './uplink/history/BlockResetHistoryPacket';
import { BleRebootHistoryPacket } from './uplink/history/BleRebootHistoryPacket';
import { ScaleMeasureHistoryPacket } from './uplink/history/ScaleMeasureHistoryPacket';
import { KeyOpeningHistoryPacket } from './uplink/history/KeyOpeningHistoryPacket';
import { ErrorHistoryPacket } from './uplink/history/ErrorHistoryPacket';
import { NfcOpeningHistoryPacket } from './uplink/history/NfcOpeningHistoryPacket';
import { NfcRegisteringHistoryPacket } from './uplink/history/NfcRegisteringHistoryPacket';

import { hexToBytes, calculateChecksum } from '@/utils/converters';
import { BoksProtocolError, BoksProtocolErrorId } from '@/errors/BoksProtocolError';

/**
 * List of all supported packet classes.
 * We use an array and map it to a registry for cleaner management.
 */
const PACKET_CLASSES: BoksPacketConstructor[] = [
  // Downlink
  OpenDoorPacket,
  AskDoorStatusPacket,
  RequestLogsPacket,
  RebootPacket,
  GetLogsCountPacket,
  TestBatteryPacket,
  MasterCodeEditPacket,
  SingleToMultiCodePacket,
  MultiToSingleCodePacket,
  DeleteMasterCodePacket,
  DeleteSingleUseCodePacket,
  DeleteMultiUseCodePacket,
  ReactivateCodePacket,
  GenerateCodesPacket,
  CreateMasterCodePacket,
  CreateSingleUseCodePacket,
  CreateMultiUseCodePacket,
  CountCodesPacket,
  GenerateCodesSupportPacket,
  SetConfigurationPacket,
  RegisterNfcTagScanStartPacket,
  NfcRegisterPacket,
  UnregisterNfcTagPacket,
  RegeneratePartAPacket,
  RegeneratePartBPacket,

  // Scale Commands
  ScaleBondPacket,
  ScaleGetMacPacket,
  ScaleForgetPacket,
  ScaleTareEmptyPacket,
  ScaleTareLoadedPacket,
  ScaleMeasureWeightPacket,
  ScalePrepareDfuPacket,
  ScaleGetRawSensorsPacket,
  ScaleReconnectPacket,

  // Scale Notifications
  NotifyScaleBondingSuccessPacket,
  NotifyScaleBondingErrorPacket,
  NotifyMacAddressBoksScalePacket,
  NotifyScaleBondingForgetSuccessPacket,
  NotifyScaleBondingProgressPacket,
  NotifyScaleTareEmptyOkPacket,
  NotifyScaleTareLoadedOkPacket,
  NotifyScaleMeasureWeightPacket,
  NotifyScaleDisconnectedPacket,
  NotifyScaleRawSensorsPacket,
  NotifyScaleFaultyPacket,

  // RX / Notifications
  OperationSuccessPacket,
  OperationErrorPacket,
  NotifyLogsCountPacket,
  ValidOpenCodePacket,
  InvalidOpenCodePacket,
  NotifyDoorStatusPacket,
  AnswerDoorStatusPacket,
  NotifyCodesCountPacket,
  NotifyNfcTagFoundPacket,
  ErrorNfcTagAlreadyExistsScanPacket,
  ErrorNfcScanTimeoutPacket,
  NotifyNfcTagRegisteredPacket,
  NotifyNfcTagRegisteredErrorAlreadyExistsPacket,
  NotifyNfcTagUnregisteredPacket,
  EndHistoryPacket,
  NotifyCodeGenerationSuccessPacket,
  NotifyCodeGenerationErrorPacket,
  NotifyCodeGenerationProgressPacket,
  NotifySetConfigurationSuccessPacket,
  ErrorCrcPacket,
  ErrorUnauthorizedPacket,
  ErrorBadRequestPacket,

  // Logs
  CodeBleValidHistoryPacket,
  CodeBleInvalidHistoryPacket,
  CodeKeyValidHistoryPacket,
  CodeKeyInvalidHistoryPacket,
  DoorOpenHistoryPacket,
  DoorCloseHistoryPacket,
  HistoryEraseHistoryPacket,
  PowerOnHistoryPacket,
  PowerOffHistoryPacket,
  BlockResetHistoryPacket,
  BleRebootHistoryPacket,
  ScaleMeasureHistoryPacket,
  KeyOpeningHistoryPacket,
  ErrorHistoryPacket,
  NfcOpeningHistoryPacket,
  NfcRegisteringHistoryPacket
];

/**
 * Factory class for creating Boks packets from raw data.
 */
export class BoksPacketFactory {
  private static readonly registry = new Map<number, BoksPacketConstructor>(
    PACKET_CLASSES.map((ctor) => [ctor.opcode, ctor])
  );

  /**
   * Creates a packet instance from a full raw Bluetooth payload.
   * Expected format: [Opcode, Length, ...Payload, Checksum]
   */
  static createFromPayload(
    data: Uint8Array,
    logger?: (
      level: 'info' | 'warn' | 'error' | 'debug',
      event: 'checksum_error',
      context: { opcode: number; expected: number; received: number }
    ) => void
  ): BoksPacket | undefined {
    if (data.length < 3) return undefined;

    const opcode = data[0];
    const length = data[1];

    // Ensure we have enough data (Opcode + Length + Payload + Checksum)
    if (data.length < length + 3) return undefined;

    const payload = data.subarray(2, 2 + length);
    const checksum = data[length + 2];

    // Validate checksum
    const computedChecksum = calculateChecksum(data.subarray(0, length + 2));
    if (checksum !== computedChecksum) {
      if (logger) {
        logger('warn', 'checksum_error', {
          opcode,
          expected: computedChecksum,
          received: checksum
        });
      }
      return undefined;
    }

    return this.fromResponse(opcode, payload);
  }

  /**
   * Get the constructor for a specific opcode.
   */
  static getConstructor(opcode: number): BoksPacketConstructor | undefined {
    return this.registry.get(opcode);
  }

  /**
   * Creates an RX packet instance from an opcode and its payload.
   */
  static fromResponse(opcode: number, payload: Uint8Array): BoksPacket | undefined {
    const Ctor = this.getConstructor(opcode);
    if (!Ctor) return undefined;

    return Ctor.fromPayload(payload);
  }

  /**
   * Helper to create regeneration packets from a 32-byte key.
   */
  static createRegeneratePackets(
    configKey: string,
    newMasterKey: Uint8Array | string
  ): [RegeneratePartAPacket, RegeneratePartBPacket] {
    const keyBytes = typeof newMasterKey === 'string' ? hexToBytes(newMasterKey) : newMasterKey;
    if (keyBytes.length !== 32) {
      throw new BoksProtocolError(BoksProtocolErrorId.INVALID_VALUE, undefined, {
        received: keyBytes.length,
        expected: 32,
        field: 'newMasterKey'
      });
    }
    return [
      new RegeneratePartAPacket(configKey, keyBytes.slice(0, 16)),
      new RegeneratePartBPacket(configKey, keyBytes.slice(16, 32))
    ];
  }
}
