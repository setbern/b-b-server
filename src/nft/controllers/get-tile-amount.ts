import { FastifyPluginAsync } from "fastify";
import { _addNewTile } from "../../modules/Tile";
import getTileAmount from "../services/getTileAmount.service";

const tileAmount: FastifyPluginAsync = async (fastify, _opts) => {
  fastify.post<{
    Body: string;
    Reply: { status?: string, amount?: number };
  }>(
    "/tile-amount",
    {
      preValidation: (req, reply, done) => {

        const { tokenId, collection }:any = req.body;

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
    },
    async (req, reply) => {
      const { collection, tokenId }:any = req.body;
      const amount = await getTileAmount(tokenId, collection)
      return {amount: amount}
    }
  );
};

export default tileAmount;
