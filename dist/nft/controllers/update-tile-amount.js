"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addAmount_service_1 = __importDefault(require("../services/addAmount.service"));
const updateTileAmount = async (fastify, _opts) => {
    fastify.post('/update-tile-amount', async (req, reply) => {
        (0, addAmount_service_1.default)();
        return { status: 'ok' };
    });
};
exports.default = updateTileAmount;
//# sourceMappingURL=update-tile-amount.js.map