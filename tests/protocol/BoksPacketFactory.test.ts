import { BoksProtocolError, BoksProtocolErrorId } from '@/errors/BoksProtocolError';
import { describe, it, expect, vi } from 'vitest';
import { BoksPacketFactory } from '@/protocol/BoksPacketFactory';
import * as Packets from '@/protocol';
import { calculateChecksum, stringToBytes } from '@/utils/converters';

describe('BoksPacketFactory', () => {
  // Register all packets for tests
  for (const key in Packets) {
    const p = (Packets as any)[key];
    if (typeof p === 'function' && 'opcode' in p) {
      BoksPacketFactory.register(p as any);
    }
  }

  describe('createFromPayload with it.each', () => {
    const configKey = 'ABCDEF01';
    const configKeyBytes = Array.from(stringToBytes(configKey));
    const pin = '123456';
    const pinBytes = Array.from(stringToBytes(pin));

    const testCases = [
      // Uplink / Notifications
      {
        name: 'OperationSuccessPacket',
        class: Packets.OperationSuccessPacket,
        payload: new Uint8Array(0)
      },
      {
        name: 'OperationErrorPacket',
        class: Packets.OperationErrorPacket,
        payload: new Uint8Array([0x01])
      },
      {
        name: 'NotifyLogsCountPacket',
        class: Packets.NotifyLogsCountPacket,
        payload: new Uint8Array([0x00, 0x05])
      },
      {
        name: 'NotifyCodesCountPacket',
        class: Packets.NotifyCodesCountPacket,
        payload: new Uint8Array([0x00, 0x01, 0x00, 0x0a])
      },
      {
        name: 'NotifyDoorStatusPacket',
        class: Packets.NotifyDoorStatusPacket,
        payload: new Uint8Array([0x01, 0x00])
      },
      {
        name: 'AnswerDoorStatusPacket',
        class: Packets.AnswerDoorStatusPacket,
        payload: new Uint8Array([0x00, 0x01])
      },
      {
        name: 'ValidOpenCodePacket',
        class: Packets.ValidOpenCodePacket,
        payload: new Uint8Array(0)
      },
      {
        name: 'InvalidOpenCodePacket',
        class: Packets.InvalidOpenCodePacket,
        payload: new Uint8Array(0)
      },
      {
        name: 'NotifyNfcTagFoundPacket',
        class: Packets.NotifyNfcTagFoundPacket,
        payload: new Uint8Array([0x04, 0x01, 0x02, 0x03, 0x04])
      },
      {
        name: 'ErrorNfcTagAlreadyExistsScanPacket',
        class: Packets.ErrorNfcTagAlreadyExistsScanPacket,
        payload: new Uint8Array(0)
      },
      {
        name: 'ErrorNfcScanTimeoutPacket',
        class: Packets.ErrorNfcScanTimeoutPacket,
        payload: new Uint8Array(0)
      },
      {
        name: 'NotifyNfcTagRegisteredPacket',
        class: Packets.NotifyNfcTagRegisteredPacket,
        payload: new Uint8Array(0)
      },
      {
        name: 'NotifyNfcTagRegisteredErrorAlreadyExistsPacket',
        class: Packets.NotifyNfcTagRegisteredErrorAlreadyExistsPacket,
        payload: new Uint8Array(0)
      },
      {
        name: 'NotifyNfcTagUnregisteredPacket',
        class: Packets.NotifyNfcTagUnregisteredPacket,
        payload: new Uint8Array(0)
      },
      { name: 'EndHistoryPacket', class: Packets.EndHistoryPacket, payload: new Uint8Array(0) },
      {
        name: 'NotifyCodeGenerationSuccessPacket',
        class: Packets.NotifyCodeGenerationSuccessPacket,
        payload: new Uint8Array(0)
      },
      {
        name: 'NotifyCodeGenerationErrorPacket',
        class: Packets.NotifyCodeGenerationErrorPacket,
        payload: new Uint8Array(0)
      },
      {
        name: 'NotifyCodeGenerationProgressPacket',
        class: Packets.NotifyCodeGenerationProgressPacket,
        payload: new Uint8Array([50])
      },
      {
        name: 'NotifySetConfigurationSuccessPacket',
        class: Packets.NotifySetConfigurationSuccessPacket,
        payload: new Uint8Array(0)
      },
      { name: 'ErrorCrcPacket', class: Packets.ErrorCrcPacket, payload: new Uint8Array(0) },
      {
        name: 'ErrorUnauthorizedPacket',
        class: Packets.ErrorUnauthorizedPacket,
        payload: new Uint8Array(0)
      },
      {
        name: 'ErrorBadRequestPacket',
        class: Packets.ErrorBadRequestPacket,
        payload: new Uint8Array(0)
      },

      // History
      {
        name: 'CodeBleValidHistoryPacket',
        class: Packets.CodeBleValidHistoryPacket,
        payload: new Uint8Array([0, 0, 3, 49, 50, 51, 52, 53, 54, 0, 0, 0, 0, 0, 0, 0, 0])
      },
      {
        name: 'CodeBleInvalidHistoryPacket',
        class: Packets.CodeBleInvalidHistoryPacket,
        payload: new Uint8Array([0, 0, 3, 49, 50, 51, 52, 53, 54, 0, 0, 0, 0, 0, 0, 0, 0])
      },
      {
        name: 'CodeKeyValidHistoryPacket',
        class: Packets.CodeKeyValidHistoryPacket,
        payload: new Uint8Array([0, 0, 3, 49, 50, 51, 52, 53, 54, 0, 0, 0, 0, 0, 0, 0, 0])
      },
      {
        name: 'CodeKeyInvalidHistoryPacket',
        class: Packets.CodeKeyInvalidHistoryPacket,
        payload: new Uint8Array([0, 0, 4, 49, 50, 51, 52, 53, 54])
      },
      {
        name: 'DoorOpenHistoryPacket',
        class: Packets.DoorOpenHistoryPacket,
        payload: new Uint8Array([0, 0, 5])
      },
      {
        name: 'DoorCloseHistoryPacket',
        class: Packets.DoorCloseHistoryPacket,
        payload: new Uint8Array([0, 0, 6])
      },
      {
        name: 'HistoryEraseHistoryPacket',
        class: Packets.HistoryEraseHistoryPacket,
        payload: new Uint8Array([0, 0, 7])
      },
      {
        name: 'PowerOnHistoryPacket',
        class: Packets.PowerOnHistoryPacket,
        payload: new Uint8Array([0, 0, 8])
      },
      {
        name: 'PowerOffHistoryPacket',
        class: Packets.PowerOffHistoryPacket,
        payload: new Uint8Array([0, 0, 9, 0])
      },
      {
        name: 'BlockResetHistoryPacket',
        class: Packets.BlockResetHistoryPacket,
        payload: new Uint8Array([0, 0, 10, 0, 0])
      },
      {
        name: 'BleRebootHistoryPacket',
        class: Packets.BleRebootHistoryPacket,
        payload: new Uint8Array([0, 0, 11])
      },
      {
        name: 'ScaleMeasureHistoryPacket',
        class: Packets.ScaleMeasureHistoryPacket,
        payload: new Uint8Array([0, 0, 12, 0, 0, 10, 0])
      },
      {
        name: 'KeyOpeningHistoryPacket',
        class: Packets.KeyOpeningHistoryPacket,
        payload: new Uint8Array([0, 0, 13])
      },
      {
        name: 'ErrorHistoryPacket',
        class: Packets.ErrorHistoryPacket,
        payload: new Uint8Array([0, 0, 14, 0x01])
      },
      {
        name: 'NfcOpeningHistoryPacket',
        class: Packets.NfcOpeningHistoryPacket,
        payload: new Uint8Array([0, 0, 10, 1, 4, 1, 2, 3, 4, 0, 0, 0])
      },
      {
        name: 'NfcRegisteringHistoryPacket',
        class: Packets.NfcRegisteringHistoryPacket,
        payload: new Uint8Array([0, 0, 16, 0x01, 7, 1, 2, 3, 4, 5, 6, 7])
      },

      // Scale Notifications
      {
        name: 'NotifyScaleBondingSuccessPacket',
        class: Packets.NotifyScaleBondingSuccessPacket,
        payload: new Uint8Array(0)
      },
      {
        name: 'NotifyScaleBondingErrorPacket',
        class: Packets.NotifyScaleBondingErrorPacket,
        payload: new Uint8Array([0x01])
      },
      {
        name: 'NotifyMacAddressBoksScalePacket',
        class: Packets.NotifyMacAddressBoksScalePacket,
        payload: new Uint8Array([1, 2, 3, 4, 5, 6])
      },
      {
        name: 'NotifyScaleBondingForgetSuccessPacket',
        class: Packets.NotifyScaleBondingForgetSuccessPacket,
        payload: new Uint8Array(0)
      },
      {
        name: 'NotifyScaleBondingProgressPacket',
        class: Packets.NotifyScaleBondingProgressPacket,
        payload: new Uint8Array([25])
      },
      {
        name: 'NotifyScaleTareEmptyOkPacket',
        class: Packets.NotifyScaleTareEmptyOkPacket,
        payload: new Uint8Array(0)
      },
      {
        name: 'NotifyScaleTareLoadedOkPacket',
        class: Packets.NotifyScaleTareLoadedOkPacket,
        payload: new Uint8Array(0)
      },
      {
        name: 'NotifyScaleMeasureWeightPacket',
        class: Packets.NotifyScaleMeasureWeightPacket,
        payload: new Uint8Array([0, 0, 0x03, 0xe8])
      },
      {
        name: 'NotifyScaleDisconnectedPacket',
        class: Packets.NotifyScaleDisconnectedPacket,
        payload: new Uint8Array(0)
      },
      {
        name: 'NotifyScaleRawSensorsPacket',
        class: Packets.NotifyScaleRawSensorsPacket,
        payload: new Uint8Array([0, 1, 0, 2, 0, 3, 0, 4])
      },
      {
        name: 'NotifyScaleFaultyPacket',
        class: Packets.NotifyScaleFaultyPacket,
        payload: new Uint8Array(0)
      },

      // Downlink
      { name: 'OpenDoorPacket', class: Packets.OpenDoorPacket, payload: new Uint8Array(pinBytes) },
      {
        name: 'AskDoorStatusPacket',
        class: Packets.AskDoorStatusPacket,
        payload: new Uint8Array(0)
      },
      { name: 'RequestLogsPacket', class: Packets.RequestLogsPacket, payload: new Uint8Array(0) },
      { name: 'RebootPacket', class: Packets.RebootPacket, payload: new Uint8Array(0) },
      { name: 'GetLogsCountPacket', class: Packets.GetLogsCountPacket, payload: new Uint8Array(0) },
      { name: 'TestBatteryPacket', class: Packets.TestBatteryPacket, payload: new Uint8Array(0) },
      {
        name: 'MasterCodeEditPacket',
        class: Packets.MasterCodeEditPacket,
        payload: new Uint8Array([...configKeyBytes, 0, ...pinBytes])
      },
      {
        name: 'SingleToMultiCodePacket',
        class: Packets.SingleToMultiCodePacket,
        payload: new Uint8Array([...configKeyBytes, ...pinBytes])
      },
      {
        name: 'MultiToSingleCodePacket',
        class: Packets.MultiToSingleCodePacket,
        payload: new Uint8Array([...configKeyBytes, ...pinBytes])
      },
      {
        name: 'DeleteMasterCodePacket',
        class: Packets.DeleteMasterCodePacket,
        payload: new Uint8Array([...configKeyBytes, 0])
      },
      {
        name: 'DeleteSingleUseCodePacket',
        class: Packets.DeleteSingleUseCodePacket,
        payload: new Uint8Array([...configKeyBytes, ...pinBytes])
      },
      {
        name: 'DeleteMultiUseCodePacket',
        class: Packets.DeleteMultiUseCodePacket,
        payload: new Uint8Array([...configKeyBytes, ...pinBytes])
      },
      {
        name: 'ReactivateCodePacket',
        class: Packets.ReactivateCodePacket,
        payload: new Uint8Array([...configKeyBytes, ...pinBytes])
      },
      {
        name: 'GenerateCodesPacket',
        class: Packets.GenerateCodesPacket,
        payload: new Uint8Array(32).fill(0)
      },
      {
        name: 'CreateMasterCodePacket',
        class: Packets.CreateMasterCodePacket,
        payload: new Uint8Array([...configKeyBytes, ...pinBytes, 0])
      },
      {
        name: 'CreateSingleUseCodePacket',
        class: Packets.CreateSingleUseCodePacket,
        payload: new Uint8Array([...configKeyBytes, ...pinBytes])
      },
      {
        name: 'CreateMultiUseCodePacket',
        class: Packets.CreateMultiUseCodePacket,
        payload: new Uint8Array([...configKeyBytes, ...pinBytes])
      },
      { name: 'CountCodesPacket', class: Packets.CountCodesPacket, payload: new Uint8Array(0) },
      {
        name: 'GenerateCodesSupportPacket',
        class: Packets.GenerateCodesSupportPacket,
        payload: new Uint8Array(32).fill(0)
      },
      {
        name: 'SetConfigurationPacket',
        class: Packets.SetConfigurationPacket,
        payload: new Uint8Array([...configKeyBytes, 0x01, 0x01])
      },
      {
        name: 'RegisterNfcTagScanStartPacket',
        class: Packets.RegisterNfcTagScanStartPacket,
        payload: new Uint8Array(configKeyBytes)
      },
      {
        name: 'NfcRegisterPacket',
        class: Packets.NfcRegisterPacket,
        payload: new Uint8Array([...configKeyBytes, 4, 1, 2, 3, 4])
      },
      {
        name: 'UnregisterNfcTagPacket',
        class: Packets.UnregisterNfcTagPacket,
        payload: new Uint8Array([...configKeyBytes, 4, 1, 2, 3, 4])
      },
      {
        name: 'RegeneratePartAPacket',
        class: Packets.RegeneratePartAPacket,
        payload: new Uint8Array([...configKeyBytes, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
      },
      {
        name: 'RegeneratePartBPacket',
        class: Packets.RegeneratePartBPacket,
        payload: new Uint8Array([...configKeyBytes, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
      }
    ];

    it.each(testCases)('should create $name from payload', ({ class: Ctor, payload }) => {
      const opcode = (Ctor as any).opcode;
      const length = payload.length;
      const dataWithoutChecksum = new Uint8Array(2 + length);
      dataWithoutChecksum[0] = opcode;
      dataWithoutChecksum[1] = length;
      dataWithoutChecksum.set(payload, 2);

      const checksum = calculateChecksum(dataWithoutChecksum);
      const fullData = new Uint8Array(dataWithoutChecksum.length + 1);
      fullData.set(dataWithoutChecksum);
      fullData.set([checksum], dataWithoutChecksum.length);

      const packet = BoksPacketFactory.createFromPayload(fullData);
      expect(packet).toBeInstanceOf(Ctor);
      expect(packet?.opcode).toBe(opcode);
    });
  });

  describe('createFromPayload error handling', () => {
    it('should throw if data length is less than 3', () => {
      const invalidData = new Uint8Array([0x01, 0x02]);
      expect(() => BoksPacketFactory.createFromPayload(invalidData)).toThrow(BoksProtocolError);
    });

    it('should throw if data length is less than indicated by length byte', () => {
      const invalidData = new Uint8Array([0x01, 0x05, 0x03, 0x04]); // Length says 5, but only 2 bytes payload
      expect(() => BoksPacketFactory.createFromPayload(invalidData)).toThrow(BoksProtocolError);
    });

    it('should throw if checksum is invalid', () => {
      const invalidData = new Uint8Array([0x01, 0x01, 0x00, 0xff]); // Invalid checksum
      expect(() => BoksPacketFactory.createFromPayload(invalidData)).toThrow(
        new BoksProtocolError(BoksProtocolErrorId.CHECKSUM_MISMATCH, 'Invalid checksum', {
          expected: 2,
          received: 255
        })
      );
    });

    it('should call logger and throw if checksum is invalid', () => {
      const invalidData = new Uint8Array([0x01, 0x01, 0x00, 0xff]); // Invalid checksum
      const loggerMock = vi.fn();
      expect(() => BoksPacketFactory.createFromPayload(invalidData, loggerMock)).toThrow(
        new BoksProtocolError(BoksProtocolErrorId.CHECKSUM_MISMATCH, 'Invalid checksum', {
          expected: 2,
          received: 255
        })
      );
      expect(loggerMock).toHaveBeenCalled();
    });
  });

  describe('createFromPayload error handling with mocked checksums', () => {
    it('should throw if data length is less than indicated by length byte', () => {
      const opcode = 0x77;
      const length = 5;
      const data = new Uint8Array([opcode, length, 0x01, 0x02]); // Missing 3 bytes of payload + checksum
      expect(() => BoksPacketFactory.createFromPayload(data)).toThrow(
        new BoksProtocolError(
          BoksProtocolErrorId.INVALID_PAYLOAD_LENGTH,
          'Packet length too short based on length byte',
          { received: 4, expected: 8 }
        )
      );
    });

    it('should throw if checksum is invalid', () => {
      const opcode = 0x77;
      const length = 0;
      const invalidChecksum = 0xff;
      const data = new Uint8Array([opcode, length, invalidChecksum]);

      expect(() => BoksPacketFactory.createFromPayload(data)).toThrow(
        new BoksProtocolError(BoksProtocolErrorId.CHECKSUM_MISMATCH, 'Invalid checksum', {
          expected: 0x77,
          received: 255
        })
      );
    });

    it('should call logger and throw if checksum is invalid', () => {
      const opcode = 0x77;
      const length = 0;
      const invalidChecksum = 0x00; // Correct would be 0x77 + 0x00 = 0x77
      const data = new Uint8Array([opcode, length, invalidChecksum]);
      const logger = vi.fn();

      expect(() => BoksPacketFactory.createFromPayload(data, logger)).toThrow(
        new BoksProtocolError(BoksProtocolErrorId.CHECKSUM_MISMATCH, 'Invalid checksum', {
          expected: 0x77,
          received: 0x00
        })
      );
      expect(logger).toHaveBeenCalledWith('warn', 'checksum_error', {
        opcode,
        expected: 0x77,
        received: 0x00
      });
    });

    it('should handle unknown opcode by returning UnknownPacket', () => {
      const unknownOpcode = 0xff; // Assuming 0xFF is not used
      const length = 0;
      const data = new Uint8Array([unknownOpcode, length]);
      const checksum = calculateChecksum(data);
      const fullData = new Uint8Array([unknownOpcode, length, checksum]);

      const packet = BoksPacketFactory.createFromPayload(fullData);
      expect(packet).toBeInstanceOf(Packets.UnknownPacket);
      expect(packet.opcode).toBe(unknownOpcode);
      expect(packet.rawPayload).toEqual(new Uint8Array(0));
    });
  });







    it('should silently ignore register with an undefined class', () => {
      BoksPacketFactory.register(undefined as any);
      // Ensure it doesn't throw. If it does, test fails.
      expect(true).toBe(true);
  });
});
