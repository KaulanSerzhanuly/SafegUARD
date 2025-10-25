export async function summarize(text: string): Promise<string> {
  console.log("--- AI Summarization (Stub) ---");
  console.log(`Input text: ${text.substring(0, 50)}...`);
  const summary = `This is a stubbed summary of the incident. The full text is: "${text}".`;
  console.log(`Output summary: ${summary}`);
  console.log("---------------------------------");
  return Promise.resolve(summary);
}