import { Module } from '@nestjs/common';
import { emailProvider } from './email.provider';

@Module({
  providers: [...emailProvider],
  exports: [...emailProvider],
})
export class EmailProviModuleder {}
