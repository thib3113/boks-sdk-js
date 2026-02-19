import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BoksController } from '@/client/BoksController';
import { BoksClient } from '@/client/BoksClient';
import { BoksTransport } from '@/client/transport';
import { BoksOpcode, BOKS_UUIDS } from '@/protocol';
import { calculateChecksum } from '@/utils/converters';
// Mock Transport Implementation
class MockTransport implements BoksTransport {
  public writes: Uint8Array[] = [];
  public subscriber: ((data: Uint8Array) => void) | null = null;
  public mockReads: Record<string, Uint8Array> = {};

  async connect() {
    return Promise.resolve();
  }

  async disconnect() {
    return Promise.resolve();
  }

  async write(data: Uint8Array) {
    this.writes.push(data);
    return Promise.resolve();
  }

  async read(uuid: string): Promise<Uint8Array> {
    return Promise.resolve(this.mockReads[uuid] || new Uint8Array([]));
  }

  async subscribe(callback: (data: Uint8Array) => void) {
    this.subscriber = callback;
    return Promise.resolve();
  }

  /**
   * Helper to simulate receiving a packet from the device.
   */
  emit(opcode: number, payload: Uint8Array | number[] = []) {
    if (!this.subscriber) return;

    const payloadBytes = payload instanceof Uint8Array ? payload : new Uint8Array(payload);
    const length = payloadBytes.length;
    // Frame: [Opcode, Length, ...Payload, Checksum]
    const packet = new Uint8Array(2 + length + 1);
    packet[0] = opcode;
    packet[1] = length;
    packet.set(payloadBytes, 2);

    // Checksum over [Opcode, Length, ...Payload]
    packet[packet.length - 1] = calculateChecksum(packet.subarray(0, packet.length - 1));

    this.subscriber(packet);
  }
}

describe('BoksController', () => {
  let transport: MockTransport;
  let client: BoksClient;
  let controller: BoksController;

  beforeEach(async () => {
    transport = new MockTransport();
    client = new BoksClient({
      transport,
      logger: (level, event, context) => {
        if (level === 'error' || level === 'warn') {
            console.error(`[BoksClient] ${level} ${event}`, context);
        }
      }
    });
    controller = new BoksController(client);

    // Set credentials for all tests
    controller.setCredentials('0000000000000000000000000000000000000000000000000000000000000000');

    // Setup default mock reads for versioning
    const textEncoder = new TextEncoder();
    transport.mockReads[BOKS_UUIDS.SOFTWARE_REVISION] = textEncoder.encode('4.5.0\0');
    transport.mockReads[BOKS_UUIDS.FIRMWARE_REVISION] = textEncoder.encode('10/125\0');

    // Connect automatically
    await controller.connect();
    // Clear writes that happened during connect (if any) to keep tests clean
    transport.writes = [];
  });

  // Helper to ensure async operations have progressed
  const tick = () => new Promise((resolve) => setTimeout(resolve, 500));

  // Valid PIN (6 chars 0-9,A,B)
  const PIN = '123456';

  it('should have correct hardware info', () => {
    expect(controller.hardwareInfo).toEqual({
      firmwareRevision: '10/125',
      softwareRevision: '4.5.0',
      hardwareVersion: '4.0',
      chipset: 'nRF52833'
    });
  });

  it('should scan NFC tags', async () => {
    const promise = controller.scanNFCTags();
    await tick();

    expect(transport.writes.length).toBe(1);
    expect(transport.writes[0][0]).toBe(BoksOpcode.REGISTER_NFC_TAG_SCAN_START);

    transport.emit(BoksOpcode.NOTIFY_NFC_TAG_FOUND, [0x04, 0xDE, 0xAD, 0xBE, 0xEF]);

    const result = await promise;
    expect(result.opcode).toBe(BoksOpcode.NOTIFY_NFC_TAG_FOUND);
  });

  it('should register NFC tag', async () => {
    const tagId = '01:02:03:04';
    const promise = controller.registerNfcTag(tagId);
    await tick();

    expect(transport.writes.length).toBe(1);
    expect(transport.writes[0][0]).toBe(BoksOpcode.REGISTER_NFC_TAG);
    transport.emit(BoksOpcode.NOTIFY_NFC_TAG_REGISTERED);

    const result = await promise;
    expect(result).toBe(true);
  });

  it('should unregister NFC tag', async () => {
    const tagId = '01:02:03:04';
    const promise = controller.unregisterNfcTag(tagId);
    await tick();

    expect(transport.writes.length).toBe(1);
    expect(transport.writes[0][0]).toBe(BoksOpcode.UNREGISTER_NFC_TAG);
    transport.emit(BoksOpcode.NOTIFY_NFC_TAG_UNREGISTERED);

    const result = await promise;
    expect(result).toBe(true);
  });

  it('should open door successfully', async () => {
    const promise = controller.openDoor(PIN);
    await tick();

    expect(transport.writes[0][0]).toBe(BoksOpcode.OPEN_DOOR);
    transport.emit(BoksOpcode.VALID_OPEN_CODE);

    const result = await promise;
    expect(result).toBe(true);
  });

  it('should fail to open door with invalid code', async () => {
    const promise = controller.openDoor(PIN);
    await tick();
    transport.emit(BoksOpcode.INVALID_OPEN_CODE);
    const result = await promise;
    expect(result).toBe(false);
  });

  it('should get door status', async () => {
    const promise = controller.getDoorStatus();
    await tick();
    expect(transport.writes[0][0]).toBe(BoksOpcode.ASK_DOOR_STATUS);
    transport.emit(BoksOpcode.NOTIFY_DOOR_STATUS, [0x00, 0x01]);
    const isOpen = await promise;
    expect(isOpen).toBe(true);
  });

  it('should get logs count', async () => {
    const promise = controller.getLogsCount();
    await tick();
    expect(transport.writes[0][0]).toBe(BoksOpcode.GET_LOGS_COUNT);
    transport.emit(BoksOpcode.NOTIFY_LOGS_COUNT, [0x00, 0x05]);
    const count = await promise;
    expect(count).toBe(5);
  });

  it('should test battery', async () => {
    await controller.testBattery();
    expect(transport.writes[0][0]).toBe(BoksOpcode.TEST_BATTERY);
  });

  it('should reboot', async () => {
    await controller.reboot();
    expect(transport.writes[0][0]).toBe(BoksOpcode.REBOOT);
  });

  it('should fetch history', async () => {
    const promise = controller.fetchHistory();
    await tick();
    expect(transport.writes[0][0]).toBe(BoksOpcode.REQUEST_LOGS);
    transport.emit(BoksOpcode.LOG_DOOR_OPEN, [0x00, 0x00, 0x00, 0x01]);
    transport.emit(BoksOpcode.LOG_END_HISTORY);
    const events = await promise;
    expect(events.length).toBe(1);
    expect(events[0].opcode).toBe(BoksOpcode.LOG_DOOR_OPEN);
  });

  it('should create master code', async () => {
    const promise = controller.createMasterCode(1, PIN);
    await tick();
    expect(transport.writes[0][0]).toBe(BoksOpcode.CREATE_MASTER_CODE);
    transport.emit(BoksOpcode.CODE_OPERATION_SUCCESS);
    expect(await promise).toBe(true);
  });

  it('should create single use code', async () => {
    const promise = controller.createSingleUseCode(PIN);
    await tick();
    expect(transport.writes[0][0]).toBe(BoksOpcode.CREATE_SINGLE_USE_CODE);
    transport.emit(BoksOpcode.CODE_OPERATION_SUCCESS);
    expect(await promise).toBe(true);
  });

  it('should create multi use code', async () => {
    const promise = controller.createMultiUseCode(PIN);
    await tick();
    expect(transport.writes[0][0]).toBe(BoksOpcode.CREATE_MULTI_USE_CODE);
    transport.emit(BoksOpcode.CODE_OPERATION_SUCCESS);
    expect(await promise).toBe(true);
  });

  it('should delete master code', async () => {
    const promise = controller.deleteMasterCode(1);
    await tick();
    expect(transport.writes[0][0]).toBe(BoksOpcode.DELETE_MASTER_CODE);
    transport.emit(BoksOpcode.CODE_OPERATION_SUCCESS);
    expect(await promise).toBe(true);
  });

  it('should delete single use code', async () => {
    const promise = controller.deleteSingleUseCode(PIN);
    await tick();
    expect(transport.writes[0][0]).toBe(BoksOpcode.DELETE_SINGLE_USE_CODE);
    transport.emit(BoksOpcode.CODE_OPERATION_SUCCESS);
    expect(await promise).toBe(true);
  });

  it('should delete multi use code', async () => {
    const promise = controller.deleteMultiUseCode(PIN);
    await tick();
    expect(transport.writes[0][0]).toBe(BoksOpcode.DELETE_MULTI_USE_CODE);
    transport.emit(BoksOpcode.CODE_OPERATION_SUCCESS);
    expect(await promise).toBe(true);
  });

  it('should regenerate master key with progress', async () => {
    const newMasterKey = new Uint8Array(32).fill(0xAA);
    const onProgress = vi.fn();
    const promise = controller.regenerateMasterKey(newMasterKey, onProgress);
    await tick();
    await tick();
    expect(transport.writes.length).toBe(2);
    expect(transport.writes[0][0]).toBe(BoksOpcode.RE_GENERATE_CODES_PART1);
    expect(transport.writes[1][0]).toBe(BoksOpcode.RE_GENERATE_CODES_PART2);
    transport.emit(BoksOpcode.NOTIFY_CODE_GENERATION_PROGRESS, [50]);
    expect(onProgress).toHaveBeenCalledWith(50);
    transport.emit(BoksOpcode.NOTIFY_CODE_GENERATION_SUCCESS);
    const success = await promise;
    expect(success).toBe(true);
  });
});
