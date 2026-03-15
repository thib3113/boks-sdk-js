import { sealed } from '@/utils/security';
import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { readConfigKeyFromBuffer } from '@/utils/converters';
import { PayloadConfigKey } from '@/protocol/payload-mapper';

/**
 * Base for packets requiring authentication (Config Key)
 */
export interface AuthPacketProps {
  configKey: string;
}

@sealed
export abstract class AuthPacket extends BoksPacket {
  @PayloadConfigKey(0)
  public accessor configKey!: string;

  constructor(props: AuthPacketProps | string, rawPayload?: Uint8Array) {
    super(rawPayload);
    this.configKey = typeof props === 'string' ? props : props.configKey;
  }

  /**
   * Helper to quickly extract the config key string from a standard AuthPacket payload.
   */
  static extractConfigKey(payload: Uint8Array): string {
    return readConfigKeyFromBuffer(payload, 0);
  }
}
