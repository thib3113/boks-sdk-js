import { BOKS_UUIDS, BoksBatteryStats, UNKNOWN_VALUE } from '@/protocol/constants';
import { BoksTransport } from '@/client/transport';

/**
 * Fetches and parses the standard battery level from the transport.
 * @param transport Any implementation of BoksTransport.
 * @returns Battery level (0-100) or undefined if it fails.
 */
export async function fetchBatteryLevel(transport: BoksTransport): Promise<number | undefined> {
  const payload = await transport.read(BOKS_UUIDS.BATTERY_LEVEL).catch(() => undefined);
  return parseBatteryLevel(payload);
}

/**
 * Fetches and parses the detailed battery statistics from the transport.
 * @param transport Any implementation of BoksTransport.
 * @returns BoksBatteryStats object or undefined if it fails.
 */
export async function fetchBatteryStats(
  transport: BoksTransport
): Promise<BoksBatteryStats | undefined> {
  const payload = await transport.read(BOKS_UUIDS.CUSTOM_BATTERY).catch(() => undefined);
  return parseBatteryStats(payload);
}

/**
 * Parses the standard battery level (1 byte).
 * @param payload Raw payload from characteristic 00002a19-0000-1000-8000-00805f9b34fb
 * @returns Battery level (0-100) or undefined if data is invalid.
 */
export function parseBatteryLevel(payload?: Uint8Array): number | undefined {
  const level = payload?.[0];
  return level !== undefined && level !== UNKNOWN_VALUE ? level : undefined;
}

/**
 * Parses detailed battery statistics (4 or 6 bytes).
 * @param payload Raw payload from characteristic 00000004-0000-1000-8000-00805f9b34fb
 * @returns BoksBatteryStats object or undefined if data is invalid.
 */
export function parseBatteryStats(payload?: Uint8Array): BoksBatteryStats | undefined {
  if (!payload || payload.length === 0 || Array.from(payload).every((b) => b === UNKNOWN_VALUE)) {
    return undefined;
  }

  const rawTemp = payload[payload.length - 1];
  const temperature = rawTemp !== UNKNOWN_VALUE ? rawTemp - 25 : undefined;

  if (payload.length === 6) {
    return {
      format: 'measures-first-min-mean-max-last',
      level: payload[2], // Mean level
      temperature,
      details: {
        first: payload[0],
        min: payload[1],
        mean: payload[2],
        max: payload[3],
        last: payload[4]
      }
    };
  }

  if (payload.length === 4) {
    return {
      format: 'measures-t1-t5-t10',
      level: payload[0], // T1 level
      temperature,
      details: {
        t1: payload[0],
        t5: payload[1] !== UNKNOWN_VALUE ? payload[1] : undefined,
        t10: payload[2] !== UNKNOWN_VALUE ? payload[2] : undefined
      }
    };
  }

  return undefined;
}
