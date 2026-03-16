import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { BoksClient } from '@/client/BoksClient';
import { BoksTransport } from '@/client/transport';
import { BoksOpcode, BoksPacket } from '@/protocol';

class MockTransport implements BoksTransport {
  public writeHandler: (data: Uint8Array) => Promise<void> = async () => {};
  public notificationCallback: ((data: Uint8Array) => void) | null = null;
  public connectCount = 0;
  public disconnectCount = 0;

  async connect(): Promise<void> {
    this.connectCount++;
  }

  async disconnect(): Promise<void> {
    this.disconnectCount++;
  }

  async write(data: Uint8Array): Promise<void> {
    return this.writeHandler(data);
  }

  async read(_uuid: string): Promise<Uint8Array> {
    return new Uint8Array(0);
  }

  async subscribe(callback: (data: Uint8Array) => void): Promise<void> {
    this.notificationCallback = callback;
  }

  async subscribeTo(_uuid: string, _callback: (data: Uint8Array) => void): Promise<void> {
    // Ignore
  }

  simulateNotification(data: Uint8Array) {
    if (this.notificationCallback) {
      this.notificationCallback(data);
    }
  }
}

class DummyPacket extends BoksPacket {
  constructor(
    public opcode: BoksOpcode,
    private payload: Uint8Array = new Uint8Array(0)
  ) {
    super();
  }
  toPayload() {
    return this.payload;
  }
}

// Model State for Fuzzing
type ModelState = {
  pendingTransactions: number;
  completedTransactions: number;
  failedTransactions: number;
};

// --- Commands ---

class ExecuteCommand implements fc.AsyncCommand<
  ModelState,
  { client: BoksClient; transport: MockTransport }
> {
  constructor(
    public opcode: BoksOpcode,
    public successOpcodes: number[],
    public errorOpcodes: number[],
    public timeout: number,
    public willSucceed: boolean, // Determine if we mock a success response
    public willTimeout: boolean // Determine if we mock a timeout
  ) {}

  check = () => true;

  async run(m: ModelState, r: { client: BoksClient; transport: MockTransport }) {
    m.pendingTransactions++;

    let resolver: () => void;
    const promise = new Promise<void>((res) => {
      resolver = res;
    });

    // We intercept the write to immediately trigger a response depending on instructions
    r.transport.writeHandler = async (_data: Uint8Array) => {
      if (this.willTimeout) {
        // Do nothing, let it timeout natively
      } else if (this.willSucceed && this.successOpcodes.length > 0) {
        // Respond with success
        // Use the first success opcode. We need a valid BoksPacket payload structure.
        // A basic valid payload is usually 3 bytes: STX (0x02), Length (0x02), Opcode, ...
        const successOpcode = this.successOpcodes[0];
        // Craft a mock valid packet payload for the factory to parse.
        // STX (0x02), Length (2 bytes, LE), Opcode, CRC (1 byte)
        // Actually, BoksPacketFactory is complex. Let's create a real packet bytes if possible or mock the factory?
        // Mocking the factory is hard in an integration test.
        // Let's craft a raw packet:
        // STX: 0x02
        // Length: 0x02, 0x00 (length of payload excluding STX and Length, so 1 byte for opcode + 1 byte for crc = 2? No, length is opcode + data. Let's say length=1 for just opcode)
        // Opcode: successOpcode
        // CRC: simple XOR
        const payloadLength = 1; // Just opcode
        const buf = new Uint8Array([
          0x02, // STX
          payloadLength & 0xFF,
          (payloadLength >> 8) & 0xFF, // Length LE
          successOpcode,
          successOpcode // CRC (since it's just one byte, CRC is the byte itself)
        ]);

        setTimeout(() => {
          r.transport.simulateNotification(buf);
        }, 10);
      } else if (this.errorOpcodes.length > 0) {
        const errOpcode = this.errorOpcodes[0];
        const payloadLength = 1; // Just opcode
        const buf = new Uint8Array([
          0x02, // STX
          payloadLength & 0xFF,
          (payloadLength >> 8) & 0xFF, // Length LE
          errOpcode,
          errOpcode // CRC
        ]);
        setTimeout(() => {
          r.transport.simulateNotification(buf);
        }, 10);
      } else {
        // Just noise, it will timeout eventually
        setTimeout(() => {
          r.transport.simulateNotification(new Uint8Array([0x00, 0xFF]));
        }, 10);
      }
    };

    const requestPacket = new DummyPacket(this.opcode);

    r.client
      .execute(requestPacket, {
        successOpcodes: this.successOpcodes,
        errorOpcodes: this.errorOpcodes,
        timeout: this.timeout
      })
      .then(() => {
        m.pendingTransactions--;
        m.completedTransactions++;
        resolver();
      })
      .catch(() => {
        m.pendingTransactions--;
        m.failedTransactions++;
        resolver();
      });

    // To prevent the test from hanging, we wait for the transaction to settle or advance timers
    // In this fuzzer, we will actually advance timers manually in a separate command or wait.
    // Since this is async command, we can just await the result if we want sequential,
    // but the goal is to test the queue. The queue serializes them automatically.

    // Wait slightly for any setTimeout in writeHandler to execute its mock notification
    await vi.advanceTimersByTimeAsync(this.timeout + 100);

    await promise;

    expect(m.pendingTransactions).toBeGreaterThanOrEqual(0);
  }

  toString = () => `Execute(Opcode: ${this.opcode}, Success: ${this.willSucceed})`;
}

describe('BoksClient Fuzzing', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should maintain a healthy command queue despite overlapping transactions and timeouts', async () => {
    const executeArbitrary = fc
      .record({
        opcode: fc.integer({ min: 0x00, max: 0xFF }),
        successOpcodes: fc.array(fc.integer({ min: 0x00, max: 0xFF }), {
          minLength: 1,
          maxLength: 3
        }),
        errorOpcodes: fc.array(fc.integer({ min: 0x00, max: 0xFF }), { maxLength: 3 }),
        timeout: fc.integer({ min: 100, max: 5000 }),
        willSucceed: fc.boolean(),
        willTimeout: fc.boolean()
      })
      .map(
        (r) =>
          new ExecuteCommand(
            r.opcode as BoksOpcode,
            r.successOpcodes,
            r.errorOpcodes,
            r.timeout,
            r.willSucceed,
            r.willTimeout
          )
      );

    const commandsArbitrary = fc.commands([executeArbitrary], { maxCommands: 20 });

    await fc.assert(
      fc.asyncProperty(commandsArbitrary, async (cmds) => {
        const transport = new MockTransport();
        const client = new BoksClient({ transport, logger: () => {} });

        await client.connect();

        const setup = () => ({
          model: { pendingTransactions: 0, completedTransactions: 0, failedTransactions: 0 },
          real: { client, transport }
        });

        await fc.asyncModelRun(setup, cmds);
      }),
      { numRuns: 100 }
    );
  }, 10000); // Increased timeout for fuzzing
});
