import { PostTilesQuery, TEST_REDIS_CHANNEL } from "..";
import redis from "../redis";
import { getBnsName, STACKS_API } from "../stacks";

type Tile = {
  position: number;
  color: string;
};

export type CleanTiles = {
  txId: string;
  principal: string;
  created_at: string;
  color: string;
  tileId: number;
};

interface AddNewTileProps extends PostTilesQuery {
  server: any;
}
const testTilesContractKey = "TEST:APPROVED";

export const AddNewtile = async (params: AddNewTileProps) => {
  try {
    const { txId, principal, tiles, collection } = params;

    const ihateYou = tiles as Tile[];
    const _tileShit = ihateYou.map((d, i) => {
      return {
        tileId: d.position,
        txId: txId,
        principal: principal,
        color: d.color,
        created_at: Date.now(),
      };
    });

    const iNeedToCleanThisUp = _tileShit.map((d) => JSON.stringify(d));
    const addTile = await redis.lPush(testTilesContractKey, iNeedToCleanThisUp);

    const bnsName = await getBnsName(principal);

    console.log("bnsName", bnsName);
    const latestTiles = {
      txId: txId,
      principal: bnsName || principal,
      tiles: tiles,
      created_at: Date.now(),
    };

    redis.publish(TEST_REDIS_CHANNEL, JSON.stringify(latestTiles));

    return { status: "yeet" };
  } catch (err) {
    console.log("error in AddNewtile", err);
  }
};

export type TILE_HISTORY = {
  txId: string;
  color: string;
  principal: string;
  created_at: string;
};

export type SELECTED_TILE = {
  id: number;
  color: string;
  history: TILE_HISTORY[];
  created_at: string;
  txId: string;
  principal: string;
  bnsName?: string;
};

export const fetchAllTiles = async () => {
  try {
    const items = await redis.lRange(testTilesContractKey, 0, -1);
    const parsed = items.map((d) => JSON.parse(d) as CleanTiles);

    if (parsed) {
      const clenaedUp = parsed as CleanTiles[];

      // create a new array type SELECTED_TILE of the most recent tile of each tileId
      const selectedTiles = clenaedUp.reduce((acc, curr) => {
        const { tileId, color, txId, principal, created_at } = curr;
        const existingTile = acc.find((d) => d.id === tileId);
        if (existingTile) {
          existingTile.history.push({
            txId,
            color,
            principal,
            created_at,
          });
        } else {
          acc.push({
            id: tileId,
            color,
            created_at,
            txId,
            principal,
            history: [],
          });
        }
        return acc;
      }, [] as SELECTED_TILE[]);

      console.log("selectedTiles", selectedTiles);
      return selectedTiles;
    } else {
      throw new Error(":(");
    }
  } catch (err) {
    console.log("error in fetchAllTiles", err);
    throw new Error(":(");
  }
};
