export const emailProvider = [
  {
    provide: 'EMAIL_PROVIDER',
    useValue: {
      transport: {
        host: process.env.NODEMAILER_HOST,
        port: process.env.NODEMAILER_PORT,
        auth: {
          user: process.env.NODEMAILER_USER,
          pass: process.env.NODEMAILER_PASSWORD,
        },
      },
    },
  },
];
