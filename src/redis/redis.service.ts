import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

@Injectable()
export class RedisService {
    constructor(
        @Inject(REDIS_CLIENT)
        private readonly redis: Redis,
    ) { }

    async get(key: string): Promise<string | null> {
        return this.redis.get(key);
    }

    async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
        if (ttlSeconds) {
            await this.redis.set(key, value, 'EX', ttlSeconds);
        } else {
            await this.redis.set(key, value);
        }
    }

    async del(key: string): Promise<void> {
        await this.redis.del(key);
    }

    async exists(key: string): Promise<boolean> {
        const result = await this.redis.exists(key);
        return result === 1;
    }

    async expire(key: string, ttlSeconds: number): Promise<void> {
        await this.redis.expire(key, ttlSeconds);
    }

    async ttl(key: string): Promise<number> {
        return this.redis.ttl(key);
    }

    async incr(key: string): Promise<number> {
        return this.redis.incr(key);
    }

    async decr(key: string): Promise<number> {
        return this.redis.decr(key);
    }

    async hset(key: string, field: string, value: string): Promise<void> {
        await this.redis.hset(key, field, value);
    }

    async hget(key: string, field: string): Promise<string | null> {
        return this.redis.hget(key, field);
    }

    async hgetall(key: string): Promise<Record<string, string>> {
        return this.redis.hgetall(key);
    }

    async hdel(key: string, ...fields: string[]): Promise<void> {
        await this.redis.hdel(key, ...fields);
    }

    async lpush(key: string, ...values: string[]): Promise<void> {
        await this.redis.lpush(key, ...values);
    }

    async rpush(key: string, ...values: string[]): Promise<void> {
        await this.redis.rpush(key, ...values);
    }

    async lrange(key: string, start: number, stop: number): Promise<string[]> {
        return this.redis.lrange(key, start, stop);
    }

    async publish(channel: string, message: string): Promise<void> {
        await this.redis.publish(channel, message);
    }

    getClient(): Redis {
        return this.redis;
    }
}
