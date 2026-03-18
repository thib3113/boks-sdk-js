import { BoksPacketDirection } from './BoksClient';
import { BoksPacket } from '../protocol/_BoksPacketBase';

export type { BoksPacketDirection };

export type BoksClientFilterConstructor<T extends BoksPacket = BoksPacket> = new (
  ...args: any[]
) => T;

export type BoksClientFilterSingle =
  | BoksPacketDirection
  | '*'
  | number
  | BoksClientFilterConstructor<any>;

export type BoksClientFilter = BoksClientFilterSingle | BoksClientFilterSingle[];

export type InferClientPayloadSingle<F> = F extends BoksPacketDirection | '*'
  ? BoksPacket
  : F extends number
    ? BoksPacket
    : F extends BoksClientFilterConstructor<infer P>
      ? P
      : BoksPacket;

export type InferClientPayload<F> = F extends readonly any[]
  ? InferClientPayloadSingle<F[number]>
  : InferClientPayloadSingle<F>;
