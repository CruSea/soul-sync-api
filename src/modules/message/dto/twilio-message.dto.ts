export class TwilioMessageDto {
  to: string; // Recipient WhatsApp number (e.g., "whatsapp:+123456789")
  from: string; // Twilio WhatsApp number
  body: string; // Message content
}
