import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';
import { RedisService } from './redis.service';
import { REDIS_CLIENT } from './redis.constants';

@Global()
@Module({
    providers: [
        {
            provide: REDIS_CLIENT,
            useFactory: () => {
                const host = process.env.REDIS_HOST || 'localhost';
                const port = parseInt(process.env.REDIS_PORT || '6379', 10);
                const password = process.env.REDIS_PASSWORD || undefined;

                const redis = new Redis({
                    host,
                    port,
                    password: password || undefined,
                    retryStrategy: (times) => {
                        if (times > 10) {
                            console.error('Redis: Máximo de tentativas de reconexão atingido');
                            return null;
                        }
                        const delay = Math.min(times * 100, 3000);
                        console.log(`Redis: Tentando reconectar em ${delay}ms...`);
                        return delay;
                    },
                    maxRetriesPerRequest: 3,
                });

                redis.on('connect', () => {
                    console.log(`Redis conectado em ${host}:${port}`);
                });

                redis.on('error', (err) => {
                    console.error('Redis erro:', err.message);
                });

                return redis;
            },
        },
        RedisService,
    ],
    exports: [REDIS_CLIENT, RedisService],
})
export class RedisModule { }
