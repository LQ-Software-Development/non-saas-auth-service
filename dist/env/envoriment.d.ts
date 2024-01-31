export {};
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
