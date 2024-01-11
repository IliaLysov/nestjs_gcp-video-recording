import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { encryptString } from 'src/utils/crypto';
import { emailTemplates } from 'src/utils/emailTemplates';
import { getMainUrl } from 'src/utils/url';

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

    private createDeepLink(videoName: string): string {
        const videoToken = encryptString(videoName);
        return `${getMainUrl()}/download/${videoToken}`;
    }

    sendDeepLinkToEmail(email: string, videoName: string): void {
        const deepLink = this.createDeepLink(videoName);
        const html = emailTemplates.VIDEO_LINK(deepLink, email, email);
        this.sendEmailWithDelay(email, `Link to video from ${email}`, html);
    }
}
