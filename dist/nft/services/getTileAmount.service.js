"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = __importDefault(require("../../redis"));
const getTileAmount = async (tokenId, collectionId) => {
    // await redis.hSet(collectionId,tokenId, 12 )
    const rawCollection = await redis_1.default.hGet("3:COLLECTION", collectionId);
    if (!rawCollection) {
        // get the tiles for that collection
        if (collectionId ===
            "SP27F9EJH20K3GT6GHZG0RD08REZKY2TDMD6D9M2Z.baby-badgers" ||
            collectionId ===
                "SP27F9EJH20K3GT6GHZG0RD08REZKY2TDMD6D9M2Z.btc-badgers-v2") {
            const data = { [tokenId]: 12 };
            await redis_1.default.hSet("3:COLLECTION", collectionId, JSON.stringify(data));
            return 12;
        }
        // save the new token id to that collection
        const data = { [tokenId]: 6 };
        await redis_1.default.hSet("3:COLLECTION", collectionId, JSON.stringify(data));
        return 6;
    }
    const collection = JSON.parse(rawCollection);
    if (!collection[tokenId]) {
        if (collectionId ===
            "SP27F9EJH20K3GT6GHZG0RD08REZKY2TDMD6D9M2Z.baby-badgers" ||
            collectionId ===
                "SP27F9EJH20K3GT6GHZG0RD08REZKY2TDMD6D9M2Z.btc-badgers-v2") {
            const data = Object.assign(Object.assign({}, collection), { [tokenId]: 12 });
            await redis_1.default.hSet("3:COLLECTION", collectionId, JSON.stringify(data));
            return 12;
        }
        // save the new token id to that collection
        const data = Object.assign(Object.assign({}, collection), { [tokenId]: 6 });
        await redis_1.default.hSet("3:COLLECTION", collectionId, JSON.stringify(data));
        return 6;
    }
    // get amount from NFT
    const amount = collection[tokenId];
    return parseInt(amount);
};
exports.default = getTileAmount;
//# sourceMappingURL=getTileAmount.service.js.map