"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateSHA256 = calculateSHA256;
exports.hashCode = hashCode;
const crypto_1 = require("crypto");
function calculateSHA256(data) {
    return (0, crypto_1.createHash)('sha256').update(data).digest('hex');
}
function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}
//# sourceMappingURL=hash.js.map