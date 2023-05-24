"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const redis = (0, redis_1.createClient)({
    url: process.env.REDIS_URL,
    socket: {
        tls: true,
        rejectUnauthorized: false,
        keepAlive: 900000000000,
        reconnectStrategy() {
            console.log("reconnectStrategy");
            console.log("reconnectStrategy", "reconnectStrategy");
            return 3000;
        },
    },
});
redis.on("error", (err) => {
    console.error(`Redis error: ${err}`);
    //redis.connect();
});
redis.on("reconnecting", (params) => console.info(`Redis reconnecting, attempt ${params === null || params === void 0 ? void 0 : params.attempt}`));
redis.on("connect", () => {
    console.info("Redis connected");
    setInterval((client) => {
        redis.ping();
    }, 20000);
});
redis.on("ready", () => console.info("Redis ready"));
redis.on("end", () => console.info("Redis connection closed"));
exports.default = redis;
//# sourceMappingURL=index.js.map