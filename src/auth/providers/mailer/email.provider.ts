import * as nodemailer from 'nodemailer';
import { emailProviderInterface } from './email.provider.interface';
import { Result } from '../../../core/application/result';

export class emailProvider implements emailProviderInterface {
  public async sendMail(data): Promise<Result<any>> {
    const transport = nodemailer.createTransport({
      host: process.env.NODEMAILER_HOST,
      port: process.env.NODEMAILER_PORT,
      secure: false,
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });

    const info = {
      from: 'Hey <abc@gmail.com>',
      to: data.to,
      subject: data.subject,
      text: data.text,
      html: data.html,
    };

    await transport.sendMail(info, (err, info) => {
      if (err) {
        return err;
      } else {
        return info;
      }
    });

    return Result.ok<any>({
      message: 'Email sent successfully',
    });
  }
}
