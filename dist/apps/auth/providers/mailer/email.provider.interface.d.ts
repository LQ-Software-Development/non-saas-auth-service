export interface emailProviderInterface {
    sendMail(data: any): Promise<void>;
}
