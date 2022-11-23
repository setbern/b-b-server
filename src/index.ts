import "./env";

import fastify from "fastify";
import cors, { fastifyCors } from "@fastify/cors";
import fastifyIO from "fastify-socket.io";

import { startUpWebSocket } from "./websockets";
import { getContractLatestTX } from "./stacks";

import redis from "./redis";
import {
  AddNewtile,
  CleanTiles,
  fetchAllTiles,
  SELECTED_TILE,
} from "./modules/Tile";

const isHeroku = process.env.NODE_ENV === "production";
const port = isHeroku ? parseInt(process.env.PORT || "3001", 10) || 3001 : 3001;

console.log("isHeroku", isHeroku);
console.log("prot", port);

export const TEST_REDIS_CHANNEL = "b-b-board";

export interface PostTile {
  position: number;
  color: string;
}

export interface PostTilesQuery {
  txId: string;
  principal: string;
  tiles: PostTile[];
  collection: string;
}

interface BBHeaders {
  "b-b-board": string;
}
const startServer = () => {
  const server = fastify({
    logger: true,
    ajv: {
      customOptions: {
        coerceTypes: "array",
      },
    },
  });

  server.register(fastifyCors, {
    origin: ["http://localhost:3000", "https://badger-board.vercel.app"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  });
  server.register(fastifyIO, {
    cors: {
      origin: ["http://localhost:3000", "https://badger-board.vercel.app"],
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    },
  });

  server.get<{
    Reply: { tiles: SELECTED_TILE[] };
  }>("/tiles", {}, async (request, reply) => {
    const tiles = await fetchAllTiles();
    reply.send({ tiles });
  });
  server.post<{
    Body: string;
    Headers: BBHeaders;
    Reply: { status: string };
  }>(
    "/post-tiles",
    {
      preValidation: (req, reply, done) => {
        console.log("req body", req.body);
        const { txId, principal, tiles, collection } = JSON.parse(req.body);
        // check if their is a missing field and return a 400 with the missing one

        console.log("txId", txId);
        if (!txId) {
          reply.code(400).send({ status: "missing txId" });
          return;
        }
        if (!principal) {
          reply.code(400).send({ status: "missing principal" });
          return;
        }
        if (!tiles) {
          reply.code(400).send({ status: "missing tiles" });
          return;
        }
        if (!collection) {
          reply.code(400).send({ status: "missing collection" });
          return;
        }
        done();
      },
    },
    async (req, reply) => {
      const { txId, principal, tiles, collection } = JSON.parse(req.body);

      return AddNewtile({
        txId,
        principal,
        tiles,
        collection,
        server,
      });
    }
  );
  server.get("/", (req, reply) => {
    server.io.to("room1").emit("message", { hello: "world" });
    return "yeet";
  });

  server.ready().then(() => {
    // we need to wait for the server to be ready, else `server.io` is undefined
    server.io.on("connection", (socket) => {
      socket.join(TEST_REDIS_CHANNEL);

      socket.on("message", (data) => {
        console.log(data);

        socket.emit("hello", "what is going on");
      });

      socket.on("disconnect", () => {
        console.log("user disconnected");
      });
    });

    (async () => {
      console.log("when does this run");
      const subscribeClient = redis.duplicate();

      redis.on("error", (err) => {
        console.error(`Redis subscribeClient  error: ${err}`);
        //redis.connect();
      });
      redis.on("reconnecting", (params) =>
        console.info(
          `Redis subscribeClient reconnecting, attempt ${params.attempt}`
        )
      );

      redis.on("connect", () =>
        console.info("Redis subscribeClient connected")
      );
      redis.on("ready", () => console.info("Redis subscribeClient ready"));
      redis.on("end", () =>
        console.info("Redis subscribeClient connection closed")
      );

      await redis.connect();
      await subscribeClient.connect();

      await subscribeClient.subscribe("b-b-board", async (tiles: string) => {
        server.io
          .to(TEST_REDIS_CHANNEL)
          .emit("b-b-board", { latestTiles: tiles });
      });
    })();
  });

  server.listen({ port: port, host: "0.0.0.0" }, (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Server listening at ${address}`);
  });
};

startServer();
