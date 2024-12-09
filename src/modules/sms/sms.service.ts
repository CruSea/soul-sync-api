import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SmsService {
    private readonly baseUrl = process.env.NEGARIT_BASE_URL; 
    private readonly bearerToken = process.env.NEGARIT_BEARER_TOKEN;

    /**
     * Fetch SMS Ports for Telegram Bots
     */
    async fetchSmsPorts(): Promise<any> {
        try {
            const response = await axios.get(`${this.baseUrl}/api/sms_ports/telegram_bots`, {
                headers: {
                    Authorization: `Bearer ${this.bearerToken}`,
                },
            });
            return response.data; // Return the API response
        } catch (error) {
            throw new HttpException(
                error.response?.data || 'Failed to fetch SMS ports',
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Send an SMS (example function)
     */
    async sendSms(phoneNumber: string, message: string): Promise<any> {
        try {
            const response = await axios.post(
                `${this.baseUrl}/api/sms`,
                { to: phoneNumber, message },
                {
                    headers: {
                        Authorization: `Bearer ${this.bearerToken}`,
                    },
                },
            );
            return response.data;
        } catch (error) {
            throw new HttpException(
                error.response?.data || 'Failed to send SMS',
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
