import { describe, it, expect, vi } from 'vitest';
import { fetchBatteryLevel, fetchBatteryStats, parseBatteryLevel, parseBatteryStats } from '@/utils/battery';
import { BoksTransport } from '@/client/transport';
import { BOKS_UUIDS } from '@/protocol/constants';

describe('Battery Utilities', () => {
  const mockTransport: BoksTransport = {
    connect: vi.fn(),
    disconnect: vi.fn(),
    write: vi.fn(),
    read: vi.fn(),
    subscribe: vi.fn(),
    subscribeTo: vi.fn(),
  };

  describe('fetchBatteryLevel', () => {
    it('should fetch and parse battery level successfully', async () => {
      vi.mocked(mockTransport.read).mockResolvedValueOnce(new Uint8Array([85]));
      const level = await fetchBatteryLevel(mockTransport);
      expect(mockTransport.read).toHaveBeenCalledWith(BOKS_UUIDS.BATTERY_LEVEL);
      expect(level).toBe(85);
    });

    it('should return undefined if transport read fails', async () => {
      vi.mocked(mockTransport.read).mockRejectedValueOnce(new Error('Read error'));
      const level = await fetchBatteryLevel(mockTransport);
      expect(level).toBeUndefined();
    });
  });

  describe('fetchBatteryStats', () => {
    it('should fetch and parse battery stats successfully', async () => {
      vi.mocked(mockTransport.read).mockResolvedValueOnce(new Uint8Array([90, 80, 85, 95, 88, 50]));
      const stats = await fetchBatteryStats(mockTransport);
      expect(mockTransport.read).toHaveBeenCalledWith(BOKS_UUIDS.CUSTOM_BATTERY);
      expect(stats?.level).toBe(85);
    });

    it('should return undefined if transport read fails', async () => {
      vi.mocked(mockTransport.read).mockRejectedValueOnce(new Error('Read error'));
      const stats = await fetchBatteryStats(mockTransport);
      expect(stats).toBeUndefined();
    });
  });

  describe('parseBatteryLevel', () => {
    it('should parse a valid battery level', () => {
      const payload = new Uint8Array([85]);
      expect(parseBatteryLevel(payload)).toBe(85);
    });

    it('should return undefined for 0xFF (invalid/unreliable)', () => {
      const payload = new Uint8Array([0xff]);
      expect(parseBatteryLevel(payload)).toBeUndefined();
    });

    it('should return undefined for empty or missing payload', () => {
      expect(parseBatteryLevel(new Uint8Array([]))).toBeUndefined();
      expect(parseBatteryLevel(undefined)).toBeUndefined();
    });
  });

  describe('parseBatteryStats', () => {
    it('should parse 6-byte format correctly', () => {
      // [first, min, mean, max, last, temp]
      // Temp: 50 -> 50 - 25 = 25°C
      const payload = new Uint8Array([90, 80, 85, 95, 88, 50]);
      const stats = parseBatteryStats(payload);

      expect(stats).toBeDefined();
      expect(stats?.format).toBe('measures-first-min-mean-max-last');
      expect(stats?.level).toBe(85); // mean
      expect(stats?.temperature).toBe(25);
      expect(stats?.details).toEqual({
        first: 90,
        min: 80,
        mean: 85,
        max: 95,
        last: 88,
      });
    });

    it('should parse 4-byte format correctly', () => {
      // [t1, t5, t10, temp]
      // Temp: 45 -> 45 - 25 = 20°C
      const payload = new Uint8Array([85, 82, 80, 45]);
      const stats = parseBatteryStats(payload);

      expect(stats).toBeDefined();
      expect(stats?.format).toBe('measures-t1-t5-t10');
      expect(stats?.level).toBe(85); // t1
      expect(stats?.temperature).toBe(20);
      expect(stats?.details).toEqual({
        t1: 85,
        t5: 82,
        t10: 80,
      });
    });

    it('should handle optional 0xFF in 4-byte format', () => {
      const payload = new Uint8Array([85, 0xff, 0xff, 0xff]);
      const stats = parseBatteryStats(payload);

      expect(stats?.details?.t5).toBeUndefined();
      expect(stats?.details?.t10).toBeUndefined();
      expect(stats?.temperature).toBeUndefined();
    });

    it('should return undefined for all 0xFF payload', () => {
      const payload = new Uint8Array([0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);
      expect(parseBatteryStats(payload)).toBeUndefined();
    });

    it('should return undefined for invalid lengths', () => {
      expect(parseBatteryStats(new Uint8Array([1, 2]))).toBeUndefined();
      expect(parseBatteryStats(new Uint8Array([1, 2, 3, 4, 5]))).toBeUndefined();
    });

    it('should return undefined for empty or missing payload', () => {
      expect(parseBatteryStats(new Uint8Array([]))).toBeUndefined();
      expect(parseBatteryStats(undefined)).toBeUndefined();
    });
  });
});
