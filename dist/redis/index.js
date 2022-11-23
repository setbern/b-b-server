"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const redis = (0, redis_1.createClient)({
    url: "rediss://:p6d65d5475e414c8d356de3af5d32afc7767b37ac3c0107704e9966fa5bdb3499@ec2-54-146-251-58.compute-1.amazonaws.com:24989",
    socket: {
        tls: true,
        rejectUnauthorized: false,
        keepAlive: 900000000000,
        reconnectStrategy() {
            console.log("reconnectStrategy");
            console.timeLog("reconnectStrategy", "reconnectStrategy");
            return 3000;
        },
    },
});
redis.on("error", (err) => {
    console.error(`Redis error: ${err}`);
    //redis.connect();
    setInterval((client) => {
        redis.ping();
    }, 9 * 1000 * 60);
});
redis.on("reconnecting", (params) => console.info(`Redis reconnecting, attempt ${params.attempt}`));
redis.on("connect", () => {
    console.info("Redis connected");
    // setInterval(client => {
    //   client.ping((err: any) => {
    //     if (err) console.error('Redis keepalive error', err);
    //   });
    // }, X);
});
redis.on("ready", () => console.info("Redis ready"));
redis.on("end", () => console.info("Redis connection closed"));
exports.default = redis;
//# sourceMappingURL=index.js.map