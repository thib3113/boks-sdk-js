"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var decorators_1 = require("@/protocol/decorators");
var BoksProtocolError_1 = require("@/errors/BoksProtocolError");
var ExhaustiveTestPacket = function () {
    var _a, _ExhaustiveTestPacket_u8_accessor_storage, _ExhaustiveTestPacket_u16_accessor_storage, _ExhaustiveTestPacket_u24_accessor_storage, _ExhaustiveTestPacket_u32_accessor_storage, _ExhaustiveTestPacket_bool_accessor_storage, _ExhaustiveTestPacket_bit0_accessor_storage, _ExhaustiveTestPacket_bit7_accessor_storage, _ExhaustiveTestPacket_hex2_accessor_storage, _ExhaustiveTestPacket_bytes2_accessor_storage, _ExhaustiveTestPacket_ascii4_accessor_storage, _ExhaustiveTestPacket_configKey_accessor_storage, _ExhaustiveTestPacket_pin_accessor_storage, _ExhaustiveTestPacket_mac_accessor_storage, _ExhaustiveTestPacket_varLenHex_accessor_storage;
    var _u8_decorators;
    var _u8_initializers = [];
    var _u8_extraInitializers = [];
    var _u16_decorators;
    var _u16_initializers = [];
    var _u16_extraInitializers = [];
    var _u24_decorators;
    var _u24_initializers = [];
    var _u24_extraInitializers = [];
    var _u32_decorators;
    var _u32_initializers = [];
    var _u32_extraInitializers = [];
    var _bool_decorators;
    var _bool_initializers = [];
    var _bool_extraInitializers = [];
    var _bit0_decorators;
    var _bit0_initializers = [];
    var _bit0_extraInitializers = [];
    var _bit7_decorators;
    var _bit7_initializers = [];
    var _bit7_extraInitializers = [];
    var _hex2_decorators;
    var _hex2_initializers = [];
    var _hex2_extraInitializers = [];
    var _bytes2_decorators;
    var _bytes2_initializers = [];
    var _bytes2_extraInitializers = [];
    var _ascii4_decorators;
    var _ascii4_initializers = [];
    var _ascii4_extraInitializers = [];
    var _configKey_decorators;
    var _configKey_initializers = [];
    var _configKey_extraInitializers = [];
    var _pin_decorators;
    var _pin_initializers = [];
    var _pin_extraInitializers = [];
    var _mac_decorators;
    var _mac_initializers = [];
    var _mac_extraInitializers = [];
    var _varLenHex_decorators;
    var _varLenHex_initializers = [];
    var _varLenHex_extraInitializers = [];
    return _a = /** @class */ (function () {
            function ExhaustiveTestPacket() {
                _ExhaustiveTestPacket_u8_accessor_storage.set(this, __runInitializers(this, _u8_initializers, void 0));
                _ExhaustiveTestPacket_u16_accessor_storage.set(this, (__runInitializers(this, _u8_extraInitializers), __runInitializers(this, _u16_initializers, void 0)));
                _ExhaustiveTestPacket_u24_accessor_storage.set(this, (__runInitializers(this, _u16_extraInitializers), __runInitializers(this, _u24_initializers, void 0)));
                _ExhaustiveTestPacket_u32_accessor_storage.set(this, (__runInitializers(this, _u24_extraInitializers), __runInitializers(this, _u32_initializers, void 0)));
                _ExhaustiveTestPacket_bool_accessor_storage.set(this, (__runInitializers(this, _u32_extraInitializers), __runInitializers(this, _bool_initializers, void 0)));
                _ExhaustiveTestPacket_bit0_accessor_storage.set(this, (__runInitializers(this, _bool_extraInitializers), __runInitializers(this, _bit0_initializers, void 0)));
                _ExhaustiveTestPacket_bit7_accessor_storage.set(this, (__runInitializers(this, _bit0_extraInitializers), __runInitializers(this, _bit7_initializers, void 0)));
                _ExhaustiveTestPacket_hex2_accessor_storage.set(this, (__runInitializers(this, _bit7_extraInitializers), __runInitializers(this, _hex2_initializers, void 0)));
                _ExhaustiveTestPacket_bytes2_accessor_storage.set(this, (__runInitializers(this, _hex2_extraInitializers), __runInitializers(this, _bytes2_initializers, void 0)));
                _ExhaustiveTestPacket_ascii4_accessor_storage.set(this, (__runInitializers(this, _bytes2_extraInitializers), __runInitializers(this, _ascii4_initializers, void 0)));
                _ExhaustiveTestPacket_configKey_accessor_storage.set(this, (__runInitializers(this, _ascii4_extraInitializers), __runInitializers(this, _configKey_initializers, void 0)));
                _ExhaustiveTestPacket_pin_accessor_storage.set(this, (__runInitializers(this, _configKey_extraInitializers), __runInitializers(this, _pin_initializers, void 0)));
                _ExhaustiveTestPacket_mac_accessor_storage.set(this, (__runInitializers(this, _pin_extraInitializers), __runInitializers(this, _mac_initializers, void 0)));
                _ExhaustiveTestPacket_varLenHex_accessor_storage.set(this, (__runInitializers(this, _mac_extraInitializers), __runInitializers(this, _varLenHex_initializers, void 0)));
                __runInitializers(this, _varLenHex_extraInitializers);
            }
            Object.defineProperty(ExhaustiveTestPacket.prototype, "u8", {
                get: function () { return __classPrivateFieldGet(this, _ExhaustiveTestPacket_u8_accessor_storage, "f"); },
                set: function (value) { __classPrivateFieldSet(this, _ExhaustiveTestPacket_u8_accessor_storage, value, "f"); },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ExhaustiveTestPacket.prototype, "u16", {
                get: function () { return __classPrivateFieldGet(this, _ExhaustiveTestPacket_u16_accessor_storage, "f"); },
                set: function (value) { __classPrivateFieldSet(this, _ExhaustiveTestPacket_u16_accessor_storage, value, "f"); },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ExhaustiveTestPacket.prototype, "u24", {
                get: function () { return __classPrivateFieldGet(this, _ExhaustiveTestPacket_u24_accessor_storage, "f"); },
                set: function (value) { __classPrivateFieldSet(this, _ExhaustiveTestPacket_u24_accessor_storage, value, "f"); },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ExhaustiveTestPacket.prototype, "u32", {
                get: function () { return __classPrivateFieldGet(this, _ExhaustiveTestPacket_u32_accessor_storage, "f"); },
                set: function (value) { __classPrivateFieldSet(this, _ExhaustiveTestPacket_u32_accessor_storage, value, "f"); },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ExhaustiveTestPacket.prototype, "bool", {
                get: function () { return __classPrivateFieldGet(this, _ExhaustiveTestPacket_bool_accessor_storage, "f"); },
                set: function (value) { __classPrivateFieldSet(this, _ExhaustiveTestPacket_bool_accessor_storage, value, "f"); },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ExhaustiveTestPacket.prototype, "bit0", {
                get: function () { return __classPrivateFieldGet(this, _ExhaustiveTestPacket_bit0_accessor_storage, "f"); },
                set: function (value) { __classPrivateFieldSet(this, _ExhaustiveTestPacket_bit0_accessor_storage, value, "f"); },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ExhaustiveTestPacket.prototype, "bit7", {
                get: function () { return __classPrivateFieldGet(this, _ExhaustiveTestPacket_bit7_accessor_storage, "f"); },
                set: function (value) { __classPrivateFieldSet(this, _ExhaustiveTestPacket_bit7_accessor_storage, value, "f"); },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ExhaustiveTestPacket.prototype, "hex2", {
                get: function () { return __classPrivateFieldGet(this, _ExhaustiveTestPacket_hex2_accessor_storage, "f"); },
                set: function (value) { __classPrivateFieldSet(this, _ExhaustiveTestPacket_hex2_accessor_storage, value, "f"); },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ExhaustiveTestPacket.prototype, "bytes2", {
                get: function () { return __classPrivateFieldGet(this, _ExhaustiveTestPacket_bytes2_accessor_storage, "f"); },
                set: function (value) { __classPrivateFieldSet(this, _ExhaustiveTestPacket_bytes2_accessor_storage, value, "f"); },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ExhaustiveTestPacket.prototype, "ascii4", {
                get: function () { return __classPrivateFieldGet(this, _ExhaustiveTestPacket_ascii4_accessor_storage, "f"); },
                set: function (value) { __classPrivateFieldSet(this, _ExhaustiveTestPacket_ascii4_accessor_storage, value, "f"); },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ExhaustiveTestPacket.prototype, "configKey", {
                get: function () { return __classPrivateFieldGet(this, _ExhaustiveTestPacket_configKey_accessor_storage, "f"); },
                set: function (value) { __classPrivateFieldSet(this, _ExhaustiveTestPacket_configKey_accessor_storage, value, "f"); },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ExhaustiveTestPacket.prototype, "pin", {
                get: function () { return __classPrivateFieldGet(this, _ExhaustiveTestPacket_pin_accessor_storage, "f"); },
                set: function (value) { __classPrivateFieldSet(this, _ExhaustiveTestPacket_pin_accessor_storage, value, "f"); },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ExhaustiveTestPacket.prototype, "mac", {
                get: function () { return __classPrivateFieldGet(this, _ExhaustiveTestPacket_mac_accessor_storage, "f"); },
                set: function (value) { __classPrivateFieldSet(this, _ExhaustiveTestPacket_mac_accessor_storage, value, "f"); },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ExhaustiveTestPacket.prototype, "varLenHex", {
                get: function () { return __classPrivateFieldGet(this, _ExhaustiveTestPacket_varLenHex_accessor_storage, "f"); },
                set: function (value) { __classPrivateFieldSet(this, _ExhaustiveTestPacket_varLenHex_accessor_storage, value, "f"); },
                enumerable: false,
                configurable: true
            });
            return ExhaustiveTestPacket;
        }()),
        _ExhaustiveTestPacket_u8_accessor_storage = new WeakMap(),
        _ExhaustiveTestPacket_u16_accessor_storage = new WeakMap(),
        _ExhaustiveTestPacket_u24_accessor_storage = new WeakMap(),
        _ExhaustiveTestPacket_u32_accessor_storage = new WeakMap(),
        _ExhaustiveTestPacket_bool_accessor_storage = new WeakMap(),
        _ExhaustiveTestPacket_bit0_accessor_storage = new WeakMap(),
        _ExhaustiveTestPacket_bit7_accessor_storage = new WeakMap(),
        _ExhaustiveTestPacket_hex2_accessor_storage = new WeakMap(),
        _ExhaustiveTestPacket_bytes2_accessor_storage = new WeakMap(),
        _ExhaustiveTestPacket_ascii4_accessor_storage = new WeakMap(),
        _ExhaustiveTestPacket_configKey_accessor_storage = new WeakMap(),
        _ExhaustiveTestPacket_pin_accessor_storage = new WeakMap(),
        _ExhaustiveTestPacket_mac_accessor_storage = new WeakMap(),
        _ExhaustiveTestPacket_varLenHex_accessor_storage = new WeakMap(),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _u8_decorators = [(0, decorators_1.PayloadUint8)(0)];
            _u16_decorators = [(0, decorators_1.PayloadUint16)(1)];
            _u24_decorators = [(0, decorators_1.PayloadUint24)(3)];
            _u32_decorators = [(0, decorators_1.PayloadUint32)(6)];
            _bool_decorators = [(0, decorators_1.PayloadBoolean)(10)];
            _bit0_decorators = [(0, decorators_1.PayloadBit)(11, 0)];
            _bit7_decorators = [(0, decorators_1.PayloadBit)(11, 7)];
            _hex2_decorators = [(0, decorators_1.PayloadHexString)(12, 2)];
            _bytes2_decorators = [(0, decorators_1.PayloadByteArray)(14, 2)];
            _ascii4_decorators = [(0, decorators_1.PayloadAsciiString)(16, 4)];
            _configKey_decorators = [(0, decorators_1.PayloadConfigKey)(20)];
            _pin_decorators = [(0, decorators_1.PayloadPinCode)(28)];
            _mac_decorators = [(0, decorators_1.PayloadMacAddress)(34)];
            _varLenHex_decorators = [(0, decorators_1.PayloadVarLenHex)(40)];
            __esDecorate(_a, null, _u8_decorators, { kind: "accessor", name: "u8", static: false, private: false, access: { has: function (obj) { return "u8" in obj; }, get: function (obj) { return obj.u8; }, set: function (obj, value) { obj.u8 = value; } }, metadata: _metadata }, _u8_initializers, _u8_extraInitializers);
            __esDecorate(_a, null, _u16_decorators, { kind: "accessor", name: "u16", static: false, private: false, access: { has: function (obj) { return "u16" in obj; }, get: function (obj) { return obj.u16; }, set: function (obj, value) { obj.u16 = value; } }, metadata: _metadata }, _u16_initializers, _u16_extraInitializers);
            __esDecorate(_a, null, _u24_decorators, { kind: "accessor", name: "u24", static: false, private: false, access: { has: function (obj) { return "u24" in obj; }, get: function (obj) { return obj.u24; }, set: function (obj, value) { obj.u24 = value; } }, metadata: _metadata }, _u24_initializers, _u24_extraInitializers);
            __esDecorate(_a, null, _u32_decorators, { kind: "accessor", name: "u32", static: false, private: false, access: { has: function (obj) { return "u32" in obj; }, get: function (obj) { return obj.u32; }, set: function (obj, value) { obj.u32 = value; } }, metadata: _metadata }, _u32_initializers, _u32_extraInitializers);
            __esDecorate(_a, null, _bool_decorators, { kind: "accessor", name: "bool", static: false, private: false, access: { has: function (obj) { return "bool" in obj; }, get: function (obj) { return obj.bool; }, set: function (obj, value) { obj.bool = value; } }, metadata: _metadata }, _bool_initializers, _bool_extraInitializers);
            __esDecorate(_a, null, _bit0_decorators, { kind: "accessor", name: "bit0", static: false, private: false, access: { has: function (obj) { return "bit0" in obj; }, get: function (obj) { return obj.bit0; }, set: function (obj, value) { obj.bit0 = value; } }, metadata: _metadata }, _bit0_initializers, _bit0_extraInitializers);
            __esDecorate(_a, null, _bit7_decorators, { kind: "accessor", name: "bit7", static: false, private: false, access: { has: function (obj) { return "bit7" in obj; }, get: function (obj) { return obj.bit7; }, set: function (obj, value) { obj.bit7 = value; } }, metadata: _metadata }, _bit7_initializers, _bit7_extraInitializers);
            __esDecorate(_a, null, _hex2_decorators, { kind: "accessor", name: "hex2", static: false, private: false, access: { has: function (obj) { return "hex2" in obj; }, get: function (obj) { return obj.hex2; }, set: function (obj, value) { obj.hex2 = value; } }, metadata: _metadata }, _hex2_initializers, _hex2_extraInitializers);
            __esDecorate(_a, null, _bytes2_decorators, { kind: "accessor", name: "bytes2", static: false, private: false, access: { has: function (obj) { return "bytes2" in obj; }, get: function (obj) { return obj.bytes2; }, set: function (obj, value) { obj.bytes2 = value; } }, metadata: _metadata }, _bytes2_initializers, _bytes2_extraInitializers);
            __esDecorate(_a, null, _ascii4_decorators, { kind: "accessor", name: "ascii4", static: false, private: false, access: { has: function (obj) { return "ascii4" in obj; }, get: function (obj) { return obj.ascii4; }, set: function (obj, value) { obj.ascii4 = value; } }, metadata: _metadata }, _ascii4_initializers, _ascii4_extraInitializers);
            __esDecorate(_a, null, _configKey_decorators, { kind: "accessor", name: "configKey", static: false, private: false, access: { has: function (obj) { return "configKey" in obj; }, get: function (obj) { return obj.configKey; }, set: function (obj, value) { obj.configKey = value; } }, metadata: _metadata }, _configKey_initializers, _configKey_extraInitializers);
            __esDecorate(_a, null, _pin_decorators, { kind: "accessor", name: "pin", static: false, private: false, access: { has: function (obj) { return "pin" in obj; }, get: function (obj) { return obj.pin; }, set: function (obj, value) { obj.pin = value; } }, metadata: _metadata }, _pin_initializers, _pin_extraInitializers);
            __esDecorate(_a, null, _mac_decorators, { kind: "accessor", name: "mac", static: false, private: false, access: { has: function (obj) { return "mac" in obj; }, get: function (obj) { return obj.mac; }, set: function (obj, value) { obj.mac = value; } }, metadata: _metadata }, _mac_initializers, _mac_extraInitializers);
            __esDecorate(_a, null, _varLenHex_decorators, { kind: "accessor", name: "varLenHex", static: false, private: false, access: { has: function (obj) { return "varLenHex" in obj; }, get: function (obj) { return obj.varLenHex; }, set: function (obj, value) { obj.varLenHex = value; } }, metadata: _metadata }, _varLenHex_initializers, _varLenHex_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
var DecoratorSetterPacket = function () {
    var _a, _DecoratorSetterPacket_hex_accessor_storage, _DecoratorSetterPacket_uid_accessor_storage, _DecoratorSetterPacket_ck_accessor_storage, _DecoratorSetterPacket_index_accessor_storage, _DecoratorSetterPacket_bool_accessor_storage;
    var _hex_decorators;
    var _hex_initializers = [];
    var _hex_extraInitializers = [];
    var _uid_decorators;
    var _uid_initializers = [];
    var _uid_extraInitializers = [];
    var _ck_decorators;
    var _ck_initializers = [];
    var _ck_extraInitializers = [];
    var _index_decorators;
    var _index_initializers = [];
    var _index_extraInitializers = [];
    var _bool_decorators;
    var _bool_initializers = [];
    var _bool_extraInitializers = [];
    return _a = /** @class */ (function () {
            function DecoratorSetterPacket() {
                _DecoratorSetterPacket_hex_accessor_storage.set(this, __runInitializers(this, _hex_initializers, void 0));
                _DecoratorSetterPacket_uid_accessor_storage.set(this, (__runInitializers(this, _hex_extraInitializers), __runInitializers(this, _uid_initializers, void 0)));
                _DecoratorSetterPacket_ck_accessor_storage.set(this, (__runInitializers(this, _uid_extraInitializers), __runInitializers(this, _ck_initializers, void 0)));
                _DecoratorSetterPacket_index_accessor_storage.set(this, (__runInitializers(this, _ck_extraInitializers), __runInitializers(this, _index_initializers, void 0)));
                _DecoratorSetterPacket_bool_accessor_storage.set(this, (__runInitializers(this, _index_extraInitializers), __runInitializers(this, _bool_initializers, void 0)));
                __runInitializers(this, _bool_extraInitializers);
            }
            Object.defineProperty(DecoratorSetterPacket.prototype, "hex", {
                get: function () { return __classPrivateFieldGet(this, _DecoratorSetterPacket_hex_accessor_storage, "f"); },
                set: function (value) { __classPrivateFieldSet(this, _DecoratorSetterPacket_hex_accessor_storage, value, "f"); },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(DecoratorSetterPacket.prototype, "uid", {
                get: function () { return __classPrivateFieldGet(this, _DecoratorSetterPacket_uid_accessor_storage, "f"); },
                set: function (value) { __classPrivateFieldSet(this, _DecoratorSetterPacket_uid_accessor_storage, value, "f"); },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(DecoratorSetterPacket.prototype, "ck", {
                get: function () { return __classPrivateFieldGet(this, _DecoratorSetterPacket_ck_accessor_storage, "f"); },
                set: function (value) { __classPrivateFieldSet(this, _DecoratorSetterPacket_ck_accessor_storage, value, "f"); },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(DecoratorSetterPacket.prototype, "index", {
                get: function () { return __classPrivateFieldGet(this, _DecoratorSetterPacket_index_accessor_storage, "f"); },
                set: function (value) { __classPrivateFieldSet(this, _DecoratorSetterPacket_index_accessor_storage, value, "f"); },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(DecoratorSetterPacket.prototype, "bool", {
                get: function () { return __classPrivateFieldGet(this, _DecoratorSetterPacket_bool_accessor_storage, "f"); },
                set: function (value) { __classPrivateFieldSet(this, _DecoratorSetterPacket_bool_accessor_storage, value, "f"); },
                enumerable: false,
                configurable: true
            });
            return DecoratorSetterPacket;
        }()),
        _DecoratorSetterPacket_hex_accessor_storage = new WeakMap(),
        _DecoratorSetterPacket_uid_accessor_storage = new WeakMap(),
        _DecoratorSetterPacket_ck_accessor_storage = new WeakMap(),
        _DecoratorSetterPacket_index_accessor_storage = new WeakMap(),
        _DecoratorSetterPacket_bool_accessor_storage = new WeakMap(),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _hex_decorators = [(0, decorators_1.PayloadHexString)(0, 2)];
            _uid_decorators = [(0, decorators_1.PayloadNfcUid)(2)];
            _ck_decorators = [(0, decorators_1.PayloadConfigKey)(10)];
            _index_decorators = [(0, decorators_1.PayloadMasterCodeIndex)(18)];
            _bool_decorators = [(0, decorators_1.PayloadBoolean)(19)];
            __esDecorate(_a, null, _hex_decorators, { kind: "accessor", name: "hex", static: false, private: false, access: { has: function (obj) { return "hex" in obj; }, get: function (obj) { return obj.hex; }, set: function (obj, value) { obj.hex = value; } }, metadata: _metadata }, _hex_initializers, _hex_extraInitializers);
            __esDecorate(_a, null, _uid_decorators, { kind: "accessor", name: "uid", static: false, private: false, access: { has: function (obj) { return "uid" in obj; }, get: function (obj) { return obj.uid; }, set: function (obj, value) { obj.uid = value; } }, metadata: _metadata }, _uid_initializers, _uid_extraInitializers);
            __esDecorate(_a, null, _ck_decorators, { kind: "accessor", name: "ck", static: false, private: false, access: { has: function (obj) { return "ck" in obj; }, get: function (obj) { return obj.ck; }, set: function (obj, value) { obj.ck = value; } }, metadata: _metadata }, _ck_initializers, _ck_extraInitializers);
            __esDecorate(_a, null, _index_decorators, { kind: "accessor", name: "index", static: false, private: false, access: { has: function (obj) { return "index" in obj; }, get: function (obj) { return obj.index; }, set: function (obj, value) { obj.index = value; } }, metadata: _metadata }, _index_initializers, _index_extraInitializers);
            __esDecorate(_a, null, _bool_decorators, { kind: "accessor", name: "bool", static: false, private: false, access: { has: function (obj) { return "bool" in obj; }, get: function (obj) { return obj.bool; }, set: function (obj, value) { obj.bool = value; } }, metadata: _metadata }, _bool_initializers, _bool_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
var EmptyPacket = /** @class */ (function () {
    function EmptyPacket() {
    }
    return EmptyPacket;
}());
(0, vitest_1.describe)('PayloadMapper Exhaustive Coverage', function () {
    (0, vitest_1.it)('should parse all types correctly', function () {
        var payload = new Uint8Array(50);
        payload[0] = 0xFE; // uint8
        payload[1] = 0x12;
        payload[2] = 0x34; // uint16 = 0x1234
        payload[3] = 0x12;
        payload[4] = 0x34;
        payload[5] = 0x56; // uint24 = 0x123456
        payload[6] = 0x12;
        payload[7] = 0x34;
        payload[8] = 0x56;
        payload[9] = 0x78; // uint32 = 0x12345678
        payload[10] = 0x01; // boolean true
        payload[11] = 0x81; // bit0=true, bit7=true (10000001)
        payload[12] = 0xAA;
        payload[13] = 0xBB; // hex2 = AABB
        payload[14] = 0x01;
        payload[15] = 0x02; // bytes2
        // ascii4 "BOKS"
        payload[16] = 66;
        payload[17] = 79;
        payload[18] = 75;
        payload[19] = 83;
        // configKey "12345678"
        var ck = "12345678";
        for (var i = 0; i < 8; i++)
            payload[20 + i] = ck.charCodeAt(i);
        // pin "123456"
        var pin = "123456";
        for (var i = 0; i < 6; i++)
            payload[28 + i] = pin.charCodeAt(i);
        // mac "001122334455" -> expected 55:44:33:22:11:00 due to reverse order in JIT
        var mac = [0x00, 0x11, 0x22, 0x33, 0x44, 0x55];
        for (var i = 0; i < 6; i++)
            payload[34 + i] = mac[i];
        // varLenHex: len 2, data AABB
        payload[40] = 2;
        payload[41] = 0xAA;
        payload[42] = 0xBB;
        var result = decorators_1.PayloadMapper.parse(ExhaustiveTestPacket, payload.slice(0, 43));
        (0, vitest_1.expect)(result.u8).toBe(0xFE);
        (0, vitest_1.expect)(result.u16).toBe(0x1234);
        (0, vitest_1.expect)(result.u24).toBe(0x123456);
        (0, vitest_1.expect)(result.u32).toBe(0x12345678);
        (0, vitest_1.expect)(result.bool).toBe(true);
        (0, vitest_1.expect)(result.bit0).toBe(true);
        (0, vitest_1.expect)(result.bit7).toBe(true);
        (0, vitest_1.expect)(result.hex2).toBe('AABB');
        (0, vitest_1.expect)(result.bytes2).toEqual(new Uint8Array([0x01, 0x02]));
        (0, vitest_1.expect)(result.ascii4).toBe('BOKS');
        (0, vitest_1.expect)(result.configKey).toBe('12345678');
        (0, vitest_1.expect)(result.pin).toBe('123456');
        (0, vitest_1.expect)(result.mac).toBe('554433221100');
        (0, vitest_1.expect)(result.varLenHex).toBe('AABB');
    });
    (0, vitest_1.it)('should hit all decorator setters and their validation', function () {
        var inst = new DecoratorSetterPacket();
        inst.hex = 'AABB';
        inst.uid = '00:11:22:33:44:55:66';
        inst.ck = '12345678';
        inst.index = 5;
        inst.bool = true;
        (0, vitest_1.expect)(inst.hex).toBe('AABB');
        (0, vitest_1.expect)(inst.index).toBe(5);
        // @ts-expect-error - Testing invalid input
        (0, vitest_1.expect)(function () { inst.hex = null; }).toThrow(BoksProtocolError_1.BoksProtocolError);
        // @ts-expect-error - Testing invalid input
        (0, vitest_1.expect)(function () { inst.uid = null; }).toThrow(BoksProtocolError_1.BoksProtocolError);
        // @ts-expect-error - Testing invalid input
        (0, vitest_1.expect)(function () { inst.ck = null; }).toThrow(BoksProtocolError_1.BoksProtocolError);
        // @ts-expect-error - Testing invalid input
        (0, vitest_1.expect)(function () { inst.index = null; }).toThrow(BoksProtocolError_1.BoksProtocolError);
        // @ts-expect-error - Testing invalid input
        (0, vitest_1.expect)(function () { inst.bool = null; }).toThrow(BoksProtocolError_1.BoksProtocolError);
    });
    (0, vitest_1.it)('should throw on invalid bitIndex', function () {
        (0, vitest_1.expect)(function () {
            var InvalidBit = function () {
                var _a, _InvalidBit_bit_accessor_storage;
                var _bit_decorators;
                var _bit_initializers = [];
                var _bit_extraInitializers = [];
                return _a = /** @class */ (function () {
                        function InvalidBit() {
                            _InvalidBit_bit_accessor_storage.set(this, __runInitializers(this, _bit_initializers, void 0));
                            __runInitializers(this, _bit_extraInitializers);
                        }
                        Object.defineProperty(InvalidBit.prototype, "bit", {
                            get: function () { return __classPrivateFieldGet(this, _InvalidBit_bit_accessor_storage, "f"); },
                            set: function (value) { __classPrivateFieldSet(this, _InvalidBit_bit_accessor_storage, value, "f"); },
                            enumerable: false,
                            configurable: true
                        });
                        return InvalidBit;
                    }()),
                    _InvalidBit_bit_accessor_storage = new WeakMap(),
                    (function () {
                        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
                        _bit_decorators = [(0, decorators_1.PayloadBit)(0, 8)];
                        __esDecorate(_a, null, _bit_decorators, { kind: "accessor", name: "bit", static: false, private: false, access: { has: function (obj) { return "bit" in obj; }, get: function (obj) { return obj.bit; }, set: function (obj, value) { obj.bit = value; } }, metadata: _metadata }, _bit_initializers, _bit_extraInitializers);
                        if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    })(),
                    _a;
            }();
            return new InvalidBit();
        }).toThrow();
    });
    (0, vitest_1.it)('should validate empty class correctly', function () {
        var inst = new EmptyPacket();
        decorators_1.PayloadMapper.validate(inst); // hit line 478
    });
    (0, vitest_1.it)('should serialize all types correctly', function () {
        var inst = new ExhaustiveTestPacket();
        inst.u8 = 0xFE;
        inst.u16 = 0x1234;
        inst.u24 = 0x123456;
        inst.u32 = 0x12345678;
        inst.bool = true;
        inst.bit0 = true;
        inst.bit7 = true;
        inst.hex2 = 'AABB';
        inst.bytes2 = new Uint8Array([0x01, 0x02]);
        inst.ascii4 = 'BOKS';
        inst.configKey = '12345678';
        inst.pin = '123456';
        inst.mac = '00:11:22:33:44:55';
        inst.varLenHex = 'AABB';
        var payload = decorators_1.PayloadMapper.serialize(inst);
        (0, vitest_1.expect)(payload[0]).toBe(0xFE);
        (0, vitest_1.expect)(payload[1]).toBe(0x12);
        (0, vitest_1.expect)(payload[2]).toBe(0x34);
        (0, vitest_1.expect)(payload[10]).toBe(0x01);
        (0, vitest_1.expect)(payload[11]).toBe(0x81);
        (0, vitest_1.expect)(payload[12]).toBe(0xAA);
        (0, vitest_1.expect)(payload[13]).toBe(0xBB);
        (0, vitest_1.expect)(payload[16]).toBe(66);
        (0, vitest_1.expect)(payload[20]).toBe(49); // '1'
        (0, vitest_1.expect)(payload[28]).toBe(49); // '1'
        (0, vitest_1.expect)(payload[40]).toBe(2);
        (0, vitest_1.expect)(payload[41]).toBe(0xAA);
    });
});
