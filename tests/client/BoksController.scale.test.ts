import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { BoksController } from '@/client/BoksController';
import { BoksClient } from '@/client/BoksClient';
import {
  BoksOpcode,
  NotifyScaleMeasureWeightPacket,
  ScaleTareEmptyPacket,
  ScaleTareLoadedPacket
} from '@/protocol';
import { BoksClientError, BoksClientErrorId } from '@/errors/BoksClientError';

// Mock BoksClient
vi.mock('@/client/BoksClient');

describe('Scale Features', () => {
  describe('NotifyScaleMeasureWeightPacket Parsing', () => {
    it('should parse positive weight correctly', () => {
      // 1000g -> 0x03E8. Sign 0.
      // Payload: [Sign, ValHigh, ValMid, ValLow]
      const payload = new Uint8Array([0x00, 0x00, 0x03, 0xE8]);
      const packet = NotifyScaleMeasureWeightPacket.fromPayload(payload);
      expect(packet.weight).toBe(1000);
    });

    it('should parse negative weight correctly', () => {
      // -1000g -> 1000 = 0x03E8. Sign 1 (non-zero).
      const payload = new Uint8Array([0x01, 0x00, 0x03, 0xE8]);
      const packet = NotifyScaleMeasureWeightPacket.fromPayload(payload);
      expect(packet.weight).toBe(-1000);
    });

    it('should parse zero weight', () => {
      const payload = new Uint8Array([0x00, 0x00, 0x00, 0x00]);
      const packet = NotifyScaleMeasureWeightPacket.fromPayload(payload);
      expect(packet.weight).toBe(0);
    });

    it('should handle small buffer gracefully', () => {
      const payload = new Uint8Array([0x00, 0x01]);
      const packet = NotifyScaleMeasureWeightPacket.fromPayload(payload);
      // Logic: if (payload.length >= 4) ... else weight=0
      expect(packet.weight).toBe(0);
    });
  });

  describe('BoksController Scale Methods', () => {
    let controller: BoksController;
    let mockClientInstance: {
        execute: Mock;
        onPacket: Mock;
    };

    beforeEach(() => {
      vi.clearAllMocks();
      mockClientInstance = {
        execute: vi.fn(),
        onPacket: vi.fn().mockReturnValue(() => {}),
      };
      (BoksClient as unknown as Mock).mockReturnValue(mockClientInstance);
      controller = new BoksController(new BoksClient());
    });

    it('bondScale should return true on success', async () => {
        mockClientInstance.execute.mockResolvedValue({ response: { opcode: BoksOpcode.NOTIFY_SCALE_BONDING_SUCCESS } });
        const result = await controller.bondScale();
        expect(mockClientInstance.execute).toHaveBeenCalled();
        expect(result).toBe(true);
    });

    it('bondScale should return false on error', async () => {
        mockClientInstance.execute.mockRejectedValue(new BoksClientError(BoksClientErrorId.UNKNOWN_ERROR, 'Received error opcode'));
        const result = await controller.bondScale();
        expect(result).toBe(false);
    });

    it('getScaleWeight should return weight', async () => {
        mockClientInstance.execute.mockResolvedValue({ response: { weight: 1234 } });
        const result = await controller.getScaleWeight();
        expect(mockClientInstance.execute).toHaveBeenCalled();
        expect(result).toBe(1234);
    });

    it('getScaleWeight should handle negative weight response', async () => {
        mockClientInstance.execute.mockResolvedValue({ response: { weight: -500 } });
        const result = await controller.getScaleWeight();
        expect(result).toBe(-500);
    });

    it('tareScale(true) should send ScaleTareEmptyPacket', async () => {
        mockClientInstance.execute.mockResolvedValue({ response: { opcode: BoksOpcode.NOTIFY_SCALE_TARE_EMPTY_OK } });
        const result = await controller.tareScale(true);

        expect(mockClientInstance.execute).toHaveBeenCalled();
        const packet = mockClientInstance.execute.mock.calls[0][0];
        expect(packet).toBeInstanceOf(ScaleTareEmptyPacket);
        expect(result).toBe(true);
    });

    it('tareScale(false) should send ScaleTareLoadedPacket', async () => {
        mockClientInstance.execute.mockResolvedValue({ response: { opcode: BoksOpcode.NOTIFY_SCALE_TARE_LOADED_OK } });
        const result = await controller.tareScale(false);

        expect(mockClientInstance.execute).toHaveBeenCalled();
        const packet = mockClientInstance.execute.mock.calls[0][0];
        expect(packet).toBeInstanceOf(ScaleTareLoadedPacket);
        expect(result).toBe(true);
    });

    it('forgetScale should return true', async () => {
        mockClientInstance.execute.mockResolvedValue({ response: { opcode: BoksOpcode.NOTIFY_SCALE_BONDING_FORGET_SUCCESS } });
        const result = await controller.forgetScale();
        expect(result).toBe(true);
    });

    it('getScaleRawSensors should return data', async () => {
        const data = new Uint8Array([1, 2, 3]);
        mockClientInstance.execute.mockResolvedValue({ response: { data } });
        const result = await controller.getScaleRawSensors();
        expect(result).toEqual(data);
    });
  });
});
