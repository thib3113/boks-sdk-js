import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksProtocolError, BoksProtocolErrorId } from '@/errors/BoksProtocolError';

/**
 * Base for packets requiring authentication (Config Key)
 */
export abstract class AuthPacket extends BoksPacket {
  constructor(public readonly configKey: string) {
    super();
    if (!/^[0-9A-F]{8}$/.test(configKey)) {
      throw new BoksProtocolError(
        BoksProtocolErrorId.INVALID_CONFIG_KEY,
        'Config Key must be exactly 8 uppercase hexadecimal characters'
      );
    }
  }

  toJSON() {
    return {
      ...this,
      rawPayload: {},
      configKey: '[REDACTED]'
    };
  }
}
