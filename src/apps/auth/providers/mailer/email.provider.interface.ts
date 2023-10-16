export interface emailProviderInterface {
  sendMail(data): Promise<void>;
}