import { BoksPacketOptions } from '../_BoksPacketBase';
import { PayloadMapper, PayloadMacAddress } from '@/protocol/decorators';
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

  constructor(macAddress: string, raw?: Uint8Array) {
    super(NotifyMacAddressBoksScalePacket.opcode, raw);
    this.macAddress = macAddress;
  }

  static fromRaw(
    payload: Uint8Array,
    options?: BoksPacketOptions
  ): NotifyMacAddressBoksScalePacket {
    const data = PayloadMapper.parse(NotifyMacAddressBoksScalePacket, payload, options);
    return new NotifyMacAddressBoksScalePacket(data.macAddress, payload);
  }
}
