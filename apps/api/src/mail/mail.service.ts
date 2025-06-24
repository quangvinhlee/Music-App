/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import * as ejs from 'ejs'; // For EJS rendering
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend'; // Resend API

type mailOptions = {
  email: string;
  subject: string;
  username: string;
  resetLink?: string;
  verificationCode?: string;
  templatePath: string; // Accept template file path
};

@Injectable()
export class MailService {
  private readonly resend: Resend;

  constructor(private readonly config: ConfigService) {
    this.resend = new Resend(this.config.get('RESEND_API'));
  }

  async sendMail({
    email,
    subject,
    username,
    verificationCode,
    templatePath,
    resetLink,
  }: mailOptions) {
    try {
      // Render the EJS template with the provided data
      const html = await ejs.renderFile(templatePath, {
        username,
        verificationCode: verificationCode || null,
        resetLink: resetLink || null,
      });

      // Send the email using Resend API with rendered HTML
      const { data, error } = await this.resend.emails.send({
        from: 'Music App <lequangvinh@tostudy.uk>',
        to: email,
        subject,
        html, // The rendered HTML content from EJS template
      });

      if (error) {
        console.error('Error sending email with Resend:', error);
        throw new Error('Failed to send email');
      }
    } catch (err) {
      console.error('Error rendering or sending email:', err);
      throw new Error('Failed to render or send email');
    }
  }
}
