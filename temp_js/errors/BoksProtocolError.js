"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoksProtocolError = exports.BoksProtocolErrorId = void 0;
var BoksProtocolErrorId;
(function (BoksProtocolErrorId) {
    BoksProtocolErrorId["INVALID_PAYLOAD_LENGTH"] = "INVALID_PAYLOAD_LENGTH";
    BoksProtocolErrorId["INVALID_CONFIG_KEY"] = "INVALID_CONFIG_KEY";
    BoksProtocolErrorId["INVALID_VALUE"] = "INVALID_VALUE";
    BoksProtocolErrorId["MALFORMED_DATA"] = "MALFORMED_DATA";
    BoksProtocolErrorId["INVALID_PIN_FORMAT"] = "INVALID_PIN_FORMAT";
    BoksProtocolErrorId["INVALID_INDEX_RANGE"] = "INVALID_INDEX_RANGE";
    BoksProtocolErrorId["INVALID_SEED_LENGTH"] = "INVALID_SEED_LENGTH";
    BoksProtocolErrorId["INVALID_NFC_UID_FORMAT"] = "INVALID_NFC_UID_FORMAT";
    BoksProtocolErrorId["INTERNAL_ERROR"] = "INTERNAL_ERROR";
    BoksProtocolErrorId["CHECKSUM_MISMATCH"] = "CHECKSUM_MISMATCH";
    BoksProtocolErrorId["INVALID_TYPE"] = "INVALID_TYPE";
    BoksProtocolErrorId["MISSING_MANDATORY_FIELD"] = "MISSING_MANDATORY_FIELD";
    BoksProtocolErrorId["VALUE_OUT_OF_RANGE"] = "VALUE_OUT_OF_RANGE";
    BoksProtocolErrorId["BUFFER_OVERFLOW"] = "BUFFER_OVERFLOW";
    BoksProtocolErrorId["NOT_IMPLEMENTED"] = "NOT_IMPLEMENTED";
})(BoksProtocolErrorId || (exports.BoksProtocolErrorId = BoksProtocolErrorId = {}));
/**
 * Custom error for Boks Protocol (parsing, encoding, validation).
 */
var BoksProtocolError = /** @class */ (function (_super) {
    __extends(BoksProtocolError, _super);
    function BoksProtocolError(id, message, context) {
        var _this = _super.call(this, message || id) || this;
        _this.id = id;
        _this.context = context;
        _this.name = 'BoksProtocolError';
        return _this;
    }
    return BoksProtocolError;
}(Error));
exports.BoksProtocolError = BoksProtocolError;
