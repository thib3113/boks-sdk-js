import { BoksPacket } from '../protocol/_BoksPacketBase';

export type BoksPacketDirection = 'TX' | 'RX';

export type BoksPacketConstructor<T extends BoksPacket = BoksPacket> = new (...args: any[]) => T;

export type BoksClientFilterSingle =
  | BoksPacketDirection
  | '*'
  | number
  | BoksPacketConstructor<any>;

export type BoksClientFilter = BoksClientFilterSingle | BoksClientFilterSingle[];

export type InferClientPayloadSingle<F> = F extends BoksPacketDirection | '*'
  ? BoksPacket
  : F extends number
    ? BoksPacket
    : F extends BoksPacketConstructor<infer P>
      ? P
      : BoksPacket;

export type InferClientPayload<F> = F extends any[]
  ? InferClientPayloadSingle<F[number]>
  : InferClientPayloadSingle<F>;

export type BoksEventRouterFilterSingle<TEventMap extends Record<string, any>> =
  | BoksClientFilterSingle
  | keyof TEventMap;

export type BoksEventRouterFilter<TEventMap extends Record<string, any>> =
  | BoksEventRouterFilterSingle<TEventMap>
  | BoksEventRouterFilterSingle<TEventMap>[];

export type InferRouterPayloadSingle<
  TEventMap extends Record<string, any>,
  F
> = F extends keyof TEventMap ? TEventMap[F] : InferClientPayloadSingle<F>;

export type InferRouterPayload<TEventMap extends Record<string, any>, F> = F extends any[]
  ? InferRouterPayloadSingle<TEventMap, F[number]>
  : InferRouterPayloadSingle<TEventMap, F>;

export type BoksEventRouterListener<
  TEventMap extends Record<string, any>,
  F extends BoksEventRouterFilter<TEventMap>
> = (payload: InferRouterPayload<TEventMap, F>, direction: BoksPacketDirection | undefined) => void;

interface RegisteredListener<TEventMap extends Record<string, any>> {
  callback: BoksEventRouterListener<TEventMap, any>;
  filter: BoksEventRouterFilter<TEventMap>;
}

export class BoksEventRouter<TEventMap extends Record<string, any> = Record<string, never>> {
  private listeners: Set<RegisteredListener<TEventMap>> = new Set();

  public on<F extends BoksEventRouterFilter<TEventMap>>(
    filter: F,
    callback: BoksEventRouterListener<TEventMap, F>
  ): () => void {
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
    payload: any,
    direction?: BoksPacketDirection
  ): boolean {
    if (typeof filter === 'string' && ['TX', 'RX', '*'].includes(filter)) {
      if (!direction) {
        return false;
      }
      if (filter === '*') {
        return true;
      }
      return filter === direction;
    }
    if (typeof filter === 'string') {
      return false;
    }
    if (typeof filter === 'number') {
      return payload instanceof BoksPacket && payload.opcode === filter;
    }
    if (typeof filter === 'function') {
      return payload instanceof filter;
    }
    return false;
  }

  public emitClientEvent(packet: BoksPacket, direction: BoksPacketDirection) {
    this.listeners.forEach((listener) => {
      const matches = Array.isArray(listener.filter)
        ? listener.filter.some((f) => this.matchesClientFilter(f, packet, direction))
        : this.matchesClientFilter(
            listener.filter as BoksEventRouterFilterSingle<TEventMap>,
            packet,
            direction
          );

      if (matches) {
        listener.callback(packet as any, direction);
      }
    });
  }

  public emit<K extends keyof TEventMap>(event: K, payload: TEventMap[K]) {
    this.listeners.forEach((listener) => {
      const matches = Array.isArray(listener.filter)
        ? listener.filter.includes(event as any)
        : listener.filter === event;

      if (matches) {
        try {
          listener.callback(payload, undefined);
        } catch {
          // ignore
        }
      }
    });
  }
}
