"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailProvider = void 0;
class ConsoleEmailProvider {
    async send(to, subject, body) {
        console.log(`--- Email to ${to} ---`);
        console.log(`Subject: ${subject}`);
        console.log(body);
        console.log("--------------------");
    }
}
// In a real app, you would have a SendGridEmailProvider and select based on config.
exports.emailProvider = new ConsoleEmailProvider();
//# sourceMappingURL=email.js.map