import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { BoksController } from '@/client/BoksController';
import { BoksClient } from '@/client/BoksClient';
import {
  BoksOpcode,
  NotifyScaleMeasureWeightPacket
} from '@/protocol';

// Mock BoksClient
vi.mock('@/client/BoksClient');

describe('Scale Features', () => {
  describe('NotifyScaleMeasureWeightPacket Parsing', () => {
    it('should parse positive weight correctly', () => {
      const payload = new Uint8Array([0x00, 0x00, 0x03, 0xE8]); // 1000g
      const packet = NotifyScaleMeasureWeightPacket.fromPayload(payload);
      expect(packet.weight).toBe(1000);
    });
  });

  describe('BoksController Scale Methods', () => {
    let controller: BoksController;
    let mockClientInstance: any;

    beforeEach(() => {
      vi.clearAllMocks();
      mockClientInstance = {
        execute: vi.fn(),
        onPacket: vi.fn().mockReturnValue(() => {}),
      };
      (BoksClient as unknown as Mock).mockReturnValue(mockClientInstance);
      controller = new BoksController(new BoksClient());
    });

    const setupSuccess = (response: any = { opcode: BoksOpcode.CODE_OPERATION_SUCCESS }) => 
      mockClientInstance.execute.mockResolvedValue({ 
        isSuccess: true, 
        response,
        status: 'success'
      });

    it('bondScale should return true on success', async () => {
        setupSuccess({ opcode: BoksOpcode.NOTIFY_SCALE_BONDING_SUCCESS });
        expect(await controller.bondScale()).toBe(true);
    });

    it('getScaleWeight should return weight', async () => {
        setupSuccess({ opcode: BoksOpcode.NOTIFY_SCALE_MEASURE_WEIGHT, weight: 1234 });
        expect(await controller.getScaleWeight()).toBe(1234);
    });

    it('tareScale should return true', async () => {
        setupSuccess({ opcode: BoksOpcode.NOTIFY_SCALE_TARE_EMPTY_OK });
        expect(await controller.tareScale(true)).toBe(true);
    });

    it('forgetScale should return true', async () => {
        setupSuccess({ opcode: BoksOpcode.NOTIFY_SCALE_BONDING_FORGET_SUCCESS });
        expect(await controller.forgetScale()).toBe(true);
    });
  });
});
