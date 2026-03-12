import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { sealed } from '@/utils/security';
import { readConfigKeyFromBuffer } from '@/utils/converters';
import { PayloadConfigKey } from '@/protocol/payload-mapper';

/**
 * Base for packets requiring authentication (Config Key)
 */
@sealed
export abstract class AuthPacket extends BoksPacket {
  @PayloadConfigKey(0)
  public accessor configKey!: string;

  constructor(configKey: string) {
    super();
    this.configKey = configKey;
  }

  /**
   * Helper to quickly extract the config key string from a standard AuthPacket payload.
   */
  static extractConfigKey(payload: Uint8Array): string {
    return readConfigKeyFromBuffer(payload, 0);
  }
}
