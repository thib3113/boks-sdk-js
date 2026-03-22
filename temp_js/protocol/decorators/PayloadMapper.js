"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayloadMapper = void 0;
exports.getOrCreateMetadata = getOrCreateMetadata;
var BoksProtocolError_1 = require("../../errors/BoksProtocolError");
var BoksExpectedReason_1 = require("../../errors/BoksExpectedReason");
var constants_1 = require("../constants");
var converters_1 = require("../../utils/converters");
/**
 * Metadata key used to store field definitions on the class constructor.
 */
var METADATA_KEY = Symbol.for('BoksPayloadMapper');
/**
 * Ensures the target class has a metadata array for field definitions.
 */
var legacyMetadataMap = new WeakMap();
function getOrCreateMetadata(context) {
    if (context.metadata) {
        if (!context.metadata[METADATA_KEY]) {
            context.metadata[METADATA_KEY] = [];
        }
        else if (!Object.prototype.hasOwnProperty.call(context.metadata, METADATA_KEY)) {
            // It's inherited from a parent! We must clone it so we don't mutate the parent's schema!
            context.metadata[METADATA_KEY] = __spreadArray([], context.metadata[METADATA_KEY], true);
        }
        return context.metadata[METADATA_KEY];
    }
    /* v8 ignore next */
    return [];
}
/**
 * Core Payload Mapper utility.
 * Compiles and executes JIT (Just-In-Time) parsing functions for extreme performance.
 */
var PayloadMapper = /** @class */ (function () {
    function PayloadMapper() {
    }
    /**
     * Pre-computed hex table for JIT compilers
     */
    /**
     * Security check: Validates that property names are safe identifiers
     * to prevent code injection into the JIT compiler via new Function().
     */
    /**
     * Fast, regex-free validation of JavaScript identifiers.
     * Ensures the name only contains [a-zA-Z0-9_$] and doesn't start with a number.
     */
    PayloadMapper.isValidIdentifier = function (name) {
        if (!name || name.length === 0) {
            return false;
        }
        // First char cannot be a number
        var firstCode = name.charCodeAt(0);
        var isFirstValid = (firstCode >= 65 && firstCode <= 90) || // A-Z
            (firstCode >= 97 && firstCode <= 122) || // a-z
            firstCode === 36 || // $
            firstCode === 95; // _
        if (!isFirstValid) {
            return false;
        }
        // Subsequent chars can also be numbers
        for (var i = 1; i < name.length; i++) {
            var code = name.charCodeAt(i);
            var isValid = (code >= 48 && code <= 57) || // 0-9
                (code >= 65 && code <= 90) || // A-Z
                (code >= 97 && code <= 122) || // a-z
                code === 36 || // $
                code === 95; // _
            if (!isValid) {
                return false;
            }
        }
        return true;
    };
    PayloadMapper.assertSafePropertyName = function (name) {
        var dangerousNames = [
            '__proto__',
            'constructor',
            'prototype',
            'payload',
            'instance',
            'BoksProtocolError',
            'BoksProtocolErrorId',
            'result',
            'break',
            'case',
            'catch',
            'class',
            'const',
            'continue',
            'debugger',
            'default',
            'delete',
            'do',
            'else',
            'export',
            'extends',
            'finally',
            'for',
            'function',
            'if',
            'import',
            'in',
            'instanceof',
            'new',
            'return',
            'super',
            'switch',
            'this',
            'throw',
            'try',
            'typeof',
            'var',
            'void',
            'while',
            'with',
            'yield',
            'let',
            'static',
            'enum',
            'await',
            'implements',
            'package',
            'protected',
            'interface',
            'private',
            'public'
        ];
        // Must be a valid identifier and not a reserved word or internal JIT variable
        if (typeof name !== 'string' ||
            !PayloadMapper.isValidIdentifier(name) ||
            dangerousNames.includes(name)) {
            throw new BoksProtocolError_1.BoksProtocolError(BoksProtocolError_1.BoksProtocolErrorId.INTERNAL_ERROR, "Unsafe property name mapped: ".concat(name), { received: name, expected: BoksExpectedReason_1.BoksExpectedReason.VALID_HEX_CHAR });
        }
    };
    /**
     * Security check: Validates bounds to prevent integer overflows
     * or unreasonable memory access definitions in the decorators.
     */
    PayloadMapper.assertSafeBounds = function (offset, size) {
        if (typeof offset !== 'number' ||
            typeof size !== 'number' ||
            offset < 0 ||
            size < 0 ||
            !Number.isSafeInteger(offset) ||
            !Number.isSafeInteger(size) ||
            offset + size > 1024) {
            throw new BoksProtocolError_1.BoksProtocolError(BoksProtocolError_1.BoksProtocolErrorId.BUFFER_OVERFLOW, "Invalid mapping bounds: offset=".concat(offset, ", size=").concat(size), { received: offset + size, expected: 1024 });
        }
    };
    /**
     * Compiles the JIT parsing function for a class.
     */
    PayloadMapper.getFields = function (targetClass) {
        var _a, _b, _c, _d, _e;
        var allFields = [];
        var currentClass = targetClass;
        while (currentClass &&
            currentClass !== Function.prototype &&
            currentClass !== Object.prototype) {
            var symMetadata = Symbol.metadata;
            if (!symMetadata) {
                var symbols = Object.getOwnPropertySymbols(currentClass);
                symMetadata = symbols.find(function (s) { return s.toString() === 'Symbol(Symbol.metadata)'; });
            }
            var fields = (symMetadata &&
                ((_a = currentClass[symMetadata]) === null || _a === void 0 ? void 0 : _a[METADATA_KEY])) ||
                ((_b = currentClass[Symbol.metadata]) === null || _b === void 0 ? void 0 : _b[METADATA_KEY]) ||
                ((_d = (_c = currentClass.constructor) === null || _c === void 0 ? void 0 : _c[Symbol.metadata]) === null || _d === void 0 ? void 0 : _d[METADATA_KEY]) ||
                legacyMetadataMap.get(currentClass) ||
                currentClass[METADATA_KEY] ||
                ((_e = currentClass.constructor) === null || _e === void 0 ? void 0 : _e[METADATA_KEY]);
            if (fields && Array.isArray(fields)) {
                var _loop_1 = function (f) {
                    if (!allFields.find(function (existing) { return existing.propertyName === f.propertyName; })) {
                        allFields.push(f);
                    }
                };
                // Add fields that aren't already mapped
                for (var _i = 0, fields_1 = fields; _i < fields_1.length; _i++) {
                    var f = fields_1[_i];
                    _loop_1(f);
                }
            }
            currentClass = Object.getPrototypeOf(currentClass);
        }
        return allFields;
    };
    PayloadMapper.compileParser = function (targetClass) {
        var fields = this.getFields(targetClass);
        if (!fields || fields.length === 0) {
            return function (_payload) { return ({}); }; // No fields mapped
        }
        // Calculate maximum required payload size securely
        var minSize = 0;
        for (var _i = 0, fields_2 = fields; _i < fields_2.length; _i++) {
            var field = fields_2[_i];
            this.assertSafePropertyName(field.propertyName);
            var size = 1; // Default min size
            if (field.type === 'uint16') {
                size = 2;
            }
            else if (field.type === 'uint24') {
                size = 3;
            }
            else if (field.type === 'uint32') {
                size = 4;
            }
            else if (field.type === 'mac_address') {
                size = 6;
            }
            else if (field.type === 'pin_code') {
                size = 6;
            }
            else if (field.type === 'config_key') {
                size = 8;
            }
            else if (field.type === 'ascii_string') {
                if (typeof field.length !== 'number') {
                    throw new BoksProtocolError_1.BoksProtocolError(BoksProtocolError_1.BoksProtocolErrorId.INTERNAL_ERROR, "Length required for string type: ".concat(field.type, " on property ").concat(field.propertyName), { field: field.propertyName, received: typeof field.length, expected: 'number' });
                }
                size = field.length;
            }
            else if (field.type === 'hex_string' || field.type === 'byte_array') {
                if (typeof field.length === 'number') {
                    size = field.length;
                }
                else {
                    size = 0; // Dynamic length, min size is just the offset
                }
            }
            else if (field.type === 'var_len_hex') {
                size = 1; // At minimum we need 1 byte for length
            }
            else if (field.type === 'bit') {
                size = 1;
            }
            this.assertSafeBounds(field.offset, size);
            var endOffset = field.offset + size;
            if (endOffset > minSize) {
                minSize = endOffset;
            }
        }
        // Start building the Javascript function body as a string.
        // We explicitly throw a BoksProtocolError if the payload is too short,
        // which handles the "fuzzing malformed data" requirement.
        var fnBody = "\n      // Auto-generated by PayloadMapper\n      if (!(payload instanceof Uint8Array)) {\n         throw new BoksProtocolError(\n           BoksProtocolErrorId.INVALID_TYPE,\n           'Payload must be a Uint8Array',\n           { received: typeof payload, expected: 'Uint8Array' }\n         );\n      }\n      if (payload.length < ".concat(minSize, ") {\n         throw new BoksProtocolError(\n           BoksProtocolErrorId.MALFORMED_DATA,\n           'Payload too short for mapped fields',\n           { received: payload.length, expected: ").concat(minSize, " }\n         );\n      }\n      const result = {};\n    ");
        // Generate optimized extraction code for each field
        for (var _a = 0, fields_3 = fields; _a < fields_3.length; _a++) {
            var field = fields_3[_a];
            var o = field.offset;
            var prop = field.propertyName;
            if (field.type === 'bit') {
                if (typeof field.bitIndex !== 'number' || field.bitIndex < 0 || field.bitIndex > 7) {
                    throw new BoksProtocolError_1.BoksProtocolError(BoksProtocolError_1.BoksProtocolErrorId.INTERNAL_ERROR, "Invalid bitIndex: ".concat(field.bitIndex, " for property ").concat(prop), { field: prop, received: field.bitIndex, expected: BoksExpectedReason_1.BoksExpectedReason.BIT_INDEX });
                }
            }
            switch (field.type) {
                case 'uint8':
                    fnBody += "result['".concat(prop, "'] = payload[").concat(o, "];\n");
                    break;
                case 'uint16':
                    // Big Endian parsing
                    fnBody += "result['".concat(prop, "'] = (payload[").concat(o, "] << 8) | payload[").concat(o + 1, "];\n");
                    break;
                case 'uint24':
                    // Big Endian parsing
                    fnBody += "result['".concat(prop, "'] = (payload[").concat(o, "] << 16) | (payload[").concat(o + 1, "] << 8) | payload[").concat(o + 2, "];\n");
                    break;
                case 'uint32':
                    // Big Endian parsing (Note: >>> 0 ensures unsigned 32-bit result in JS)
                    fnBody += "result['".concat(prop, "'] = ((payload[").concat(o, "] << 24) | (payload[").concat(o + 1, "] << 16) | (payload[").concat(o + 2, "] << 8) | payload[").concat(o + 3, "]) >>> 0;\n");
                    break;
                case 'ascii_string': {
                    // Unrolled String.fromCharCode for fast ASCII extraction without Regex allocation
                    // Encapsulated in a block scope to avoid variable name collisions or syntax errors
                    fnBody += "\n          {\n             let s = '';\n             let c;\n          ";
                    for (var i = 0; i < field.length; i++) {
                        fnBody += "\n             c = payload[".concat(o + i, "];\n             if (c) s += String.fromCharCode(c);\n            ");
                    }
                    fnBody += "\n             result['".concat(prop, "'] = s;\n          }\n          ");
                    break;
                }
                case 'boolean':
                    fnBody += "\n               if (payload[".concat(o, "] !== 0x00 && payload[").concat(o, "] !== 0x01) {\n                  throw new BoksProtocolError(\n                    BoksProtocolErrorId.INVALID_VALUE,\n                    'Boolean field must be 0x00 or 0x01',\n                    { field: '").concat(prop, "', received: payload[").concat(o, "], expected: BoksExpectedReason.UINT8 }\n                  );\n               }\n               result['").concat(prop, "'] = payload[").concat(o, "] === 0x01;\n          ");
                    break;
                case 'byte_array':
                    if (typeof field.length === 'number') {
                        fnBody += "result['".concat(prop, "'] = payload.subarray(").concat(o, ", ").concat(o, " + ").concat(field.length, ");\n");
                    }
                    else {
                        fnBody += "result['".concat(prop, "'] = payload.subarray(").concat(o, ");\n");
                    }
                    break;
                case 'mac_address':
                    // Reverse Little Endian to Big Endian (Standard Format: XXXXXXXXXXXX)
                    fnBody += "\n            result['".concat(prop, "'] = bytesToHex(payload.subarray(").concat(o, ", ").concat(o, " + 6), true);\n          ");
                    break;
                case 'pin_code':
                    // Inline validation for 6-char PIN: '0'-'9', 'A', 'B' (ASCII 48-57, 65-66)
                    fnBody += "\n             for(let i=0; i<6; i++) {\n               const c = payload[".concat(o, " + i];\n               if ((c < 48 || c > 57) && c !== 65 && c !== 66 && c !== 97 && c !== 98) {\n                  throw new BoksProtocolError(\n                    BoksProtocolErrorId.INVALID_PIN_FORMAT,\n                    'Invalid PIN character inline',\n                    { field: '").concat(prop, "', received: c, expected: BoksExpectedReason.VALID_HEX_CHAR }\n                  );\n               }\n             }\n             result['").concat(prop, "'] = String.fromCharCode(payload[").concat(o, "], payload[").concat(o + 1, "], payload[").concat(o + 2, "], payload[").concat(o + 3, "], payload[").concat(o + 4, "], payload[").concat(o + 5, "]).toUpperCase();\n           ");
                    break;
                case 'config_key':
                    // Inline validation for 8-char Config Key (Hex: 0-9, A-F)
                    fnBody += "\n             for(let i=0; i<8; i++) {\n               const c = payload[".concat(o, " + i];\n               // '0'-'9' (48-57), 'A'-'F' (65-70), 'a'-'f' (97-102)\n\n          if ((c < 48 || c > 57) && (c < 65 || c > 70) && (c < 97 || c > 102)) {\n                  throw new BoksProtocolError(\n                    BoksProtocolErrorId.INVALID_CONFIG_KEY,\n                    'Invalid Config Key character inline',\n                    { field: '").concat(prop, "', received: c, expected: BoksExpectedReason.VALID_HEX_CHAR }\n                  );\n               }\n             }\n             result['").concat(prop, "'] = String.fromCharCode(payload[").concat(o, "], payload[").concat(o + 1, "], payload[").concat(o + 2, "], payload[").concat(o + 3, "], payload[").concat(o + 4, "], payload[").concat(o + 5, "], payload[").concat(o + 6, "], payload[").concat(o + 7, "]).toUpperCase();\n           ");
                    break;
                case 'hex_string': {
                    if (typeof field.length === 'number') {
                        fnBody += "result['".concat(prop, "'] = bytesToHex(payload.subarray(").concat(o, ", ").concat(o, " + ").concat(field.length, "));\n");
                    }
                    else {
                        fnBody += "\n            result['".concat(prop, "'] = bytesToHex(payload.subarray(").concat(o, "));\n            ");
                    }
                    break;
                }
                case 'var_len_hex': {
                    fnBody += "\n          {\n             const len = payload[".concat(o, "];\n             if (payload.length < ").concat(o + 1, " + len) {\n               throw new BoksProtocolError(\n                 BoksProtocolErrorId.MALFORMED_DATA,\n                 'Payload too short for variable length hex string',\n                 { field: '").concat(prop, "', received: payload.length, expected: ").concat(o + 1, " + len }\n               );\n             }\n             result['").concat(prop, "'] = bytesToHex(payload.subarray(").concat(o + 1, ", ").concat(o + 1, " + len));\n          }\n          ");
                    break;
                }
                case 'bit': {
                    fnBody += "result['".concat(prop, "'] = ((payload[").concat(o, "] >> ").concat(field.bitIndex, ") & 1) === 1;\n");
                    break;
                }
            }
        }
        fnBody += "return result;\n";
        // Compile the function, injecting external dependencies into the closure scope.
        return new Function('payload', 'BoksProtocolError', 'BoksProtocolErrorId', 'BoksExpectedReason', 'bytesToHex', fnBody);
    };
    /**
     * Compiles the JIT serialization function for a class.
     */
    /**
     * Compiles the JIT validation function for a class instance.
     * Used in constructors to validate manually provided properties.
     */
    PayloadMapper.compileValidator = function (targetClass) {
        var fields = this.getFields(targetClass);
        if (!fields || fields.length === 0) {
            return function (_instance) { };
        }
        var fnBody = "// Auto-generated by PayloadMapper.validate\n";
        for (var _i = 0, fields_4 = fields; _i < fields_4.length; _i++) {
            var field = fields_4[_i];
            this.assertSafePropertyName(field.propertyName);
            var prop = field.propertyName;
            var val = "instance['".concat(prop, "']");
            if (field.type === 'pin_code') {
                fnBody += "\n           if (typeof ".concat(val, " !== 'string' || ").concat(val, ".length !== 6) {\n              throw new BoksProtocolError(\n                BoksProtocolErrorId.INVALID_PIN_FORMAT,\n                'PIN must be exactly 6 characters',\n                { field: '").concat(prop, "', received: typeof ").concat(val, " === 'string' ? ").concat(val, ".length : typeof ").concat(val, ", expected: 6 }\n              );\n           }\n           for (let i = 0; i < 6; i++) {\n              const c = ").concat(val, ".charCodeAt(i);\n              if ((c < 48 || c > 57) && c !== 65 && c !== 66 && c !== 97 && c !== 98) {\n                 throw new BoksProtocolError(\n                   BoksProtocolErrorId.INVALID_PIN_FORMAT,\n                   'PIN must contain only 0-9, A, B',\n                   { field: '").concat(prop, "', received: ").concat(val, ", expected: BoksExpectedReason.PIN_CODE_FORMAT }\n                 );\n              }\n           }\n         ");
            }
            else if (field.type === 'config_key') {
                fnBody += "\n           if (typeof ".concat(val, " !== 'string' || ").concat(val, ".length !== 8) {\n              throw new BoksProtocolError(\n                BoksProtocolErrorId.INVALID_CONFIG_KEY,\n                'Config Key must be exactly 8 characters',\n                { field: '").concat(prop, "', received: typeof ").concat(val, " === 'string' ? ").concat(val, ".length : typeof ").concat(val, ", expected: 8 }\n              );\n           }\n           for (let i = 0; i < 8; i++) {\n              const c = ").concat(val, ".charCodeAt(i);\n              if ((c < 48 || c > 57) && (c < 65 || c > 70) && (c < 97 || c > 102)) {\n                 throw new BoksProtocolError(\n                   BoksProtocolErrorId.INVALID_CONFIG_KEY,\n                   'Config Key must contain only hex characters',\n                   { field: '").concat(prop, "', received: ").concat(val, ", expected: BoksExpectedReason.VALID_HEX_CHAR }\n                 );\n              }\n           }\n         ");
            }
            // Other types (uint8, etc.) could have type/bounds checks here if needed
        }
        return new Function('instance', 'BoksProtocolError', 'BoksProtocolErrorId', 'BoksExpectedReason', fnBody);
    };
    PayloadMapper.compileSerializer = function (targetClass) {
        var fields = this.getFields(targetClass);
        if (!fields || fields.length === 0) {
            return function () { return constants_1.EMPTY_BUFFER; }; // No fields mapped
        }
        // Calculate maximum required payload size securely
        var size = 0;
        for (var _i = 0, fields_5 = fields; _i < fields_5.length; _i++) {
            var field = fields_5[_i];
            this.assertSafePropertyName(field.propertyName);
            var fieldSize = 1;
            if (field.type === 'uint16') {
                fieldSize = 2;
            }
            else if (field.type === 'uint24') {
                fieldSize = 3;
            }
            else if (field.type === 'uint32') {
                fieldSize = 4;
            }
            else if (field.type === 'mac_address') {
                fieldSize = 6;
            }
            else if (field.type === 'pin_code') {
                fieldSize = 6;
            }
            else if (field.type === 'config_key') {
                fieldSize = 8;
            }
            else if (field.type === 'ascii_string') {
                fieldSize = field.length;
            }
            else if (field.type === 'hex_string' || field.type === 'byte_array') {
                fieldSize = typeof field.length === 'number' ? field.length : 0;
            }
            else if (field.type === 'var_len_hex') {
                fieldSize = 1; // Will grow dynamically based on instance value in dynamic size calc below
            }
            else if (field.type === 'bit') {
                fieldSize = 1;
            }
            this.assertSafeBounds(field.offset, fieldSize);
            var endOffset = field.offset + fieldSize;
            if (endOffset > size) {
                size = endOffset;
            }
        }
        var fnBody = "\n      // Auto-generated by PayloadMapper\n      if (!instance || typeof instance !== 'object') {\n          throw new BoksProtocolError(BoksProtocolErrorId.INTERNAL_ERROR, 'Cannot serialize null or non-object instance');\n      }\n    ";
        // Calculate dynamic payload size based on actual values
        var dynamicSizeCalc = "".concat(size);
        // Check if we need to add length for dynamic fields
        for (var _a = 0, fields_6 = fields; _a < fields_6.length; _a++) {
            var field = fields_6[_a];
            var prop = field.propertyName;
            if (field.type === 'var_len_hex') {
                // Optimization: calculating the exact byte length during pre-processing using the existing tool
                dynamicSizeCalc += " + (instance['".concat(prop, "'] && typeof instance['").concat(prop, "'] === 'string' ? hexToBytes(instance['").concat(prop, "']).length : 0)");
            }
            else if ((field.type === 'hex_string' || field.type === 'byte_array') &&
                typeof field.length !== 'number') {
                if (field.type === 'hex_string') {
                    dynamicSizeCalc += " + (instance['".concat(prop, "'] && typeof instance['").concat(prop, "'] === 'string' ? Math.floor(instance['").concat(prop, "'].length / 2) : (instance['").concat(prop, "'] instanceof Uint8Array ? instance['").concat(prop, "'].length : 0))");
                }
                else {
                    dynamicSizeCalc += " + (instance['".concat(prop, "'] && instance['").concat(prop, "'] instanceof Uint8Array ? instance['").concat(prop, "'].length : 0)");
                }
            }
        }
        fnBody += "\n      const payload = new Uint8Array(".concat(dynamicSizeCalc, ");\n    ");
        for (var _b = 0, fields_7 = fields; _b < fields_7.length; _b++) {
            var field = fields_7[_b];
            var o = field.offset;
            var prop = field.propertyName;
            if (field.type === 'bit') {
                if (typeof field.bitIndex !== 'number' || field.bitIndex < 0 || field.bitIndex > 7) {
                    throw new BoksProtocolError_1.BoksProtocolError(BoksProtocolError_1.BoksProtocolErrorId.INTERNAL_ERROR, "Invalid bitIndex: ".concat(field.bitIndex, " for property ").concat(prop), { field: prop, received: field.bitIndex, expected: BoksExpectedReason_1.BoksExpectedReason.BIT_INDEX });
                }
            }
            // We read the instance value. Missing values default to 0 for numbers, or empty string.
            // Throw if mandatory fields are missing
            var isMandatory = field.type === 'pin_code' ||
                field.type === 'config_key' ||
                (field.type === 'uint8' && prop === 'index');
            if (isMandatory) {
                fnBody += "\n          if (instance['".concat(prop, "'] === undefined || instance['").concat(prop, "'] === null) {\n            throw new BoksProtocolError(\n              BoksProtocolErrorId.MISSING_MANDATORY_FIELD,\n              'Missing mandatory field: ").concat(prop, "',\n              { field: '").concat(prop, "', received: instance['").concat(prop, "'], expected: BoksExpectedReason.EXACT_LENGTH }\n            );\n          }\n        ");
            }
            var val = "(instance['".concat(prop, "'] || 0)");
            var strVal = "(String(instance['".concat(prop, "'] || ''))");
            var strValRaw = "(String(instance['".concat(prop, "']))");
            switch (field.type) {
                case 'uint8':
                    fnBody += "payload[".concat(o, "] = ").concat(val, ";\n");
                    break;
                case 'uint16':
                    fnBody += "payload[".concat(o, "] = (").concat(val, " >> 8) & 0xFF;\n");
                    fnBody += "payload[".concat(o + 1, "] = ").concat(val, " & 0xFF;\n");
                    break;
                case 'uint24':
                    fnBody += "payload[".concat(o, "] = (").concat(val, " >> 16) & 0xFF;\n");
                    fnBody += "payload[".concat(o + 1, "] = (").concat(val, " >> 8) & 0xFF;\n");
                    fnBody += "payload[".concat(o + 2, "] = ").concat(val, " & 0xFF;\n");
                    break;
                case 'uint32':
                    fnBody += "payload[".concat(o, "] = (").concat(val, " >>> 24) & 0xFF;\n");
                    fnBody += "payload[".concat(o + 1, "] = (").concat(val, " >>> 16) & 0xFF;\n");
                    fnBody += "payload[".concat(o + 2, "] = (").concat(val, " >>> 8) & 0xFF;\n");
                    fnBody += "payload[".concat(o + 3, "] = ").concat(val, " & 0xFF;\n");
                    break;
                case 'ascii_string':
                    // Unrolled charCodeAt, pads with 0x00 if string is shorter than fixed length
                    for (var i = 0; i < field.length; i++) {
                        fnBody += "payload[".concat(o + i, "] = ").concat(strVal, ".length > ").concat(i, " ? ").concat(strVal, ".charCodeAt(").concat(i, ") : 0;\n");
                    }
                    break;
                case 'boolean':
                    fnBody += "payload[".concat(o, "] = instance['").concat(prop, "'] ? 0x01 : 0x00;\n");
                    break;
                case 'byte_array':
                    if (typeof field.length === 'number') {
                        fnBody += "\n              if (instance['".concat(prop, "'] && instance['").concat(prop, "'] instanceof Uint8Array) {\n                 payload.set(instance['").concat(prop, "'].subarray(0, ").concat(field.length, "), ").concat(o, ");\n              }\n            ");
                    }
                    else {
                        fnBody += "\n              if (instance['".concat(prop, "'] && instance['").concat(prop, "'] instanceof Uint8Array) {\n                 payload.set(instance['").concat(prop, "'], ").concat(o, ");\n              }\n            ");
                    }
                    break;
                case 'mac_address':
                    fnBody += "\n            if (typeof instance['".concat(prop, "'] === 'string') {\n              const bytes = hexToBytes(instance['").concat(prop, "']);\n              if (bytes.length === 6) {\n                payload[").concat(o, "] = bytes[5];\n                payload[").concat(o, " + 1] = bytes[4];\n                payload[").concat(o, " + 2] = bytes[3];\n                payload[").concat(o, " + 3] = bytes[2];\n                payload[").concat(o, " + 4] = bytes[1];\n                payload[").concat(o, " + 5] = bytes[0];\n              }\n            }\n          ");
                    break;
                case 'pin_code':
                    for (var i = 0; i < 6; i++) {
                        fnBody += "payload[".concat(o + i, "] = ").concat(strValRaw, ".charCodeAt(").concat(i, ");\n");
                    }
                    break;
                case 'config_key':
                    for (var i = 0; i < 8; i++) {
                        fnBody += "payload[".concat(o + i, "] = ").concat(strValRaw, ".charCodeAt(").concat(i, ");\n");
                    }
                    break;
                case 'hex_string':
                    if (typeof field.length === 'number') {
                        fnBody += "\n              if (typeof instance['".concat(prop, "'] === 'string') {\n                const bytes = hexToBytes(instance['").concat(prop, "']);\n                for (let i = 0; i < ").concat(field.length, " && i < bytes.length; i++) {\n                  payload[").concat(o, " + i] = bytes[i];\n                }\n              } else if (instance['").concat(prop, "'] instanceof Uint8Array) {\n                payload.set(instance['").concat(prop, "'].subarray(0, ").concat(field.length, "), ").concat(o, ");\n              }\n            ");
                    }
                    else {
                        fnBody += "\n              if (typeof instance['".concat(prop, "'] === 'string') {\n                const bytes = hexToBytes(instance['").concat(prop, "']);\n                payload.set(bytes, ").concat(o, ");\n              } else if (instance['").concat(prop, "'] instanceof Uint8Array) {\n                payload.set(instance['").concat(prop, "'], ").concat(o, ");\n              }\n            ");
                    }
                    break;
                case 'var_len_hex':
                    fnBody += "\n            if (typeof instance['".concat(prop, "'] === 'string') {\n              const bytes = hexToBytes(instance['").concat(prop, "']);\n              payload[").concat(o, "] = bytes.length;\n              payload.set(bytes, ").concat(o, " + 1);\n            } else {\n              payload[").concat(o, "] = 0;\n            }\n          ");
                    break;
                case 'bit':
                    fnBody += "\n            if (instance['".concat(prop, "']) {\n              payload[").concat(o, "] |= (1 << ").concat(field.bitIndex, ");\n            } else {\n              payload[").concat(o, "] &= ~(1 << ").concat(field.bitIndex, ");\n            }\n          ");
                    break;
            }
        }
        fnBody += "return payload;\n";
        return new Function('instance', 'BoksProtocolError', 'BoksProtocolErrorId', 'BoksExpectedReason', 'hexToBytes', fnBody);
    };
    /**
     * Parses a payload directly into an object mapping using the JIT compiled function.
     *
     * @param targetClass The class constructor (e.g., OpenDoorPacket)
     * @param payload The raw buffer
     * @returns A mapped object containing the extracted properties
     */
    /* eslint-disable-next-line @typescript-eslint/no-unsafe-function-type */
    PayloadMapper.parse = function (targetClass, payload) {
        if (typeof payload === 'string') {
            throw new BoksProtocolError_1.BoksProtocolError(BoksProtocolError_1.BoksProtocolErrorId.INVALID_TYPE, 'Payload must be a Uint8Array', { received: 'string', expected: 'Uint8Array' });
        }
        if (!targetClass || typeof targetClass !== 'function') {
            throw new BoksProtocolError_1.BoksProtocolError(BoksProtocolError_1.BoksProtocolErrorId.INVALID_TYPE, 'Invalid targetClass', {
                received: typeof targetClass,
                expected: 'function'
            });
        }
        if (!(payload instanceof Uint8Array)) {
            throw new BoksProtocolError_1.BoksProtocolError(BoksProtocolError_1.BoksProtocolErrorId.INVALID_TYPE, 'Payload must be a Uint8Array', { received: typeof payload, expected: 'Uint8Array' });
        }
        var parser = this.compiledParsers.get(targetClass);
        if (!parser) {
            parser = this.compileParser(targetClass);
            this.compiledParsers.set(targetClass, parser);
        }
        var result = parser(payload, BoksProtocolError_1.BoksProtocolError, BoksProtocolError_1.BoksProtocolErrorId, BoksExpectedReason_1.BoksExpectedReason, converters_1.bytesToHex);
        return result;
    };
    /**
     * Serializes an instance into a Uint8Array payload using the JIT compiled function.
     */
    PayloadMapper.serialize = function (instance) {
        if (!instance || typeof instance !== 'object') {
            throw new BoksProtocolError_1.BoksProtocolError(BoksProtocolError_1.BoksProtocolErrorId.INVALID_TYPE, 'Cannot serialize null or non-object instance', { received: typeof instance, expected: 'object' });
        }
        var targetClass = instance.constructor;
        if (!targetClass) {
            throw new BoksProtocolError_1.BoksProtocolError(BoksProtocolError_1.BoksProtocolErrorId.INTERNAL_ERROR, 'Cannot serialize instance without constructor', { received: 'undefined', expected: 'constructor' });
        }
        var serializer = this.compiledSerializers.get(targetClass);
        if (!serializer) {
            serializer = this.compileSerializer(targetClass);
            this.compiledSerializers.set(targetClass, serializer);
        }
        return serializer(instance, BoksProtocolError_1.BoksProtocolError, BoksProtocolError_1.BoksProtocolErrorId, BoksExpectedReason_1.BoksExpectedReason, converters_1.hexToBytes);
    };
    /**
     * Defines a raw payload schema without decorators (useful for internal/dynamic mapping or tests).
     */
    /**
     * Validates an instance's properties based on its decorator schema.
     */
    PayloadMapper.validate = function (instance) {
        var targetClass = instance.constructor;
        var validator = this.compiledValidators.get(targetClass);
        if (!validator) {
            validator = this.compileValidator(targetClass);
            this.compiledValidators.set(targetClass, validator);
        }
        validator(instance, BoksProtocolError_1.BoksProtocolError, BoksProtocolError_1.BoksProtocolErrorId, BoksExpectedReason_1.BoksExpectedReason);
    };
    PayloadMapper.defineSchema = function (targetClass, schema) {
        if (targetClass[Symbol.metadata]) {
            targetClass[Symbol.metadata][METADATA_KEY] = schema;
        }
        else {
            targetClass[METADATA_KEY] = schema;
            legacyMetadataMap.set(targetClass, schema);
        }
        // Clear any existing compiled functions for this class
        this.compiledParsers.delete(targetClass);
        this.compiledSerializers.delete(targetClass);
        this.compiledValidators.delete(targetClass);
    };
    // Cache of compiled parsing functions, keyed by Class Constructor
    PayloadMapper.compiledParsers = new WeakMap();
    // Cache of compiled serialization functions
    PayloadMapper.compiledSerializers = new WeakMap();
    PayloadMapper.compiledValidators = new WeakMap();
    return PayloadMapper;
}());
exports.PayloadMapper = PayloadMapper;
// --- Decorators ---
