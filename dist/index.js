"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEST_REDIS_CHANNEL = void 0;
require("./env");
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = require("@fastify/cors");
const fastify_socket_io_1 = __importDefault(require("fastify-socket.io"));
const websockets_1 = require("./websockets");
const redis_1 = __importDefault(require("./redis"));
const Tile_1 = require("./modules/Tile");
const collection_1 = require("./modules/collection");
const isHeroku = process.env.NODE_ENV === "production";
const localPot = 3002;
const port = isHeroku ? parseInt(process.env.PORT || "3001", 10) || 3002 : 3002;
console.log("isHeroku", isHeroku);
console.log("port", port);
exports.TEST_REDIS_CHANNEL = "b-b-board";
const startServer = () => {
    const server = (0, fastify_1.default)({
        logger: true,
        ajv: {
            customOptions: {
                coerceTypes: "array",
            },
        },
    });
    server.register(cors_1.fastifyCors, {
        origin: [
            "http://localhost:3000",
            "http://localhost:3001",
            "https://badger-board.vercel.app",
            "https://badger-board-git-dev-setteam.vercel.app",
        ],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    });
    server.register(fastify_socket_io_1.default, {
        cors: {
            origin: [
                "http://localhost:3000",
                "http://localhost:3001",
                "https://badger-board.vercel.app",
            ],
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        },
    });
    server.get("/tiles", {}, async (request, reply) => {
        const tiles = await (0, Tile_1.fetchAllTiles)();
        reply.send({ tiles });
    });
    server.get("/pending-tiles", {}, async (req, reply) => {
        const address = req.query.address;
        if (address) {
            const tiles = await (0, Tile_1.fetchPendingTilesByAddress)(address);
            return reply.send({ tiles });
        }
        return reply.send({ tiles: {} });
    });
    server.get("/used-tiles", {}, async (req, reply) => {
        const address = req.query.address;
        if (address) {
            const tiles = await (0, Tile_1.fetchUsedTilesByAddress)(address);
            return reply.send({ tiles });
        }
        return reply.send({ tiles: 0 });
    });
    server.post("/newCollection", {}, async (req, reply) => {
        return (0, collection_1.createNewCollection)();
    });
    server.post("/checkPending", {}, async (req, reply) => {
        return (0, collection_1.checkPendingTiles)();
    });
    server.get("/checkPendingByAddress", {}, async (req, reply) => {
        console.log(req.query);
        const pending = await (0, collection_1.checkPendingByAddress)("1");
        reply.send({ status: "ok", pending });
    });
    server.post("/startCollection", {
        preValidation: (req, reply, done) => {
            console.log("req.body", req.body);
            const { collectionId } = req.body;
            if (!collectionId) {
                reply.code(400).send({ status: "missing collectionId" });
                return;
            }
            done();
        },
    }, async (req, reply) => {
        const { collectionId } = req.body;
        return (0, collection_1.startCollection)(collectionId);
    });
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
    server.post("/tiles-post", {
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
    }, async (req, reply) => {
        const { txId, principal, tiles, collection } = JSON.parse(req.body);
        return (0, Tile_1._addNewTile)({
            txId,
            principal,
            tiles,
            collection,
            server,
        });
    });
    server.get("/", (req, reply) => {
        server.io.to("room1").emit("message", { hello: "world" });
        return "yeet";
    });
    server.ready().then(() => {
        // we need to wait for the server to be ready, else `server.io` is undefined
        server.io.on("connection", (socket) => {
            socket.join(exports.TEST_REDIS_CHANNEL);
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
            const subscribeClient = redis_1.default.duplicate();
            redis_1.default.on("error", (err) => {
                console.error(`Redis subscribeClient  err ${err}`);
                //redis.connect();
            });
            redis_1.default.on("reconnecting", (params) => console.info(`Redis subscribeClient reconnecting, attempt ${params.attempt}`));
            redis_1.default.on("connect", () => console.info("Redis subscribeClient connected"));
            redis_1.default.on("ready", () => console.info("Redis subscribeClient ready"));
            redis_1.default.on("end", () => console.info("Redis subscribeClient connection closed"));
            await redis_1.default.connect();
            await subscribeClient.connect();
            await subscribeClient.subscribe("b-b-board", async (tiles) => {
                server.io
                    .to(exports.TEST_REDIS_CHANNEL)
                    .emit("b-b-board", { latestTiles: tiles });
            });
            await subscribeClient.subscribe("b-b-board-pending", async (tiles) => {
                server.io
                    .to(exports.TEST_REDIS_CHANNEL)
                    .emit("b-b-board-pending", { latestTiles: tiles });
            });
        })();
    });
    server.listen({ port: port, host: "0.0.0.0" }, (err, address) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        console.log(`Server listening at ${address}`);
        (0, websockets_1.startUpWebSocket)();
        (0, collection_1.checkLatestSuccesfultx)();
    });
};
startServer();
//# sourceMappingURL=index.js.map