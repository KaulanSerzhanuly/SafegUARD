"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.smsProvider = void 0;
class ConsoleSmsProvider {
    async send(to, body) {
        console.log(`--- SMS to ${to} ---`);
        console.log(body);
        console.log("--------------------");
    }
}
// In a real app, you would have a TwilioSmsProvider and select based on config.
exports.smsProvider = new ConsoleSmsProvider();
//# sourceMappingURL=sms.js.map