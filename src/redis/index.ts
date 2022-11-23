import { createClient } from "redis";

const redis = createClient({
  url: process.env.REDIS_URL,
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
});
redis.on("reconnecting", (params) =>
  console.info(`Redis reconnecting, attempt ${params.attempt}`)
);
redis.on("connect", () => {
  console.info("Redis connected");
  setInterval((client) => {
    console.log("ping");
    redis.ping();
  }, 20000);
});
redis.on("ready", () => console.info("Redis ready"));
redis.on("end", () => console.info("Redis connection closed"));

export default redis;
