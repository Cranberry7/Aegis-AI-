import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { EmailDto } from '../dtos/email.dto';
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from '@app/common/constants/common.constant';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly mailService: MailerService) {}

  async sendMail(mailPayload: EmailDto) {
    const { to, message, subject, reference } = mailPayload;

    try {
      await this.mailService.sendMail({
        to,
        subject: subject || `[SARVAHA AGENT] SUPPORT`,
        html: message,
      });
      this.logger.log(
        SUCCESS_MESSAGES.SUCCESSFUL_EMAIL_SENT,
        JSON.stringify(reference),
      );
    } catch (error) {
      this.logger.error(ERROR_MESSAGES.FAILED_TO_SEND_EMAIL, error);
    }

    return;
  }
}
