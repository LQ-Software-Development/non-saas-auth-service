import { emailProviderInterface } from './email.provider.interface';
import { Result } from '../../../../core/application/result';
export declare class emailProvider implements emailProviderInterface {
    sendMail(data: any): Promise<Result<any>>;
}
