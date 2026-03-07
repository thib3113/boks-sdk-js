import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { sealed } from '@/utils/security';
import { bytesToString } from '@/utils/converters';

/**
 * Base for packets requiring authentication (Config Key)
 */
@sealed
export abstract class AuthPacket extends BoksPacket {
  public readonly configKey: string;

  constructor(configKey: string) {
    super();
    this.configKey = this.formatConfigKey(configKey);
  }

  /**
   * Helper to quickly extract the config key string from a standard AuthPacket payload.
   */
  static extractConfigKey(payload: Uint8Array): string {
    return bytesToString(payload.subarray(0, 8));
  }
}
