import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BoksClient } from '@/client/BoksClient';
import { BoksTransport } from '@/client/transport';
import {
  BoksOpcode,
  DoorOpenHistoryPacket
} from '@/protocol';
import { BoksClientErrorId } from '@/errors/BoksClientError';
import { calculateChecksum } from '@/utils/converters';

describe('BoksClient fetchHistory', () => {
  let client: BoksClient;
  let mockTransport: BoksTransport;
  let notificationCallback: ((data: Uint8Array) => void) | undefined;

  // Helper to create valid packet buffer
  const createPacketBuffer = (opcode: number, payload: Uint8Array = new Uint8Array(0)): Uint8Array => {
    const buffer = new Uint8Array(payload.length + 3);
    buffer[0] = opcode;
    buffer[1] = payload.length;
    buffer.set(payload, 2);
    buffer[buffer.length - 1] = calculateChecksum(buffer.subarray(0, buffer.length - 1));
    return buffer;
  };

  beforeEach(() => {
    notificationCallback = undefined;
    mockTransport = {
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
      write: vi.fn().mockResolvedValue(undefined),
      read: vi.fn().mockResolvedValue(new Uint8Array()),
      subscribe: vi.fn().mockImplementation((cb) => {
        notificationCallback = cb;
        return Promise.resolve();
      }),
    };

    client = new BoksClient({ transport: mockTransport });
  });

  it('should request logs and accumulate history events until end packet', async () => {
    await client.connect();
    expect(mockTransport.subscribe).toHaveBeenCalled();
    expect(notificationCallback).toBeDefined();

    const historyPromise = client.fetchHistory(1000);

    // Wait for the async send operation (command queue) to process
    await new Promise(resolve => setTimeout(resolve, 0));

    // Verify RequestLogsPacket was sent (0x03)
    expect(mockTransport.write).toHaveBeenCalled();

    // Simulate incoming history packets
    // 1. Door Open Event (0x91) - Age 0x000102 (258)
    const agePayload1 = new Uint8Array([0x00, 0x01, 0x02]);
    const packet1 = createPacketBuffer(BoksOpcode.LOG_DOOR_OPEN, agePayload1);
    notificationCallback!(packet1);

    // 2. Another event (0x91) - Age 0x000203 (515)
    const agePayload2 = new Uint8Array([0x00, 0x02, 0x03]);
    const packet2 = createPacketBuffer(BoksOpcode.LOG_DOOR_OPEN, agePayload2);
    notificationCallback!(packet2);

    // 3. End History Packet (0x92)
    const endPacket = createPacketBuffer(BoksOpcode.LOG_END_HISTORY);
    notificationCallback!(endPacket);

    const events = await historyPromise;

    const now = Date.now();
    expect(events).toHaveLength(2);
    expect(events[0]).toBeInstanceOf(DoorOpenHistoryPacket);
    expect(events[0].age).toBe(258);
    // Verify date calculation (allow 1000ms tolerance for execution time)
    expect(Math.abs(events[0].date.getTime() - (now - 258 * 1000))).toBeLessThan(1000);

    expect(events[1]).toBeInstanceOf(DoorOpenHistoryPacket);
    expect(events[1].age).toBe(515);
    expect(Math.abs(events[1].date.getTime() - (now - 515 * 1000))).toBeLessThan(1000);
  });

  it('should timeout if end packet is not received', async () => {
    vi.useFakeTimers();
    await client.connect();

    const historyPromise = client.fetchHistory(100);

    // Create the assertion promise immediately to catch rejection
    const assertion = expect(historyPromise).rejects.toThrowError(expect.objectContaining({ id: BoksClientErrorId.TIMEOUT }));

    // Wait for send to likely happen
    await vi.advanceTimersByTimeAsync(1);

    // Send one event to make sure timer resets logic is triggered
    const agePayload1 = new Uint8Array([0x00, 0x00, 0x01]);
    const packet1 = createPacketBuffer(BoksOpcode.LOG_DOOR_OPEN, agePayload1);
    notificationCallback!(packet1);

    // Advance time past timeout (fetchHistory multiplies timeout by 10)
    await vi.advanceTimersByTimeAsync(1100);

    // Now wait for the assertion to resolve
    await assertion;
    vi.useRealTimers();
  });
});
