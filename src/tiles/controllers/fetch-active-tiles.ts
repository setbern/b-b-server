//fetch - active - tiles.ts;
import fastify, { FastifyPluginAsync } from "fastify";
import { BBHeaders } from "../types";
import { fetchActiveTilesHandler } from "../services/fetchActiveTiles";

const fetchActiveTiles: FastifyPluginAsync = async (fastify, _opts) => {
  fastify.post<{
    Body: string;
    Headers: BBHeaders;
    Reply: { data: number[]; error: boolean; message: string };
  }>(
    "/fetch-active-tiles",
    {
      preValidation: (req, reply, done) => {
        // ensure that the request has a nfts array
        console.log("pre req body", req.body);
        const { nfts } = req.body as any;
        if (!nfts) {
          reply
            .code(400)
            .send({ message: "missing nfts", error: true, data: [] });
          return;
        }
        done();
      },
    },
    async (req, reply) => {
      console.log("req body", req.body);
      const { nfts } = req.body as any;
      console.log("nfst", nfts);
      const data = await fetchActiveTilesHandler(nfts as string[]);
      if (data) {
        return reply
          .code(200)
          .send({ message: "success", error: false, data: data });
      } else {
        return reply
          .code(400)
          .send({ message: "Something went wrong", error: true, data: [] });
        return;
      }
    }
  );
};

export default fetchActiveTiles;
