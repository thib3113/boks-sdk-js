import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BoksClient } from '@/client/BoksClient';
import { WebBluetoothTransport } from '@/client/WebBluetoothTransport';

// Mock WebBluetoothTransport
vi.mock('@/client/WebBluetoothTransport', () => {
  return {
    WebBluetoothTransport: vi.fn().mockImplementation(() => ({
      connect: vi.fn(),
      disconnect: vi.fn(),
      write: vi.fn(),
      read: vi.fn(),
      subscribe: vi.fn(),
    })),
  };
});

describe('BoksClient Constructor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Stub navigator to ensure it has bluetooth
    vi.stubGlobal('navigator', {
      bluetooth: {}
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should pass device to WebBluetoothTransport when provided in options', () => {
    const mockDevice = { id: 'device-123', name: 'Boks Device' };
    // @ts-ignore
    new BoksClient({ device: mockDevice });
    expect(WebBluetoothTransport).toHaveBeenCalledWith(mockDevice);
  });

  it('should use provided transport in options', () => {
    const mockTransport = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      write: vi.fn(),
      read: vi.fn(),
      subscribe: vi.fn(),
    };
    // @ts-ignore
    const client = new BoksClient({ transport: mockTransport });
    expect((client as any).transport).toBe(mockTransport);
  });

  it('should default to WebBluetoothTransport if no options provided', () => {
    new BoksClient();
    expect(WebBluetoothTransport).toHaveBeenCalledWith(undefined);
  });
});
