import "./env";

import fastify from "fastify";
import cors, { fastifyCors } from "@fastify/cors";
import fastifyIO from "fastify-socket.io";

import { startUpWebSocket } from "./websockets";
import { getContractLatestTX } from "./stacks";

import redis from "./redis";
import {
  CleanTiles,
  EXISTING_SELECTED_TILE,
  fetchAllTiles,
  SELECTED_TILE,
  _addNewTile,
} from "./modules/Tile";
import {
  checkLatestSuccesfultx,
  checkPendingTiles,
  createNewCollection,
  startCollection,
} from "./modules/collection";

const isHeroku = process.env.NODE_ENV === "production";
const localPot = 3002;
const port = isHeroku ? parseInt(process.env.PORT || "3001", 10) || 3002 : 3002;

console.log("isHeroku", isHeroku);
console.log("port", port);

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
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://badger-board.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  });
  server.register(fastifyIO, {
    cors: {
      origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://badger-board.vercel.app",
      ],
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    },
  });

  server.get<{
    Reply: { tiles: EXISTING_SELECTED_TILE };
  }>("/tiles", {}, async (request, reply) => {
    const tiles = await fetchAllTiles();
    reply.send({ tiles });
  });

  server.post<{
    Reply: { status: string; collectionId: number };
  }>("/newCollection", {}, async (req, reply) => {
    return createNewCollection();
  });

  server.post<{
    Reply: { status: string };
  }>("/checkPending", {}, async (req, reply) => {
    return checkPendingTiles();
  });

  server.post<{
    Reply: { status: string };
    Body: string;
  }>(
    "/startCollection",
    {
      preValidation: (req, reply, done) => {
        console.log("req.body", req.body);
        const { collectionId } = req.body as any;
        if (!collectionId) {
          reply.code(400).send({ status: "missing collectionId" });
          return;
        }
        done();
      },
    },
    async (req, reply) => {
      const { collectionId } = req.body as any;
      return startCollection(collectionId);
    }
  );
  /*
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
  */
  server.post<{
    Body: string;
    Headers: BBHeaders;
    Reply: { status: string };
  }>(
    "/tiles-post",
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

      return _addNewTile({
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
        console.error(`Redis subscribeClient  err ${err}`);
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

      await subscribeClient.subscribe(
        "b-b-board-pending",
        async (tiles: string) => {
          server.io
            .to(TEST_REDIS_CHANNEL)
            .emit("b-b-board-pending", { latestTiles: tiles });
        }
      );
    })();
  });

  server.listen({ port: port, host: "0.0.0.0" }, (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Server listening at ${address}`);
    startUpWebSocket();
    checkLatestSuccesfultx();
  });
};

startServer();
