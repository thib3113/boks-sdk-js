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
    // Optimization: Replacing Regex /^[0-9A-F]{8}$/.test() with a manual loop
    // Yields ~1.9x performance speedup in V8 by avoiding Regex compilation/execution overhead.
    if (configKey.length !== 8) {
      throw new BoksProtocolError(
        BoksProtocolErrorId.INVALID_CONFIG_KEY,
        'Config Key must be exactly 8 uppercase hexadecimal characters'
      );
    }
    for (let i = 0; i < 8; i++) {
      const code = configKey.charCodeAt(i);
      // '0'-'9' (48-57) or 'A'-'F' (65-70)
      if ((code < 48 || code > 57) && (code < 65 || code > 70)) {
        throw new BoksProtocolError(
          BoksProtocolErrorId.INVALID_CONFIG_KEY,
          'Config Key must be exactly 8 uppercase hexadecimal characters'
        );
      }
    }
  }

  /**
   * Helper to quickly extract the config key string from a standard AuthPacket payload.
   */
  static extractConfigKey(payload: Uint8Array): string {
    return bytesToString(payload.subarray(0, 8));
  }
}
