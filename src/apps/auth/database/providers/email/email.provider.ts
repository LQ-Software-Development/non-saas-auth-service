import * as nodemailer from 'nodemailer';

export const emailProvider = [
  {
    provide: 'EMAIL_PROVIDER',
    useValue: {
      transport: {
        host: process.env.NODEMAILER_HOST,
        port: process.env.NODEMAILER_PORT,
        secure: false,
        auth: {
          user: process.env.NODEMAILER_USER,
          pass: process.env.NODEMAILER_PASSWORD,
        },
      },
      defaults: {
        from: '',
      },
    },
  },
];

export const sendEmail = async (data) => {
  const transport = nodemailer.createTransport({
    host: process.env.NODEMAILER_HOST,
    port: process.env.NODEMAILER_PORT,
    secure: false,
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASSWORD,
    },
  });
  const info = await transport.sendMail({
    from: 'Hey <abc@gmail.com>',
    to: data.to,
    subject: data.subject,
    text: data.text,
    html: data.html,
  });
  console.log(info.messageId);
  console.log(nodemailer.getTestMessageUrl(info));
};
