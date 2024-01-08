import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;

    private delay = 1000 * 60 * 0.1; // 0.1 minutes
    private pendingEmailTimers: Map<string, NodeJS.Timeout> = new Map();

    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('EMAIL_HOST'),
            port: this.configService.get('EMAIL_PORT'),
            auth: {
                user: this.configService.get('EMAIL_USER'),
                pass: this.configService.get('EMAIL_PASS'),
            },
        });
    }

    async sendEmail(to: string, subject: string, html: string) {
        await this.transporter.sendMail({
            from: this.configService.get('EMAIL_USER'),
            to,
            subject,
            html,
        });
    }

    async sendEmailWithDelay(to: string, subject: string, html: string) {
        if (this.pendingEmailTimers.has(to)) {
            clearTimeout(this.pendingEmailTimers.get(to)!);
        }

        const timer = setTimeout(() => {
            this.sendEmail(to, subject, html);
            this.pendingEmailTimers.delete(to);
        }, this.delay);

        this.pendingEmailTimers.set(to, timer);
    }
}
