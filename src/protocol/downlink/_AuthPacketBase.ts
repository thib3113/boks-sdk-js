import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksProtocolError, BoksProtocolErrorId } from '@/errors/BoksProtocolError';
import { sealed } from '@/utils/security';
import { bytesToString } from '@/utils/converters';

/**
 * Base for packets requiring authentication (Config Key)
 */
@sealed
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

  /**
   * Helper to quickly extract the config key string from a standard AuthPacket payload.
   */
  static extractConfigKey(payload: Uint8Array): string {
    return bytesToString(payload.subarray(0, 8));
  }
}
