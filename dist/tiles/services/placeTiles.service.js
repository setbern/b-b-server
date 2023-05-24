"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Tile_1 = require("../../modules/Tile");
const redis_1 = __importDefault(require("../../redis"));
const place = async (params) => {
    try {
        console.log("params", params);
        const tilesClean = params.tiles;
        const cleanUp = tilesClean.map((d, i) => {
            return {
                tileId: d.position,
                color: d.color,
                tokenId: d.item,
                collection: d.collection
            };
        });
        const data = {
            tiles: cleanUp,
            txId: params.txId,
            principal: params.principal,
            collectionId: parseInt(params.collection),
        };
        const keyName = params.txId;
        const pendingCollectionId = Tile_1.testPendingContractKey;
        const saveLatestHash = await redis_1.default.hSet(pendingCollectionId, keyName, JSON.stringify(data));
        return { status: "Added to pending" };
    }
    catch (err) {
        console.log("error in _addNewTile", err);
    }
};
exports.default = place;
//# sourceMappingURL=placeTiles.service.js.map