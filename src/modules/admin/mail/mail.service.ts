import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailerService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendEmail(to: string, subject: string, text: string) {
    return await this.transporter.sendMail({
      from: '"Soul-Sync Mentoring Platform" jerihagbj@gmail.com',
      to,
      subject,
      text,
    });
  }
}
