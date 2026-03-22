"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoksConfigType = exports.EMPTY_BUFFER = exports.BoksCodeType = exports.MAX_MASTER_CODE_INDEX = exports.INVALID_BYTE = exports.CHECKSUM_MASK = exports.PIN_ALGO_CONFIG = exports.BOKS_UUIDS = exports.DFU_SERVICE_UUID = exports.BOKS_SERVICE_UUID = exports.BoksOpcode = void 0;
/**
 * Boks BLE Protocol Opcodes and Constants
 */
var BoksOpcode;
(function (BoksOpcode) {
    // Downlink (Commands)
    BoksOpcode[BoksOpcode["OPEN_DOOR"] = 1] = "OPEN_DOOR";
    BoksOpcode[BoksOpcode["ASK_DOOR_STATUS"] = 2] = "ASK_DOOR_STATUS";
    BoksOpcode[BoksOpcode["REQUEST_LOGS"] = 3] = "REQUEST_LOGS";
    BoksOpcode[BoksOpcode["REBOOT"] = 6] = "REBOOT";
    BoksOpcode[BoksOpcode["GET_LOGS_COUNT"] = 7] = "GET_LOGS_COUNT";
    BoksOpcode[BoksOpcode["TEST_BATTERY"] = 8] = "TEST_BATTERY";
    BoksOpcode[BoksOpcode["MASTER_CODE_EDIT"] = 9] = "MASTER_CODE_EDIT";
    BoksOpcode[BoksOpcode["SINGLE_USE_CODE_TO_MULTI"] = 10] = "SINGLE_USE_CODE_TO_MULTI";
    BoksOpcode[BoksOpcode["MULTI_CODE_TO_SINGLE_USE"] = 11] = "MULTI_CODE_TO_SINGLE_USE";
    BoksOpcode[BoksOpcode["DELETE_MASTER_CODE"] = 12] = "DELETE_MASTER_CODE";
    BoksOpcode[BoksOpcode["DELETE_SINGLE_USE_CODE"] = 13] = "DELETE_SINGLE_USE_CODE";
    BoksOpcode[BoksOpcode["DELETE_MULTI_USE_CODE"] = 14] = "DELETE_MULTI_USE_CODE";
    BoksOpcode[BoksOpcode["REACTIVATE_CODE"] = 15] = "REACTIVATE_CODE";
    BoksOpcode[BoksOpcode["GENERATE_CODES"] = 16] = "GENERATE_CODES";
    BoksOpcode[BoksOpcode["CREATE_MASTER_CODE"] = 17] = "CREATE_MASTER_CODE";
    BoksOpcode[BoksOpcode["CREATE_SINGLE_USE_CODE"] = 18] = "CREATE_SINGLE_USE_CODE";
    BoksOpcode[BoksOpcode["CREATE_MULTI_USE_CODE"] = 19] = "CREATE_MULTI_USE_CODE";
    BoksOpcode[BoksOpcode["COUNT_CODES"] = 20] = "COUNT_CODES";
    BoksOpcode[BoksOpcode["GENERATE_CODES_SUPPORT"] = 21] = "GENERATE_CODES_SUPPORT";
    BoksOpcode[BoksOpcode["SET_CONFIGURATION"] = 22] = "SET_CONFIGURATION";
    BoksOpcode[BoksOpcode["REGISTER_NFC_TAG_SCAN_START"] = 23] = "REGISTER_NFC_TAG_SCAN_START";
    BoksOpcode[BoksOpcode["REGISTER_NFC_TAG"] = 24] = "REGISTER_NFC_TAG";
    BoksOpcode[BoksOpcode["UNREGISTER_NFC_TAG"] = 25] = "UNREGISTER_NFC_TAG";
    BoksOpcode[BoksOpcode["RE_GENERATE_CODES_PART1"] = 32] = "RE_GENERATE_CODES_PART1";
    BoksOpcode[BoksOpcode["RE_GENERATE_CODES_PART2"] = 33] = "RE_GENERATE_CODES_PART2";
    // Scale Commands
    BoksOpcode[BoksOpcode["SCALE_BOND"] = 80] = "SCALE_BOND";
    BoksOpcode[BoksOpcode["SCALE_GET_MAC_ADDRESS_BOKS"] = 82] = "SCALE_GET_MAC_ADDRESS_BOKS";
    BoksOpcode[BoksOpcode["SCALE_FORGET_BONDING"] = 83] = "SCALE_FORGET_BONDING";
    BoksOpcode[BoksOpcode["SCALE_TARE_EMPTY"] = 85] = "SCALE_TARE_EMPTY";
    BoksOpcode[BoksOpcode["SCALE_TARE_LOADED"] = 86] = "SCALE_TARE_LOADED";
    BoksOpcode[BoksOpcode["SCALE_MEASURE_WEIGHT"] = 87] = "SCALE_MEASURE_WEIGHT";
    BoksOpcode[BoksOpcode["SCALE_PREPARE_DFU"] = 96] = "SCALE_PREPARE_DFU";
    BoksOpcode[BoksOpcode["SCALE_GET_RAW_SENSORS"] = 97] = "SCALE_GET_RAW_SENSORS";
    BoksOpcode[BoksOpcode["SCALE_RECONNECT"] = 98] = "SCALE_RECONNECT";
    // Uplink (Notifications / Responses)
    BoksOpcode[BoksOpcode["CODE_OPERATION_SUCCESS"] = 119] = "CODE_OPERATION_SUCCESS";
    BoksOpcode[BoksOpcode["CODE_OPERATION_ERROR"] = 120] = "CODE_OPERATION_ERROR";
    BoksOpcode[BoksOpcode["NOTIFY_LOGS_COUNT"] = 121] = "NOTIFY_LOGS_COUNT";
    BoksOpcode[BoksOpcode["ERROR_COMMAND_NOT_SUPPORTED"] = 128] = "ERROR_COMMAND_NOT_SUPPORTED";
    BoksOpcode[BoksOpcode["VALID_OPEN_CODE"] = 129] = "VALID_OPEN_CODE";
    BoksOpcode[BoksOpcode["INVALID_OPEN_CODE"] = 130] = "INVALID_OPEN_CODE";
    BoksOpcode[BoksOpcode["NOTIFY_DOOR_STATUS"] = 132] = "NOTIFY_DOOR_STATUS";
    BoksOpcode[BoksOpcode["ANSWER_DOOR_STATUS"] = 133] = "ANSWER_DOOR_STATUS";
    // History Events
    BoksOpcode[BoksOpcode["LOG_CODE_BLE_VALID"] = 134] = "LOG_CODE_BLE_VALID";
    BoksOpcode[BoksOpcode["LOG_CODE_KEY_VALID"] = 135] = "LOG_CODE_KEY_VALID";
    BoksOpcode[BoksOpcode["LOG_CODE_BLE_INVALID"] = 136] = "LOG_CODE_BLE_INVALID";
    BoksOpcode[BoksOpcode["LOG_CODE_KEY_INVALID"] = 137] = "LOG_CODE_KEY_INVALID";
    BoksOpcode[BoksOpcode["LOG_DOOR_CLOSE"] = 144] = "LOG_DOOR_CLOSE";
    BoksOpcode[BoksOpcode["LOG_DOOR_OPEN"] = 145] = "LOG_DOOR_OPEN";
    BoksOpcode[BoksOpcode["LOG_END_HISTORY"] = 146] = "LOG_END_HISTORY";
    BoksOpcode[BoksOpcode["LOG_HISTORY_ERASE"] = 147] = "LOG_HISTORY_ERASE";
    BoksOpcode[BoksOpcode["POWER_OFF"] = 148] = "POWER_OFF";
    BoksOpcode[BoksOpcode["BLOCK_RESET"] = 149] = "BLOCK_RESET";
    BoksOpcode[BoksOpcode["POWER_ON"] = 150] = "POWER_ON";
    BoksOpcode[BoksOpcode["BLE_REBOOT"] = 151] = "BLE_REBOOT";
    BoksOpcode[BoksOpcode["LOG_EVENT_SCALE_MEASURE"] = 152] = "LOG_EVENT_SCALE_MEASURE";
    BoksOpcode[BoksOpcode["LOG_EVENT_KEY_OPENING"] = 153] = "LOG_EVENT_KEY_OPENING";
    BoksOpcode[BoksOpcode["LOG_EVENT_ERROR"] = 160] = "LOG_EVENT_ERROR";
    BoksOpcode[BoksOpcode["LOG_EVENT_NFC_OPENING"] = 161] = "LOG_EVENT_NFC_OPENING";
    BoksOpcode[BoksOpcode["LOG_EVENT_NFC_REGISTERING"] = 162] = "LOG_EVENT_NFC_REGISTERING";
    BoksOpcode[BoksOpcode["NOTIFY_CODES_COUNT"] = 195] = "NOTIFY_CODES_COUNT";
    BoksOpcode[BoksOpcode["NOTIFY_SET_CONFIGURATION_SUCCESS"] = 196] = "NOTIFY_SET_CONFIGURATION_SUCCESS";
    BoksOpcode[BoksOpcode["NOTIFY_NFC_TAG_FOUND"] = 197] = "NOTIFY_NFC_TAG_FOUND";
    BoksOpcode[BoksOpcode["ERROR_NFC_TAG_ALREADY_EXISTS_SCAN"] = 198] = "ERROR_NFC_TAG_ALREADY_EXISTS_SCAN";
    BoksOpcode[BoksOpcode["ERROR_NFC_SCAN_TIMEOUT"] = 199] = "ERROR_NFC_SCAN_TIMEOUT";
    BoksOpcode[BoksOpcode["NOTIFY_NFC_TAG_REGISTERED"] = 200] = "NOTIFY_NFC_TAG_REGISTERED";
    BoksOpcode[BoksOpcode["NOTIFY_NFC_TAG_REGISTERED_ERROR_ALREADY_EXISTS"] = 201] = "NOTIFY_NFC_TAG_REGISTERED_ERROR_ALREADY_EXISTS";
    BoksOpcode[BoksOpcode["NOTIFY_NFC_TAG_UNREGISTERED"] = 202] = "NOTIFY_NFC_TAG_UNREGISTERED";
    BoksOpcode[BoksOpcode["NOTIFY_CODE_GENERATION_SUCCESS"] = 192] = "NOTIFY_CODE_GENERATION_SUCCESS";
    BoksOpcode[BoksOpcode["NOTIFY_CODE_GENERATION_ERROR"] = 193] = "NOTIFY_CODE_GENERATION_ERROR";
    BoksOpcode[BoksOpcode["NOTIFY_CODE_GENERATION_PROGRESS"] = 194] = "NOTIFY_CODE_GENERATION_PROGRESS";
    // Scale Notifications
    BoksOpcode[BoksOpcode["NOTIFY_SCALE_BONDING_SUCCESS"] = 176] = "NOTIFY_SCALE_BONDING_SUCCESS";
    BoksOpcode[BoksOpcode["NOTIFY_SCALE_BONDING_ERROR"] = 177] = "NOTIFY_SCALE_BONDING_ERROR";
    BoksOpcode[BoksOpcode["NOTIFY_MAC_ADDRESS_BOKS_SCALE"] = 178] = "NOTIFY_MAC_ADDRESS_BOKS_SCALE";
    BoksOpcode[BoksOpcode["NOTIFY_SCALE_BONDING_FORGET_SUCCESS"] = 179] = "NOTIFY_SCALE_BONDING_FORGET_SUCCESS";
    BoksOpcode[BoksOpcode["NOTIFY_SCALE_BONDING_PROGRESS"] = 180] = "NOTIFY_SCALE_BONDING_PROGRESS";
    BoksOpcode[BoksOpcode["NOTIFY_SCALE_TARE_EMPTY_OK"] = 181] = "NOTIFY_SCALE_TARE_EMPTY_OK";
    BoksOpcode[BoksOpcode["NOTIFY_SCALE_TARE_LOADED_OK"] = 182] = "NOTIFY_SCALE_TARE_LOADED_OK";
    BoksOpcode[BoksOpcode["NOTIFY_SCALE_MEASURE_WEIGHT"] = 183] = "NOTIFY_SCALE_MEASURE_WEIGHT";
    BoksOpcode[BoksOpcode["NOTIFY_SCALE_DISCONNECTED"] = 184] = "NOTIFY_SCALE_DISCONNECTED";
    BoksOpcode[BoksOpcode["NOTIFY_SCALE_RAW_SENSORS"] = 185] = "NOTIFY_SCALE_RAW_SENSORS";
    BoksOpcode[BoksOpcode["NOTIFY_SCALE_FAULTY"] = 186] = "NOTIFY_SCALE_FAULTY";
    // Protocol Errors
    BoksOpcode[BoksOpcode["ERROR_CRC"] = 224] = "ERROR_CRC";
    BoksOpcode[BoksOpcode["ERROR_UNAUTHORIZED"] = 225] = "ERROR_UNAUTHORIZED";
    BoksOpcode[BoksOpcode["ERROR_BAD_REQUEST"] = 226] = "ERROR_BAD_REQUEST";
})(BoksOpcode || (exports.BoksOpcode = BoksOpcode = {}));
/**
 * Bluetooth UUIDs for Boks Services and Characteristics
 */
exports.BOKS_SERVICE_UUID = 'a7630001-f491-4f21-95ea-846ba586e361';
exports.DFU_SERVICE_UUID = 0xFE59;
exports.BOKS_UUIDS = {
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
};
/**
 * PIN Algorithm Configuration (BLAKE2s)
 */
exports.PIN_ALGO_CONFIG = {
    IV: new Uint32Array([
        0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19
    ]),
    CONST_1: 0x01012006,
    MAX_32: 0xFFFFFFFF,
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
};
exports.CHECKSUM_MASK = 0xFF;
exports.INVALID_BYTE = 0xFF;
exports.MAX_MASTER_CODE_INDEX = 255;
var BoksCodeType;
(function (BoksCodeType) {
    BoksCodeType[BoksCodeType["Single"] = 0] = "Single";
    BoksCodeType[BoksCodeType["Multi"] = 1] = "Multi";
    BoksCodeType[BoksCodeType["Master"] = 2] = "Master";
})(BoksCodeType || (exports.BoksCodeType = BoksCodeType = {}));
exports.EMPTY_BUFFER = new Uint8Array(0);
var BoksConfigType;
(function (BoksConfigType) {
    BoksConfigType[BoksConfigType["LaPosteNfc"] = 1] = "LaPosteNfc";
})(BoksConfigType || (exports.BoksConfigType = BoksConfigType = {}));
