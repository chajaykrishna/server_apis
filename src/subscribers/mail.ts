import { EventSubscriber, On } from 'event-dispatch';
import { Container } from 'typedi';
import { Logger } from 'winston';
import MailerService from '../services/mailer';
import events from './events';

@EventSubscriber()
export default class MailSubscriber {
  @On(events.sendEmail)
  public async onSendEmail({
    to,
    subject,
    template,
    content = '',
    data = null,
  }: {
    to: string;
    subject: string;
    template: string;
    content: string;
    data: object;
  }) {
    const Logger: Logger = Container.get('logger');
    const mailerService: MailerService = Container.get('emailClient');

    try {
      Logger.info('Sending mail to---> %s, Subject----> %s', to, subject);
      await mailerService.sendMail(to, subject, template, content, data);
    } catch (e) {
      Logger.error(`🔥 Error on event ${events.sendEmail}: %o`, e);
    }
  }
}
