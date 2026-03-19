import { BoksPacket } from '../protocol/_BoksPacketBase';

import { BoksPacketDirection, BoksClientFilterSingle, InferClientPayloadSingle } from './types';

export type BoksEventRouterFilterSingle<TEventMap extends Record<string, unknown>> =
  | BoksClientFilterSingle
  | keyof TEventMap;

export type BoksEventRouterFilter<TEventMap extends Record<string, unknown>> =
  | BoksEventRouterFilterSingle<TEventMap>
  | BoksEventRouterFilterSingle<TEventMap>[];

export type InferRouterPayloadSingle<
  TEventMap extends Record<string, unknown>,
  F
> = F extends string
  ? F extends 'TX' | 'RX' | '*'
    ? InferClientPayloadSingle<F>
    : F extends keyof TEventMap
      ? TEventMap[F]
      : InferClientPayloadSingle<F>
  : InferClientPayloadSingle<F>;

export type InferRouterPayload<TEventMap extends Record<string, unknown>, F> = F extends unknown[]
  ? InferRouterPayloadSingle<TEventMap, F[number]>
  : InferRouterPayloadSingle<TEventMap, F>;

export type BoksEventRouterListener<
  TEventMap extends Record<string, unknown>,
  F extends BoksEventRouterFilter<TEventMap>
> = (payload: InferRouterPayload<TEventMap, F>, direction: BoksPacketDirection | undefined) => void;

interface RegisteredListener<TEventMap extends Record<string, unknown>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callback: BoksEventRouterListener<TEventMap, any>;
  filter: BoksEventRouterFilter<TEventMap>;
}

export class BoksEventRouter<TEventMap extends Record<string, unknown> = Record<string, never>> {
  private listeners: Set<RegisteredListener<TEventMap>> = new Set();

  public on<F extends BoksEventRouterFilter<TEventMap>>(
    filter: F,
    callback: BoksEventRouterListener<TEventMap, F>
  ): () => void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const listener = { callback: callback as BoksEventRouterListener<TEventMap, any>, filter };
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public off<F extends BoksEventRouterFilter<TEventMap>>(
    filter: F,
    callback: BoksEventRouterListener<TEventMap, F>
  ): void {
    this.listeners.forEach((listener) => {
      if (listener.filter === filter && listener.callback === callback) {
        this.listeners.delete(listener);
      }
    });
  }

  private matchesClientFilter(
    filter: BoksEventRouterFilterSingle<TEventMap>,
    payload: unknown,
    direction?: BoksPacketDirection
  ): boolean {
    if (typeof filter === 'string') {
      if (['TX', 'RX', '*'].includes(filter)) {
        if (filter === '*') {
          return true;
        }
        return filter === direction;
      }
      return false;
    }
    if (typeof filter === 'number') {
      return (
        payload !== null &&
        typeof payload === 'object' &&
        'opcode' in payload &&
        (payload as any).opcode === filter
      );
    }
    if (typeof filter === 'function') {
      return payload instanceof filter;
    }
    return false;
  }

  public emitClientEvent(
    packet: BoksPacket,
    direction: BoksPacketDirection,
    onError?: (error: unknown) => void
  ) {
    this.listeners.forEach((listener) => {
      const matches = Array.isArray(listener.filter)
        ? listener.filter.some((f) => this.matchesClientFilter(f, packet, direction))
        : this.matchesClientFilter(
            listener.filter as BoksEventRouterFilterSingle<TEventMap>,
            packet,
            direction
          );

      if (matches) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          listener.callback(packet as any, direction);
        } catch (e) {
          if (onError) {
            onError(e);
          }
        }
      }
    });
  }

  public emit<K extends keyof TEventMap>(event: K, payload: TEventMap[K]) {
    this.listeners.forEach((listener) => {
      const matches = Array.isArray(listener.filter)
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          listener.filter.includes(event as any)
        : listener.filter === event;

      if (matches) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          listener.callback(payload as any, undefined);
        } catch {
          // ignore
        }
      }
    });
  }
}
