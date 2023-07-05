import { parse } from "path";
import redis from "../../redis";

const TESTING_ACTIVE_TILES = "3:ACTIVE_TILES";

const babyBader = "SP27F9EJH20K3GT6GHZG0RD08REZKY2TDMD6D9M2Z.baby-badgers";
const btcBadgerV2 = "SP27F9EJH20K3GT6GHZG0RD08REZKY2TDMD6D9M2Z.btc-badgers-v";

export const fetchActiveTilesHandler = async (tiles: string[]) => {
  try {
    const items = await redis.hmGet(TESTING_ACTIVE_TILES, tiles);

    const parsedItems = items.map((d, i) => {
      if (d) {
        return parseInt(d);
      } else {
        // check if the item at that position is a baby badger or badger
        const contractName = tiles[i].split(":")[0];
        // check if contract name is either baby badger or badger
        if (contractName === babyBader || contractName === btcBadgerV2) {
          return 12;
        } else {
          return 8;
        }
      }
    });
    console.log("items", items);
    return parsedItems;
  } catch (err) {
    console.log("error in fetchAllTiles", err);
    return [];
  }
};

export const addFakeCheckTiles = async () => {
  try {
    const contractName =
      "SP27F9EJH20K3GT6GHZG0RD08REZKY2TDMD6D9M2Z.baby-badgers";

    const tiles = {
      "SP27F9EJH20K3GT6GHZG0RD08REZKY2TDMD6D9M2Z.baby-badgers:609": 2,
      "SP27F9EJH20K3GT6GHZG0RD08REZKY2TDMD6D9M2Z.baby-badgers:629": 4,
      "SP27F9EJH20K3GT6GHZG0RD08REZKY2TDMD6D9M2Z.baby-badgers:630": 6,
    };

    const save = await redis.hSet(TESTING_ACTIVE_TILES, tiles);
  } catch (err) {
    console.log("test faield");
  }
};
