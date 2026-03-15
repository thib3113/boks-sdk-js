import { PayloadMapper, PayloadMacAddress } from '@/protocol/payload-mapper';
import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/** ⚠️ This packet is theoretical; it has never been tested in real-world conditions. */
/**
 * Notification: MAC Address of the Boks Scale.
 */
export class NotifyMacAddressBoksScalePacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_MAC_ADDRESS_BOKS_SCALE;

  @PayloadMacAddress(0)
  public accessor macAddress!: string;

  constructor(macAddress: string, rawPayload?: Uint8Array) {
    super(NotifyMacAddressBoksScalePacket.opcode, rawPayload);
    this.macAddress = macAddress;
  }

  static fromPayload(payload: Uint8Array): NotifyMacAddressBoksScalePacket {
    const data = PayloadMapper.parse(NotifyMacAddressBoksScalePacket, payload);
    return new NotifyMacAddressBoksScalePacket(data.macAddress as string, payload);
  }
}
