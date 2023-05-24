"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getTileAmount_service_1 = __importDefault(require("../services/getTileAmount.service"));
const tileAmount = async (fastify, _opts) => {
    fastify.post("/tile-amount", {
        preValidation: (req, reply, done) => {
            const { tokenId, collection } = req.body;
            // check if their is a missing field and return a 400 with the missing one
            if (!tokenId) {
                reply.code(400).send({ status: "missing txId" });
                return;
            }
            if (!collection) {
                reply.code(400).send({ status: "missing collection" });
                return;
            }
            done();
        },
    }, async (req, reply) => {
        const { collection, tokenId } = req.body;
        const amount = await (0, getTileAmount_service_1.default)(tokenId, collection);
        return { amount: amount };
    });
};
exports.default = tileAmount;
//# sourceMappingURL=get-tile-amount.js.map