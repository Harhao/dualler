"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCode = void 0;
var ErrorCode;
(function (ErrorCode) {
    ErrorCode[ErrorCode["SUCCESS"] = 0] = "SUCCESS";
    ErrorCode[ErrorCode["PARAM_INVALID"] = 10001] = "PARAM_INVALID";
    ErrorCode[ErrorCode["AUTH_FAILED"] = 10002] = "AUTH_FAILED";
    ErrorCode[ErrorCode["NOT_FOUND"] = 10003] = "NOT_FOUND";
    ErrorCode[ErrorCode["PERMISSION_DENIED"] = 10004] = "PERMISSION_DENIED";
    ErrorCode[ErrorCode["APP_NOT_FOUND"] = 20001] = "APP_NOT_FOUND";
    ErrorCode[ErrorCode["APP_ALREADY_EXISTS"] = 20002] = "APP_ALREADY_EXISTS";
    ErrorCode[ErrorCode["VERSION_EXISTS"] = 20003] = "VERSION_EXISTS";
    ErrorCode[ErrorCode["VERSION_NOT_FOUND"] = 20004] = "VERSION_NOT_FOUND";
    ErrorCode[ErrorCode["PACKAGE_UPLOAD_FAILED"] = 30001] = "PACKAGE_UPLOAD_FAILED";
    ErrorCode[ErrorCode["PACKAGE_TOO_LARGE"] = 30002] = "PACKAGE_TOO_LARGE";
    ErrorCode[ErrorCode["PACKAGE_VERIFY_FAILED"] = 30003] = "PACKAGE_VERIFY_FAILED";
    ErrorCode[ErrorCode["PATCH_GENERATE_FAILED"] = 30004] = "PATCH_GENERATE_FAILED";
    ErrorCode[ErrorCode["RELEASE_FORBIDDEN"] = 40001] = "RELEASE_FORBIDDEN";
    ErrorCode[ErrorCode["GRAY_CONFIG_INVALID"] = 40002] = "GRAY_CONFIG_INVALID";
    ErrorCode[ErrorCode["INTERNAL_ERROR"] = 99999] = "INTERNAL_ERROR";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
//# sourceMappingURL=error-codes.js.map