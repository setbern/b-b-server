"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchUsedTilesByAddress = exports.fetchApprovedTilesByAddress = exports.fetchPendingTilesByAddress = exports.fetchAllTiles = exports._addNewTile = exports.collectionsHashKey = exports.COLLECTION_KEY_GEN = exports.COLLECTION_STATUS = exports.testPendingContractKey = exports.testTilesContractKey = void 0;
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
        const items = await redis_1.default.hGetAll(exports.testTilesContractKey);
        let parsed = {};
        for (const tile in items) {
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
const fetchPendingTilesByAddress = async (address) => {
    console.log("fetchPendingTilesByAddress");
    try {
        const items = await redis_1.default.hGetAll(exports.testPendingContractKey);
        let found = {};
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
                    ];
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
    }
    catch (err) {
        console.log("error in fetchAllTiles", err);
        throw new Error(":(");
    }
};
exports.fetchPendingTilesByAddress = fetchPendingTilesByAddress;
const fetchApprovedTilesByAddress = async (address) => {
    try {
        // get all the approved tiles
        const items = await redis_1.default.hGetAll(exports.testTilesContractKey);
        let found = {};
        // loop through the approved tiles and find the ones that match the address
        for (const tile in items) {
            const _parsed = JSON.parse(items[tile]);
            // check if the address matches
            if (_parsed.principal === address) {
                console.log("found");
                found[_parsed.id] = _parsed;
            }
        }
        return found;
    }
    catch (err) {
        console.log("error in fetchAllTiles", err);
        throw new Error(":(");
    }
};
exports.fetchApprovedTilesByAddress = fetchApprovedTilesByAddress;
const fetchUsedTilesByAddress = async (address) => {
    try {
        const pendingTiles = await (0, exports.fetchPendingTilesByAddress)(address);
        const approvedTiles = await (0, exports.fetchApprovedTilesByAddress)(address);
        const allTiles = Object.assign(Object.assign({}, approvedTiles), pendingTiles);
        const total = Object.keys(allTiles).length;
        return total;
    }
    catch (err) {
        console.log("error in fetchAllTiles", err);
        throw new Error(":(");
    }
};
exports.fetchUsedTilesByAddress = fetchUsedTilesByAddress;
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