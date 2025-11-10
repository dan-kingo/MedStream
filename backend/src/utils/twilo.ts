// src/utils/twilio.ts
import Twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const fromPhone = process.env.TWILIO_PHONE_NUMBER!;

const client = Twilio(accountSid, authToken);

export const sendSms = async (to: string, body: string) => {
  try {
    const message = await client.messages.create({
      body,
      from: fromPhone,
      to,
    });
    console.log('SMS sent:', message.sid);
  } catch (error) {
    console.error('Failed to send SMS:', error);
  }
};
