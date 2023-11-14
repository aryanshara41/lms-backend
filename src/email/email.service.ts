import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer/dist';

@Injectable()
export class EmailService {
  constructor(private emailService: MailerService) {}

  async sendMail(
    to: string,
    subject: string,
    template: string,
    context: object,
  ) {
    const sentMail = await this.emailService.sendMail({
      to,
      subject,
      template,
      context,
    });
    console.log(sentMail);
  }
}
