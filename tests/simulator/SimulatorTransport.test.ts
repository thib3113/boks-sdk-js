import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SimulatorTransport } from '../../src/simulator/SimulatorTransport';
import { BoksHardwareSimulator } from '../../src/simulator/BoksSimulator';
import { EMPTY_BUFFER } from '../../src/protocol/constants';
import { stringToBytes } from '../../src/utils/converters';

describe('SimulatorTransport', () => {
  let simulator: BoksHardwareSimulator;
  let transport: SimulatorTransport;

  beforeEach(() => {
    simulator = new BoksHardwareSimulator();
    transport = new SimulatorTransport(simulator);
  });

  it('should connect (no-op)', async () => {
    await expect(transport.connect()).resolves.toBeUndefined();
  });

  it('should disconnect and clean up subscriptions', async () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    const batteryCallback = vi.fn();

    const unsubscribeSpy = vi.spyOn(simulator, 'unsubscribe');
    const unsubscribeToBatterySpy = vi.spyOn(simulator, 'unsubscribeToBattery');

    await transport.subscribe(callback1);
    await transport.subscribe(callback2);
    await transport.subscribeTo('00002a19-0000-1000-8000-00805f9b34fb', batteryCallback);

    await transport.disconnect();

    expect(unsubscribeSpy).toHaveBeenCalledWith(callback1);
    expect(unsubscribeSpy).toHaveBeenCalledWith(callback2);
    expect(unsubscribeToBatterySpy).toHaveBeenCalledWith(batteryCallback);

    // Call disconnect again to ensure it doesn't throw and Sets are empty
    unsubscribeSpy.mockClear();
    unsubscribeToBatterySpy.mockClear();
    await transport.disconnect();
    expect(unsubscribeSpy).not.toHaveBeenCalled();
    expect(unsubscribeToBatterySpy).not.toHaveBeenCalled();
  });

  it('should write data to simulator', async () => {
    const handlePacketSpy = vi.spyOn(simulator, 'handlePacket');
    const data = new Uint8Array([1, 2, 3]);
    await transport.write(data);
    expect(handlePacketSpy).toHaveBeenCalledWith(data);
  });

  it('should read battery level (0x2A19)', async () => {
    simulator.setBatteryLevel(85);
    const data = await transport.read('00002a19-0000-1000-8000-00805f9b34fb');
    expect(data).toEqual(new Uint8Array([85]));
  });

  it('should read battery level uppercase (0x2A19)', async () => {
    simulator.setBatteryLevel(85);
    const data = await transport.read('00002A19-0000-1000-8000-00805f9b34fb');
    expect(data).toEqual(new Uint8Array([85]));
  });

  it('should read software revision (0x2A28)', async () => {
    const state = simulator.getPublicState();
    const data = await transport.read('00002a28-0000-1000-8000-00805f9b34fb');
    expect(data).toEqual(stringToBytes(state.softwareVersion));
  });

  it('should read software revision uppercase (0x2A28)', async () => {
    const state = simulator.getPublicState();
    const data = await transport.read('00002A28-0000-1000-8000-00805f9b34fb');
    expect(data).toEqual(stringToBytes(state.softwareVersion));
  });

  it('should read firmware revision (0x2A26)', async () => {
    const state = simulator.getPublicState();
    const data = await transport.read('00002a26-0000-1000-8000-00805f9b34fb');
    expect(data).toEqual(stringToBytes(state.firmwareVersion));
  });

  it('should read firmware revision uppercase (0x2A26)', async () => {
    const state = simulator.getPublicState();
    const data = await transport.read('00002A26-0000-1000-8000-00805f9b34fb');
    expect(data).toEqual(stringToBytes(state.firmwareVersion));
  });

  it('should return empty buffer for unknown uuid read', async () => {
    const data = await transport.read('00001234-0000-1000-8000-00805f9b34fb');
    expect(data).toEqual(EMPTY_BUFFER);
  });

  it('should subscribe and forward to simulator', async () => {
    const callback = vi.fn();
    const subscribeSpy = vi.spyOn(simulator, 'subscribe');
    await transport.subscribe(callback);
    expect(subscribeSpy).toHaveBeenCalledWith(callback);
  });

  it('should subscribe to battery if uuid matches', async () => {
    const callback = vi.fn();
    const subscribeToBatterySpy = vi.spyOn(simulator, 'subscribeToBattery');
    await transport.subscribeTo('00002a19-0000-1000-8000-00805f9b34fb', callback);
    expect(subscribeToBatterySpy).toHaveBeenCalledWith(callback);
  });

  it('should subscribe to battery if uuid matches uppercase', async () => {
    const callback = vi.fn();
    const subscribeToBatterySpy = vi.spyOn(simulator, 'subscribeToBattery');
    await transport.subscribeTo('00002A19-0000-1000-8000-00805f9b34fb', callback);
    expect(subscribeToBatterySpy).toHaveBeenCalledWith(callback);
  });

  it('should ignore subscribeTo if uuid does not match battery', async () => {
    const callback = vi.fn();
    const subscribeToBatterySpy = vi.spyOn(simulator, 'subscribeToBattery');
    await transport.subscribeTo('00001234-0000-1000-8000-00805f9b34fb', callback);
    expect(subscribeToBatterySpy).not.toHaveBeenCalled();
  });
});
