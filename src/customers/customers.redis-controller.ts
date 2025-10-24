// auth/src/redis/redis-sub.controller.ts
import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { UpsertCustomerUserService } from './services/upsert-customer-user.service';


@Controller()
export class CustomersRedisController {
    constructor(
        private readonly upsertCustomerUserService: UpsertCustomerUserService,
    ) { }

    @EventPattern('customer.created')
    async handleClienteCriado(data: any) {
        if (process.env.CUSTOMER_USER_INTEGRATION_ENABLED !== 'true') {
            return;
        }
        console.log('Evento recebido - Cliente Criado');

        await this.upsertCustomerUserService.execute(data);
    }

    @EventPattern('customer.updated')
    async handleClienteAtualizado(data: any) {
        if (process.env.CUSTOMER_USER_INTEGRATION_ENABLED !== 'true') {
            return;
        }
        console.log('Evento recebido - Cliente Atualizado');

        await this.upsertCustomerUserService.execute(data);
    }
}