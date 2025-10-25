export interface EmailProvider {
  send(to: string, subject: string, body: string): Promise<void>;
}

class ConsoleEmailProvider implements EmailProvider {
  async send(to: string, subject: string, body: string): Promise<void> {
    console.log(`--- Email to ${to} ---`);
    console.log(`Subject: ${subject}`);
    console.log(body);
    console.log("--------------------");
  }
}

// In a real app, you would have a SendGridEmailProvider and select based on config.
export const emailProvider: EmailProvider = new ConsoleEmailProvider();