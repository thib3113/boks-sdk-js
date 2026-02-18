import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '../../utils/converters';

/**
 * Notification: MAC Address of the Boks Scale.
 */
export class NotifyMacAddressBoksScalePacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_MAC_ADDRESS_BOKS_SCALE;
  public macAddress: string = '';

  constructor() {
    super(NotifyMacAddressBoksScalePacket.opcode);
  }

  parse(payload: Uint8Array) {
    super.parse(payload);
    this.macAddress =
      bytesToHex(payload)
        .match(/.{1,2}/g)
        ?.join(':') || '';
  }
}
