import { Result } from "src/core/application/result";

export interface emailProviderInterface {
  sendMail(data): Promise<Result<any>>;
}