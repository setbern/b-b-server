"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAllTiles = exports._addNewTile = exports.collectionsHashKey = exports.COLLECTION_KEY_GEN = exports.COLLECTION_STATUS = exports.testPendingContractKey = exports.testTilesContractKey = void 0;
const redis_1 = __importDefault(require("../redis"));
exports.testTilesContractKey = "2:APPROVED";
exports.testPendingContractKey = "2:PENDING";
var COLLECTION_STATUS;
(function (COLLECTION_STATUS) {
    COLLECTION_STATUS["APPROVED"] = "APPROVED";
    COLLECTION_STATUS["PENDING"] = "PENDING";
    COLLECTION_STATUS["REJECTED"] = "REJECTED";
})(COLLECTION_STATUS = exports.COLLECTION_STATUS || (exports.COLLECTION_STATUS = {}));
const COLLECTION_KEY_GEN = (collectionId, status) => `${collectionId}:${status}`;
exports.COLLECTION_KEY_GEN = COLLECTION_KEY_GEN;
/*
 new add new tile
  .5) get the current block
  1) get information in right format for adding to redis
*/
exports.collectionsHashKey = "COLLECTIONS";
``;
const _addNewTile = async (params) => {
    try {
        const tilesClean = params.tiles;
        const cleanUp = tilesClean.map((d, i) => {
            return {
                tileId: d.position,
                color: d.color,
            };
        });
        const data = {
            tiles: cleanUp,
            txId: params.txId,
            principal: params.principal,
            collectionId: 2,
        };
        const keyName = params.txId;
        const pendingCollectionId = exports.testPendingContractKey;
        const saveLatestHash = await redis_1.default.hSet(pendingCollectionId, keyName, JSON.stringify(data));
        return { status: "Added to pending" };
    }
    catch (err) {
        console.log("error in _addNewTile", err);
    }
};
exports._addNewTile = _addNewTile;
const fetchAllTiles = async () => {
    try {
        console.log("what");
        const items = await redis_1.default.hGetAll(exports.testTilesContractKey);
        console.log("items", items);
        let parsed = {};
        for (const tile in items) {
            console.log("tile", tile);
            console.log("items[tile]", items[tile]);
            const _parsed = JSON.parse(items[tile]);
            parsed[_parsed.id] = _parsed;
        }
        console.log("parsed", parsed);
        return parsed;
    }
    catch (err) {
        console.log("error in fetchAllTiles", err);
        throw new Error(":(");
    }
};
exports.fetchAllTiles = fetchAllTiles;
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
//# sourceMappingURL=Tile.js.map