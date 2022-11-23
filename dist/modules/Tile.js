"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAllTiles = exports.AddNewtile = void 0;
const __1 = require("..");
const redis_1 = __importDefault(require("../redis"));
const testTilesContractKey = "TEST:APPROVED";
const AddNewtile = async (params) => {
    try {
        const { txId, principal, tiles, collection } = params;
        const ihateYou = tiles;
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
        const addTile = await redis_1.default.lPush(testTilesContractKey, iNeedToCleanThisUp);
        const latestTiles = {
            txId: txId,
            principal: principal,
            tiles: tiles,
            created_at: Date.now(),
        };
        redis_1.default.publish(__1.TEST_REDIS_CHANNEL, JSON.stringify(latestTiles));
        return { status: "yeet" };
    }
    catch (err) {
        console.log("error in AddNewtile", err);
    }
};
exports.AddNewtile = AddNewtile;
const fetchAllTiles = async () => {
    try {
        const items = await redis_1.default.lRange(testTilesContractKey, 0, -1);
        const parsed = items.map((d) => JSON.parse(d));
        if (parsed) {
            const clenaedUp = parsed;
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
                }
                else {
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
            }, []);
            return selectedTiles;
        }
        else {
            throw new Error(":(");
        }
    }
    catch (err) {
        console.log("error in fetchAllTiles", err);
        throw new Error(":(");
    }
};
exports.fetchAllTiles = fetchAllTiles;
//# sourceMappingURL=Tile.js.map