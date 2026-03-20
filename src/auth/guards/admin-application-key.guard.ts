import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AdminApplicationKeyGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const applicationKey = request.headers['application-key'] as string;

        // Deprecated: accept valid application-key
        if (applicationKey && applicationKey === process.env.APPLICATION_KEY) {
            console.warn('Application key for admin routes is deprecated. Use superuser authentication instead.');
            return true;
        }

        // Check JWT for superuser
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        if (!token || type !== 'Bearer') {
            throw new UnauthorizedException('Authentication required');
        }

        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET,
            });

            if (payload.superuser !== true) {
                throw new ForbiddenException('Superuser access required');
            }

            request['user'] = payload;
            return true;
        } catch (error) {
            if (error instanceof ForbiddenException) {
                throw error;
            }
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}
