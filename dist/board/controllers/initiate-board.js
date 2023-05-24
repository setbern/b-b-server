"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const initiateBoard_1 = __importDefault(require("../services/initiateBoard"));
const newBoard = async (fastify, _opts) => {
    fastify.post("/initiate-board", {
        preValidation: (req, reply, done) => {
            done();
        },
    }, async (req, reply) => {
        const result = await (0, initiateBoard_1.default)();
        return result;
    });
};
exports.default = newBoard;
//# sourceMappingURL=initiate-board.js.map