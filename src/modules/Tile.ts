import { PostTilesQuery, TEST_REDIS_CHANNEL } from "..";
import redis from "../redis";
import {
  getBlockInfo,
  getBnsName,
  getLatestBlocks,
  STACKS_API,
} from "../stacks";
import { fetchHash } from "./RedisHelpers";

export type Tile = {
  position: number;
  color: string;
};

export type Tile_ = {
  tileId: number;
  color: string;
};
export type CleanTiles = {
  txId: string;
  principal: string;
  created_at: string;
  color: string;
  tileId: number;
};

export interface AddNewTileProps extends PostTilesQuery {
  server: any;
}

export const testTilesContractKey = "2:APPROVED";
export const testPendingContractKey = "2:PENDING";

export enum COLLECTION_STATUS {
  APPROVED = "APPROVED",
  PENDING = "PENDING",
  REJECTED = "REJECTED",
}

export const COLLECTION_KEY_GEN = (
  collectionId: number,
  status: COLLECTION_STATUS
) => `${collectionId}:${status}`;
/*
 new add new tile
  .5) get the current block
  1) get information in right format for adding to redis
*/

export const collectionsHashKey = "COLLECTIONS";

type AddNewTile = {
  txId: string;
  principal: string;
  tiles: Tile_[];
  collectionId: string;
};

export type COLLECTION = {
  [key: string]: number | string;
  collectionId: number;
  name: string;
  latestBlockChecked: number;
  startedBlock: number;
  endBlock: number;
};

export type TILE_HISTORY = {
  txId: string;
  color: string;
  principal: string;
  created_at: string;
};
``;
export type SELECTED_TILE = {
  id: number;
  color: string;
  history: TILE_HISTORY[];
  created_at: string;
  txId: string;
  principal: string;
  bnsName?: string;
};

export type APPROVED_TILE = {
  id: number;
  color: string;
  history: TILE_HISTORY[];
  created_at: string;
  txId: string;
  principal: string;
  bnsName?: string;
};
export type PENDING_TX = {
  tiles: Tile_[];
  txId: string;
  principal: string;
  collectionId: number;
};

export type PENDING_TILE = {
  tiles: Tile_[];
  txId: string;
  principal: string;
  collectionId: number;
  tileId: number;
  color: string;
};

export const _addNewTile = async (params: AddNewTileProps) => {
  try {
    const tilesClean = params.tiles as Tile[];
    const cleanUp = tilesClean.map((d, i) => {
      return {
        tileId: d.position,
        color: d.color,
      };
    });

    const data: PENDING_TX = {
      tiles: cleanUp,
      txId: params.txId,
      principal: params.principal,
      collectionId: 2,
    };

    const keyName = params.txId;
    const pendingCollectionId = testPendingContractKey;

    const saveLatestHash = await redis.hSet(
      pendingCollectionId,
      keyName,
      JSON.stringify(data)
    );

    return { status: "Added to pending" };
  } catch (err) {
    console.log("error in _addNewTile", err);
  }
};

export type SELECTED_TILE_NEW = {
  id: number;
  x: number;
  y: number;
  color: string;
  history: TILE_HISTORY[];
};

export type EXISTING_SELECTED_TILE = {
  [key: number]: SELECTED_TILE_NEW;
};

export type PENDING_SELECTED_TILE = {
  [key: number]: SELECTED_TILE_PENDING;
};

export type SELECTED_TILE_PENDING = {
  id: number;
  color: string;
  history: TILE_HISTORY[];
};

export const fetchAllTiles = async () => {
  try {
    console.log("what");
    const items = await redis.hGetAll(testTilesContractKey);
    console.log("items", items);
    let parsed: EXISTING_SELECTED_TILE = {};

    for (const tile in items) {
      console.log("tile", tile);
      console.log("items[tile]", items[tile]);

      const _parsed = JSON.parse(items[tile]) as SELECTED_TILE_NEW;

      parsed[_parsed.id] = _parsed;
    }

    console.log("parsed", parsed);

    return parsed;
  } catch (err) {
    console.log("error in fetchAllTiles", err);
    throw new Error(":(");
  }
};

export const fetchPendingTilesByAddress = async (address: string) => {
  try {
    const items = await redis.hGetAll(testPendingContractKey);

    let found: PENDING_SELECTED_TILE = {};

    for (const tile in items) {
      const _parsed = JSON.parse(items[tile]);

      // check if the address matches
      if (_parsed.principal === address) {
        // loop through the tiles
        console.log("_parsed.tiles", _parsed);

        for (const t in _parsed.tiles) {
          const _t = _parsed.tiles[t];

          const id = _t.tileId;
          const color = _t.color;
          const history = [
            {
              txId: _parsed.txId,
              principal: _parsed.principal,
              color,
            },
          ] as TILE_HISTORY[];

          found[id] = {
            id,
            color,
            history,
          };
        }
      }
    }
    console.log("parsed", found);
    return found;
  } catch (err) {
    console.log("error in fetchAllTiles", err);
    throw new Error(":(");
  }
};

/*
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
*/
