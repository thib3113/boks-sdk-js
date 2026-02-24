import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BoksClient } from '@/client/BoksClient';
import { BoksTransport } from '@/client/transport';
import { BoksOpcode, BoksPacket } from '@/protocol';
import { BoksTransactionStatus } from '@/client/BoksTransaction';

// Mock Transport
class MockTransport implements BoksTransport {
  connect = vi.fn().mockResolvedValue(undefined);
  disconnect = vi.fn().mockResolvedValue(undefined);
  write = vi.fn().mockResolvedValue(undefined);
  read = vi.fn().mockResolvedValue(new Uint8Array(0));
  subscribe = vi.fn().mockImplementation((cb) => {
    this.callback = cb;
    return Promise.resolve();
  });
  subscribeTo = vi.fn().mockResolvedValue(undefined);

  public callback: ((data: Uint8Array) => void) | null = null;

  emit(data: Uint8Array) {
    if (this.callback) {
      this.callback(data);
    }
  }
}

// Mock Packet
class MockPacket extends BoksPacket {
  constructor(public opcode: BoksOpcode, private payload: Uint8Array = new Uint8Array(0)) {
    super();
  }
  toPayload() { return this.payload; }
  // Override encode to bypass checksum calculation in tests if needed,
  // but base class implementation works if checksum logic is pure.
  // For simplicity, we assume base encode works.
}

// Mock Factory
vi.mock('@/protocol/BoksPacketFactory', () => ({
  BoksPacketFactory: {
    createFromPayload: (data: Uint8Array) => {
      return {
        opcode: data[0],
        encode: () => data
      };
    }
  }
}));

describe('BoksClient Transaction', () => {
  let transport: MockTransport;
  let client: BoksClient;

  beforeEach(async () => {
    vi.useFakeTimers();
    transport = new MockTransport();
    client = new BoksClient({ transport });
    await client.connect();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should execute a simple transaction', async () => {
    const req = new MockPacket(BoksOpcode.OPEN_DOOR);
    const resData = new Uint8Array([BoksOpcode.VALID_OPEN_CODE, 0, 0]); // Opcode, Len, Checksum

    const promise = client.execute(req, { successOpcodes: [BoksOpcode.VALID_OPEN_CODE] });

    // Simulate response
    await Promise.resolve(); // Allow write to complete
    transport.emit(resData);

    const tx = await promise;
    expect(tx.status).toBe(BoksTransactionStatus.Success);
    expect(tx.response?.opcode).toBe(BoksOpcode.VALID_OPEN_CODE);
    expect(transport.write).toHaveBeenCalled();
  });

  it('should timeout if no response', async () => {
    const req = new MockPacket(BoksOpcode.OPEN_DOOR);

    const promise = client.execute(req, {
      successOpcodes: [BoksOpcode.VALID_OPEN_CODE],
      timeout: 50
    });

    // Wait for microtasks to ensure setTimeout is called inside execute
    await Promise.resolve();
    await Promise.resolve();

    vi.advanceTimersByTime(100);

    await expect(promise).rejects.toThrow(/timed out/);
  });

  it('should collect intermediates', async () => {
    const req = new MockPacket(BoksOpcode.REQUEST_LOGS);
    const logData = new Uint8Array([BoksOpcode.LOG_DOOR_OPEN, 0, 0]);
    const endData = new Uint8Array([BoksOpcode.LOG_END_HISTORY, 0, 0]);

    const promise = client.execute(req, {
      successOpcodes: [BoksOpcode.LOG_END_HISTORY]
    });

    await Promise.resolve();
    transport.emit(logData);
    transport.emit(endData);

    const tx = await promise;
    expect(tx.intermediates).toHaveLength(1);
    expect(tx.intermediates[0].opcode).toBe(BoksOpcode.LOG_DOOR_OPEN);
    expect(tx.response?.opcode).toBe(BoksOpcode.LOG_END_HISTORY);
  });

  it('should queue transactions', async () => {
    const req1 = new MockPacket(BoksOpcode.OPEN_DOOR);
    const req2 = new MockPacket(BoksOpcode.REBOOT);
    const res1 = new Uint8Array([BoksOpcode.VALID_OPEN_CODE, 0, 0]);
    const res2 = new Uint8Array([BoksOpcode.CODE_OPERATION_SUCCESS, 0, 0]);

    // Start first tx
    const p1 = client.execute(req1, { successOpcodes: [BoksOpcode.VALID_OPEN_CODE] });

    // Start second tx immediately
    const p2 = client.execute(req2, { successOpcodes: [BoksOpcode.CODE_OPERATION_SUCCESS] });

    await Promise.resolve();
    // First tx should have written
    expect(transport.write).toHaveBeenCalledTimes(1);

    // Complete first tx
    transport.emit(res1);
    await p1;

    // Now second tx should write
    // Need to wait for microtasks?
    await Promise.resolve();
    await Promise.resolve();

    // Since we are mocking transport.write as resolved promise, the queue proceeds.
    // However, execute waits for response before resolving the queue promise?
    // Let's check BoksClient implementation.
    // this.commandQueue = nextTask.catch(...)
    // nextTask awaits promise (the response listener).
    // So p2 cannot start until p1 resolves.

    // Wait, p1 resolves when transport emits res1.
    // So transport.write should be called 2nd time only after p1 resolves.

    // We emitted res1. p1 should resolve.
    // The chain continues.

    // We need to wait enough ticks.
    await vi.waitFor(() => {
        expect(transport.write).toHaveBeenCalledTimes(2);
    });

    // Complete second tx
    transport.emit(res2);
    await p2;
  });
});
