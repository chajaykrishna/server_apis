import * as nodemailer from 'nodemailer';
import { join } from 'path';
import { Logger } from 'winston';
import config from '../config';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const EmailTemplate = require('email-templates');

export default class MailerService {
  private _transporter: nodemailer.Transporter;
  private logger: Logger;
  private isDev = process.env.NODE_ENV === 'development';

  constructor(logger: Logger) {
    this.logger = logger;
    this._transporter = nodemailer.createTransport({
      host: config.mailer.host,
      port: Number(config.mailer.port),
      pool: true,
      secure: config.mailer.secure === 'true', // use TLS
      auth: {
        user: config.mailer.username,
        pass: config.mailer.password,
      },
      logger: this.isDev,
      debug: this.isDev,
    });

    // verify the connection configuration
    this._transporter.verify((err, success) => {
      if (err) {
        logger.error('Error connecting to mail server--->%o', err);
      } else {
        logger.info('Mail server is ready to take our messages====>%s', success);
      }
    });
  }

  private async loadTemplateSendMail(templateName: string, contexts: any) {
    const template = new EmailTemplate({
      views: {
        options: {
          extension: 'ejs',
        },
      },
    });
    return new Promise((resolve, reject) => {
      template.render(join(__dirname, '../templates', templateName), contexts).then(resolve).catch(reject);
    });
  }

  async sendMail(to: string, subject: string, template: string, content?: string, data?: any, bcc = ''): Promise<void> {
    if (template) {
      const t: any = await this.loadTemplateSendMail(template, data);
      content = t;
    }
    const options: nodemailer.SendMailOptions = {
      from: config.mailer.fromAddress,
      to,
      subject: subject,
      html: content,
      bcc,
      attachments: data?.attachments,
    };

    return new Promise<void>((resolve: (msg: any) => void, reject: (err: Error) => void) => {
      this._transporter.sendMail(options, (error, info) => {
        if (error) {
          this.logger.error(`error: ${error}`);
          reject(error);
        } else {
          this.logger.info(`Message Sent
                    ${info.response}`);
          resolve(`Message Sent
                    ${info.response}`);
        }
      });
    });
  }
}
