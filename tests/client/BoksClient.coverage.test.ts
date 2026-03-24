import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BoksClient } from '@/client/BoksClient';
import { BoksTransport } from '@/client/transport';
import { BoksOpcode, BoksPacket } from '@/protocol';

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

class MockPacket extends BoksPacket {
  constructor(
    public opcode: BoksOpcode,
    private mockPayload: Uint8Array = new Uint8Array(0)
  ) {
    super();
  }
  toPayload() {
    return this.mockPayload;
  }
}

describe('BoksClient Coverage', () => {
  let transport: MockTransport;
  let client: BoksClient;
  let loggerMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    transport = new MockTransport();
    loggerMock = vi.fn();
    client = new BoksClient({ transport, logger: loggerMock as any });
    await client.connect();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should log an error if packet handling throws an unexpected error', async () => {
    // To hit the `catch` block in `handleNotification`, we can throw from a registered listener.
    // Wait, the listener try-catch has its own log ('error', 'listener_error').
    // The outer try-catch is around `BoksPacketFactory.createFromPayload`.
    // Instead of mocking the factory directly, let's emit something that causes the factory to throw.
    // Normally, factory returns null or throws BoksProtocolError.
    // We just need ANY error to be thrown. Can we pass null or undefined to it?
    // Let's pass a custom object that throws when its property is accessed, mimicking `Uint8Array`.
    const badData = {
      get length() {
        throw new Error('Unexpected parsing error');
      }
    } as any;

    transport.emit(badData);

    expect(loggerMock).toHaveBeenCalledWith('error', 'error', {
      error: expect.any(Error)
    });
    const errorArg = loggerMock.mock.calls.find((call) => call[1] === 'error')?.[2].error;
    expect(errorArg.message).toBe('Unexpected parsing error');
  });

  it('should reject transaction if context reject is called manually', async () => {
    const req = new MockPacket(BoksOpcode.OPEN_DOOR);

    // Start execute, but don't await it yet
    const promise = client.execute(req, { successOpcodes: [BoksOpcode.VALID_OPEN_CODE] });

    // Wait a microtask so execute sets up the context
    await Promise.resolve();

    // Access the private context and force reject
    const context = (client as any).currentTransactionContext;
    expect(context).toBeDefined();

    context.reject(new Error('Manual context rejection test'));

    await expect(promise).rejects.toThrow('Manual context rejection test');
  });
});
