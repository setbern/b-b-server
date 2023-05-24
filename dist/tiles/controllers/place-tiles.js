"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const placeTiles_service_1 = __importDefault(require("../services/placeTiles.service"));
const placeTiles = async (fastify, _opts) => {
    fastify.post("/tiles-post", {
        preValidation: (req, reply, done) => {
            const { txId, principal, tiles, collection } = JSON.parse(req.body);
            // check if their is a missing field and return a 400 with the missing one
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
        return (0, placeTiles_service_1.default)({
            txId,
            principal,
            tiles,
            collection,
            server: fastify,
        });
    });
};
exports.default = placeTiles;
//# sourceMappingURL=place-tiles.js.map