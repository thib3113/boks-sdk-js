import { BoksPacket } from '../protocol/_BoksPacketBase';

export type BoksPacketDirection = 'TX' | 'RX';

export type BoksClientFilterConstructor<T extends BoksPacket = BoksPacket> = new (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
) => T;

export type BoksClientFilterSingle =
  | BoksPacketDirection
  | '*'
  | number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | BoksClientFilterConstructor<any>;

export type BoksClientFilter = BoksClientFilterSingle | BoksClientFilterSingle[];

export type InferClientPayloadSingle<F> = F extends BoksPacketDirection | '*'
  ? BoksPacket
  : F extends number
    ? BoksPacket
    : F extends BoksClientFilterConstructor<infer P>
      ? P
      : BoksPacket;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type InferClientPayload<F> = F extends readonly any[]
  ? InferClientPayloadSingle<F[number]>
  : InferClientPayloadSingle<F>;
