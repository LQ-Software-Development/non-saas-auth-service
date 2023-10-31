import { emailProviderInterface } from './email.provider.interface';
export declare class emailProvider implements emailProviderInterface {
    sendMail(data: any): Promise<void>;
}
