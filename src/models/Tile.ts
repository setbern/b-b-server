// import { Entity, Schema, Repository, Client } from "redis-om";
// import redis from "../redis";

// interface Tile {
//   tileId: number;
//   txId: string;
//   wallet: string;
//   color: string;
//   created_at: number;
// }

// class Tile extends Entity {}

// const TileSchema = new Schema(
//   Tile,
//   {
//     tileId: { type: "number" },
//     txId: { type: "string" },
//     wallet: { type: "string" },
//     color: { type: "string" },
//     created_at: { type: "number" },
//   },
//   {
//     dataStructure: "JSON",
//   }
// );

// export const getTileRepository = async () => {
//   const redisOm = await new Client().use(redis);

//   const thing = redisOm.fetchRepository(TileSchema);
//   await thing.createIndex();

//   return thing;
// };

// export { Tile, TileSchema };
