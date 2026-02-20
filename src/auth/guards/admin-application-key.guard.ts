import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AdminApplicationKeyGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();
        const applicationKey = request.headers['application-key'] as string;

        if (!applicationKey || applicationKey !== process.env.APPLICATION_KEY) {
            throw new ForbiddenException('Forbidden Resource');
        }

        return true;
    }
}
