export interface SmsProvider {
  send(to: string, body: string): Promise<void>;
}

class ConsoleSmsProvider implements SmsProvider {
  async send(to: string, body: string): Promise<void> {
    console.log(`--- SMS to ${to} ---`);
    console.log(body);
    console.log("--------------------");
  }
}

// In a real app, you would have a TwilioSmsProvider and select based on config.
export const smsProvider: SmsProvider = new ConsoleSmsProvider();