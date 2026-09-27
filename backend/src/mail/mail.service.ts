import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private from!: string;

  onModuleInit(): void {
    const host = process.env.MAIL_HOST;
    const user = process.env.MAIL_USER;
    const pass = process.env.MAIL_PASS;
    // Pas de SMTP de repli : un mail (ex: lien de suppression de compte) ne
    // doit jamais partir vers une boîte de test lisible par d'autres.
    if (!host || !user || !pass) {
      this.logger.warn('MAIL_HOST/MAIL_USER/MAIL_PASS not set: emails are disabled');
      return;
    }

    this.from = process.env.MAIL_FROM ?? user;
    const port = Number(process.env.MAIL_PORT ?? 465);
    this.transporter = nodemailer.createTransport({
      host,
      port,
      // TLS implicite sur 465 (Gmail), STARTTLS sinon
      secure: port === 465,
      auth: { user, pass },
    });
  }

  async sendMail(options: {
    to: string;
    subject: string;
    text: string;
    html?: string;
  }): Promise<void> {
    if (!this.transporter) {
      throw new Error('Email is not configured (MAIL_HOST/MAIL_USER/MAIL_PASS missing)');
    }
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
