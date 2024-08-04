import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
    constructor() {
        this.client = createClient();

        this.client.on('error', (err) => console.log('Redis client error:', err));
        // Promisify the Redis client methods
        this.getAsync = promisify(this.client.get).bind(this.client);
        this.setExAsync = promisify(this.client.set).bind(this.client);
        this.delAsync = promisify(this.client.del).bind(this.client);
    }

    // isAlive method checks if the client is connected
    isAlive() {
       return this.client.connected;
    }

    // Asynchronous get method using the promisified version of client.get
    async get(key) {
            const value = await this.getAsync(key);
            return value;
    }

    // Asynchronous set method using the promisified version of client.setEx
    async set(key, value, duration) {
            const res = await this.setExAsync(key, value, 'EX', duration);
            return res;
    }

    // Asynchronous del method using the promisified version of client.del
    async del(key) {
            const result = await this.delAsync(key);
            return result;
    }
}

const redisClient = new RedisClient();
export default redisClient;
