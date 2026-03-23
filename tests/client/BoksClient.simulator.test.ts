import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BoksClient } from '@/client/BoksClient';
import { BoksHardwareSimulator } from '@/simulator/BoksSimulator';
import { SimulatorTransport } from '@/simulator/SimulatorTransport';
import { BOKS_UUIDS } from '@/protocol/constants';

describe('BoksClient with Simulator', () => {
  let simulator: BoksHardwareSimulator;
  let transport: SimulatorTransport;
  let client: BoksClient;

  beforeEach(async () => {
    simulator = new BoksHardwareSimulator();
    transport = new SimulatorTransport(simulator);
    client = new BoksClient({ transport });
    await client.connect();
  });

  afterEach(async () => {
    await client.disconnect();
  });

  it('should fetch battery level from simulator', async () => {
    const battery = await client.getBatteryLevel();
    expect(battery).toBeGreaterThanOrEqual(0);
    expect(battery).toBeLessThanOrEqual(100);
  });

  it('should fetch battery stats', async () => {
    const stats = await client.getBatteryStats();
    expect(stats).toBeDefined();
    expect(stats?.temperature).toBe(25);
  });

  it('should read characteristic directly', async () => {
    const swRev = await client.readCharacteristic(BOKS_UUIDS.SOFTWARE_REVISION);
    expect(swRev.length).toBeGreaterThan(0);
  });

  it('should gracefully handle invalid packets triggering BoksClientError in handleNotification', async () => {
    const invalidPayload = new Uint8Array([0xff, 0x01, 0x02, 0x03]); // Completely arbitrary bad payload

    const loggerMock = vi.fn();
    // @ts-expect-error accessing private
    client.logger = loggerMock;

    let didThrow = false;
    try {
      // @ts-expect-error - calling private method
      client.handleNotification(invalidPayload);
    } catch (e) {
      didThrow = true;
    }

    expect(didThrow).toBe(false);
    expect(loggerMock).toHaveBeenCalledWith('warn', 'checksum_error', expect.any(Object));
  });
});
