import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '../../utils/converters';

/**
 * Notification: MAC Address of the Boks Scale.
 */
export class NotifyMacAddressBoksScalePacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_MAC_ADDRESS_BOKS_SCALE;

  constructor(
    public readonly macAddress: string = '',
    rawPayload?: Uint8Array
  ) {
    super(NotifyMacAddressBoksScalePacket.opcode, rawPayload);
  }

  static fromPayload(payload: Uint8Array): NotifyMacAddressBoksScalePacket {
    const macAddress =
      bytesToHex(payload)
        .match(/.{1,2}/g)
        ?.join(':') || '';
    return new NotifyMacAddressBoksScalePacket(macAddress, payload);
  }
}
