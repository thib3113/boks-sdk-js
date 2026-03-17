/**
 * Boks BLE Protocol Opcodes and Constants
 */
export enum BoksOpcode {
  // Downlink (Commands)
  OPEN_DOOR = 0x01,
  ASK_DOOR_STATUS = 0x02,
  REQUEST_LOGS = 0x03,
  REBOOT = 0x06,
  GET_LOGS_COUNT = 0x07,
  TEST_BATTERY = 0x08,
  MASTER_CODE_EDIT = 0x09,
  SINGLE_USE_CODE_TO_MULTI = 0x0a,
  MULTI_CODE_TO_SINGLE_USE = 0x0b,
  DELETE_MASTER_CODE = 0x0c,
  DELETE_SINGLE_USE_CODE = 0x0d,
  DELETE_MULTI_USE_CODE = 0x0e,
  REACTIVATE_CODE = 0x0f,
  GENERATE_CODES = 0x10,
  CREATE_MASTER_CODE = 0x11,
  CREATE_SINGLE_USE_CODE = 0x12,
  CREATE_MULTI_USE_CODE = 0x13,
  COUNT_CODES = 0x14,
  GENERATE_CODES_SUPPORT = 0x15, // Provisioning mode
  SET_CONFIGURATION = 0x16,
  REGISTER_NFC_TAG_SCAN_START = 0x17,
  REGISTER_NFC_TAG = 0x18,
  UNREGISTER_NFC_TAG = 0x19,
  RE_GENERATE_CODES_PART1 = 0x20, // Provisioning Part A
  RE_GENERATE_CODES_PART2 = 0x21, // Provisioning Part B

  // Scale Commands
  SCALE_BOND = 0x50,
  SCALE_GET_MAC_ADDRESS_BOKS = 0x52,
  SCALE_FORGET_BONDING = 0x53,
  SCALE_TARE_EMPTY = 0x55,
  SCALE_TARE_LOADED = 0x56,
  SCALE_MEASURE_WEIGHT = 0x57,
  SCALE_PREPARE_DFU = 0x60,
  SCALE_GET_RAW_SENSORS = 0x61,
  SCALE_RECONNECT = 0x62,

  // Uplink (Notifications / Responses)
  CODE_OPERATION_SUCCESS = 0x77,
  CODE_OPERATION_ERROR = 0x78,
  NOTIFY_LOGS_COUNT = 0x79,
  ERROR_COMMAND_NOT_SUPPORTED = 0x80,
  VALID_OPEN_CODE = 0x81,
  INVALID_OPEN_CODE = 0x82,
  NOTIFY_DOOR_STATUS = 0x84,
  ANSWER_DOOR_STATUS = 0x85,

  // History Events
  LOG_CODE_BLE_VALID = 0x86,
  LOG_CODE_KEY_VALID = 0x87,
  LOG_CODE_BLE_INVALID = 0x88,
  LOG_CODE_KEY_INVALID = 0x89,
  LOG_DOOR_CLOSE = 0x90,
  LOG_DOOR_OPEN = 0x91,
  LOG_END_HISTORY = 0x92,
  LOG_HISTORY_ERASE = 0x93,
  POWER_OFF = 0x94,
  BLOCK_RESET = 0x95,
  POWER_ON = 0x96,
  BLE_REBOOT = 0x97,
  LOG_EVENT_SCALE_MEASURE = 0x98,
  LOG_EVENT_KEY_OPENING = 0x99,
  LOG_EVENT_ERROR = 0xa0,
  LOG_EVENT_NFC_OPENING = 0xa1,
  LOG_EVENT_NFC_REGISTERING = 0xa2,

  NOTIFY_CODES_COUNT = 0xc3,
  NOTIFY_SET_CONFIGURATION_SUCCESS = 0xc4,
  NOTIFY_NFC_TAG_FOUND = 0xc5,
  ERROR_NFC_TAG_ALREADY_EXISTS_SCAN = 0xc6,
  ERROR_NFC_SCAN_TIMEOUT = 0xc7,
  NOTIFY_NFC_TAG_REGISTERED = 0xc8,
  NOTIFY_NFC_TAG_REGISTERED_ERROR_ALREADY_EXISTS = 0xc9,
  NOTIFY_NFC_TAG_UNREGISTERED = 0xca,

  NOTIFY_CODE_GENERATION_SUCCESS = 0xc0,
  NOTIFY_CODE_GENERATION_ERROR = 0xc1,
  NOTIFY_CODE_GENERATION_PROGRESS = 0xc2,

  // Scale Notifications
  NOTIFY_SCALE_BONDING_SUCCESS = 0xb0,
  NOTIFY_SCALE_BONDING_ERROR = 0xb1,
  NOTIFY_MAC_ADDRESS_BOKS_SCALE = 0xb2,
  NOTIFY_SCALE_BONDING_FORGET_SUCCESS = 0xb3,
  NOTIFY_SCALE_BONDING_PROGRESS = 0xb4,
  NOTIFY_SCALE_TARE_EMPTY_OK = 0xb5,
  NOTIFY_SCALE_TARE_LOADED_OK = 0xb6,
  NOTIFY_SCALE_MEASURE_WEIGHT = 0xb7,
  NOTIFY_SCALE_DISCONNECTED = 0xb8,
  NOTIFY_SCALE_RAW_SENSORS = 0xb9,
  NOTIFY_SCALE_FAULTY = 0xba,

  // Protocol Errors
  ERROR_CRC = 0xe0,
  ERROR_UNAUTHORIZED = 0xe1,
  ERROR_BAD_REQUEST = 0xe2
}

/**
 * Bluetooth UUIDs for Boks Services and Characteristics
 */
export const BOKS_SERVICE_UUID = 'a7630001-f491-4f21-95ea-846ba586e361';
export const DFU_SERVICE_UUID = 0xfe59;
export const BOKS_UUIDS = {
  DFU_SERVICE: '0000fe59-0000-1000-8000-00805f9b34fb',
  DFU_CONTROL_POINT: '8ec90001-f315-4f60-9fb8-838830daea50',
  SERVICE: 'a7630001-f491-4f21-95ea-846ba586e361',
  WRITE: 'a7630002-f491-4f21-95ea-846ba586e361',
  NOTIFY: 'a7630003-f491-4f21-95ea-846ba586e361',
  CUSTOM_BATTERY: '00000004-0000-1000-8000-00805f9b34fb',

  BATTERY_SERVICE: '0000180f-0000-1000-8000-00805f9b34fb',
  BATTERY_LEVEL: '00002a19-0000-1000-8000-00805f9b34fb',

  DEVICE_INFO_SERVICE: '0000180a-0000-1000-8000-00805f9b34fb',
  FIRMWARE_REVISION: '00002a26-0000-1000-8000-00805f9b34fb',
  SOFTWARE_REVISION: '00002a28-0000-1000-8000-00805f9b34fb',
  HARDWARE_REVISION: '00002a27-0000-1000-8000-00805f9b34fb'
} as const;

/**
 * Detailed battery statistics.
 */
export interface BoksBatteryStats {
  format: 'measures-first-min-mean-max-last' | 'measures-t1-t5-t10' | 'measure-single';
  level: number; // Main battery level (0-100)
  temperature?: number; // In Celsius
  details?: {
    first?: number;
    min?: number;
    mean?: number;
    max?: number;
    last?: number;
    t1?: number;
    t5?: number;
    t10?: number;
  };
}

/**
 * PIN Algorithm Configuration (Blake2s / SHA-256)
 */
export const PIN_ALGO_CONFIG = {
  IV: new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ]),
  CONST_1: 0x01012006,
  MAX_32: 0xffffffff,
  SIGMA: [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    [14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3],
    [11, 8, 12, 0, 5, 2, 15, 13, 10, 14, 3, 6, 7, 1, 9, 4],
    [7, 9, 3, 1, 13, 12, 11, 14, 2, 6, 5, 10, 4, 0, 15, 8],
    [9, 0, 5, 7, 2, 4, 10, 15, 14, 1, 11, 12, 6, 8, 3, 13],
    [2, 12, 6, 10, 0, 11, 8, 3, 4, 13, 7, 5, 15, 14, 1, 9],
    [12, 5, 1, 15, 14, 13, 4, 10, 0, 7, 6, 3, 9, 2, 8, 11],
    [13, 11, 7, 14, 12, 1, 3, 9, 5, 0, 15, 4, 8, 6, 2, 10],
    [6, 15, 14, 9, 11, 3, 0, 8, 12, 2, 13, 7, 1, 4, 10, 5],
    [10, 2, 8, 4, 7, 6, 1, 5, 15, 11, 9, 14, 3, 12, 13, 0]
  ]
} as const;

export const CHECKSUM_MASK = 0xff;
export const INVALID_BYTE = 0xff;

export const MAX_MASTER_CODE_INDEX = 255;

export enum BoksCodeType {
  Single = 0,
  Multi = 1,
  Master = 2
}

export const EMPTY_BUFFER = new Uint8Array(0);

export enum BoksConfigType {
  LaPosteNfc = 1
}
