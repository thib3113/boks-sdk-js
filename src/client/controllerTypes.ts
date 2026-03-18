import { BoksClientFilterSingle, BoksPacketDirection, InferClientPayloadSingle } from './types';

export interface BoksControllerEvents {
  doorStateChanged: boolean;
  codesCountUpdated: { masterCount: number; singleCount: number };
  logsCountUpdated: number;
}

export type BoksControllerFilterSingle = BoksClientFilterSingle | keyof BoksControllerEvents;

export type BoksControllerFilter = BoksControllerFilterSingle | BoksControllerFilterSingle[];

export type InferControllerPayloadSingle<F> = F extends keyof BoksControllerEvents
  ? BoksControllerEvents[F]
  : InferClientPayloadSingle<F>;

export type InferControllerPayload<F> = F extends readonly any[]
  ? InferControllerPayloadSingle<F[number]>
  : InferControllerPayloadSingle<F>;

export type BoksControllerListener<F extends BoksControllerFilter> = (
  payload: InferControllerPayload<F>,
  direction?: BoksPacketDirection
) => void;
