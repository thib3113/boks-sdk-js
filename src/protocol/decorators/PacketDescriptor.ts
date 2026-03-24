/**
 * Decorator for Boks Packet classes to define specific protocol behaviors.
 */
export interface PacketOptions {
  /**
   * If true, the length byte in the packet header represents the total packet length
   * (Opcode + Length + Payload + Checksum) instead of just the payload length.
   * Example: Opcode 0xC3 (NOTIFY_CODES_COUNT) uses this.
   */
  lengthIncludesHeader?: boolean;
}

export function PacketDescriptor(options: PacketOptions) {
  return function (constructor: Function) {
    (constructor as any).lengthIncludesHeader = options.lengthIncludesHeader;
  };
}
