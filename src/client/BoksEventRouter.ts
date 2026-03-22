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
    // Optimization: Standard `for...of` loop is significantly faster than Set.prototype.forEach()
    for (const listener of this.listeners) {
      if (listener.filter === filter && listener.callback === callback) {
        this.listeners.delete(listener);
      }
    }
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
        (payload as { opcode: number }).opcode === filter
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
    // Optimization: Standard `for...of` loop avoids callback overhead in high-frequency path
    for (const listener of this.listeners) {
      let matches = false;
      const filter = listener.filter;

      if (Array.isArray(filter)) {
        // Optimization: Standard `for` loop is faster than Array.prototype.some()
        for (let i = 0; i < filter.length; i++) {
          if (this.matchesClientFilter(filter[i], packet, direction)) {
            matches = true;
            break;
          }
        }
      } else {
        matches = this.matchesClientFilter(
          filter as BoksEventRouterFilterSingle<TEventMap>,
          packet,
          direction
        );
      }

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
    }
  }

  public emit<K extends keyof TEventMap>(event: K, payload: TEventMap[K]) {
    // Optimization: Standard `for...of` loop avoids callback overhead in high-frequency path
    for (const listener of this.listeners) {
      let matches = false;
      const filter = listener.filter;

      if (Array.isArray(filter)) {
        // Optimization: Standard `for` loop is faster than Array.prototype.includes()
        for (let i = 0; i < filter.length; i++) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (filter[i] === (event as any)) {
            matches = true;
            break;
          }
        }
      } else {
        matches = filter === event;
      }

      if (matches) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          listener.callback(payload as any, undefined);
        } catch {
          // ignore
        }
      }
    }
  }
}
