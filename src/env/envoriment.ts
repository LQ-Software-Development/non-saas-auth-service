export {};

// Here we declare the members of the process.env object, so that we
// can use them in our application code in a type-safe manner.
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MONGO_URL: string;
      AUTH_URL: number;
      NODEMAILER_HOST: string;
      NODEMAILER_PORT: number;
      NODEMAILER_USER: string;
      NODEMAILER_PASSWORD: string;
    }
  }
}
