import fastify, { FastifyPluginAsync } from "fastify";
import initiateBoard from "../services/initiateBoard";

const newBoard: FastifyPluginAsync = async (fastify, _opts) => {
  fastify.post<{
    Reply: { status: string };
    Body: string;
  }>(
    "/initiate-board",
    {
      preValidation: (req, reply, done) => {
        
        done();
      },
    },
    async (req, reply) => {
      const result = await initiateBoard();
      return result;
    }
  );
};

export default newBoard
