"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const root = async (fastify, _opts) => {
    fastify.get("/", async (_request, _reply) => ({ status: true }));
    fastify.get("/health/check", async (_request, _reply) => ({ status: true }));
};
exports.default = root;
//# sourceMappingURL=root.js.map