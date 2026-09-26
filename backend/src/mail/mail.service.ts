import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter!: nodemailer.Transporter;
  private from!: string;

  onModuleInit(): void {
    this.from = process.env.MAIL_FROM ?? 'no-reply@transcendence.local';
    const port = Number(process.env.MAIL_PORT ?? 1025);
    const user = process.env.MAIL_USER;
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST ?? 'mailpit',
      port,
      // Implicit TLS on 465 (Gmail); Mailpit on 1025 is plaintext
      secure: port === 465,
      // Mailpit accepts anonymous SMTP; real providers need credentials
      auth: user ? { user, pass: process.env.MAIL_PASS } : undefined,
    });
  }

  async sendMail(options: {
    to: string;
    subject: string;
    text: string;
    html?: string;
  }): Promise<void> {
    await this.transporter.sendMail({
      from: this.from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    this.logger.log(`email sent to ${options.to}: "${options.subject}"`);
  }
}
