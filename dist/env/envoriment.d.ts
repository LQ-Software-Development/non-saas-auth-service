export {};
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            MONGO_URL: string;
            AUTH_URL: string;
            AUTH_PORT: number;
        }
    }
}
