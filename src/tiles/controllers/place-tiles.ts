import fastify, { FastifyPluginAsync } from "fastify";
import { BBHeaders } from "../types";
import place from "../services/placeTiles.service";

const placeTiles: FastifyPluginAsync = async (fastify, _opts) => {
  fastify.post<{
    Body: string;
    Headers: BBHeaders;
    Reply: { status: string };
  }>(
    "/tiles-post",
    {
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
    },
    async (req, reply) => {
      const { txId, principal, tiles, collection } = JSON.parse(req.body);

      return place({
        txId,
        principal,
        tiles,
        collection,
        server: fastify,
      });
    }
  );
};

export default placeTiles;
