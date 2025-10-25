"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.summarize = summarize;
async function summarize(text) {
    console.log("--- AI Summarization (Stub) ---");
    console.log(`Input text: ${text.substring(0, 50)}...`);
    const summary = `This is a stubbed summary of the incident. The full text is: "${text}".`;
    console.log(`Output summary: ${summary}`);
    console.log("---------------------------------");
    return Promise.resolve(summary);
}
//# sourceMappingURL=llm.js.map