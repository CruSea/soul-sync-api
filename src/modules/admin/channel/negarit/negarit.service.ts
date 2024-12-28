import { PrismaService } from 'src/modules/prisma/prisma.service';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as https from 'https';

export type MultipleSmsType = {
  id: string;
  message: string;
  phone: string; 
};

@Injectable()
export class NegaritService {
  constructor(private prisma: PrismaService) {}

  private readonly singleSmsUrl = 'https://api.negarit.net/api/api_request/sent_message';
  private readonly bulkSms = "https://api.negarit.net/api/api_request/sent_multiple_messages";
  private readonly allMessages = "https://api.negarit.net/api/api_request/received_messages";

  private async makeRequest(method: string, url: string, payload?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const options = {
        method,
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(data));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (payload) {
        req.write(JSON.stringify(payload));
      }

      req.end();
    });
  }

  async sendSms(apiKey: string, sentTo: string, message: string, campaignId: string): Promise<any> {
    try {
      const url = `${this.singleSmsUrl}?API_KEY=${apiKey}`;
      const payload = {
        API_KEY: apiKey,
        sent_to: sentTo,
        message: message,
        campaign_id: campaignId,
      };

      return await this.makeRequest('POST', url, payload);
    } catch (error) {
      console.error('Error sending SMS:', error.message);
      throw new HttpException('Failed to send SMS', HttpStatus.BAD_REQUEST);
    }
  }

  async sendMultipleSms(apiKey: string, data: MultipleSmsType[], campaignId: string): Promise<any> {
    try {
      const url = `${this.bulkSms}?API_KEY=${apiKey}`;
      const payload = {
        apiKey: apiKey,
        campaign_id: campaignId,
        messages: data,
      };

      return await this.makeRequest('POST', url, payload);
    } catch (error) {
      console.error('Error sending SMS:', error.message);
      throw new HttpException('Failed to send SMS', HttpStatus.BAD_REQUEST);
    }
  }

}
