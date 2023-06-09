"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processBlock = exports.checkLatestBlock = void 0;
const substractAmount_service_1 = __importDefault(require("../nft/services/substractAmount.service"));
const redis_1 = __importDefault(require("../redis"));
const RedisHelpers_1 = require("./RedisHelpers");
const Tile_1 = require("./Tile");
const boardId = '3';
const checkLatestBlock = async () => {
    var _a;
    // last processed block
    const latestBlockHeight = await redis_1.default.get(`${boardId}:LATEST_BLOCK`);
    // last block in the hiro
    const rawStacksBlocks = await fetch('https://api.mainnet.hiro.so/extended/v1/block');
    // const rawStacksBlocks = await fetch(
    //   `https://api.mainnet.hiro.so/extended/v1/tx/block_height/108754`
    // );
    const stacksBlocks = await rawStacksBlocks.json();
    // const results = stacksBlocks.results.map((block) => block.tx_id);
    const lastBlockFromStacks = stacksBlocks.results[0];
    // const lastBlockFromStacks = { txs: results };
    const blockHeight = (_a = stacksBlocks.results[0].height) !== null && _a !== void 0 ? _a : 108524;
    //   if theres no latest block, set it to the latest block
    if (!latestBlockHeight) {
        return (0, exports.processBlock)(blockHeight, lastBlockFromStacks.txs);
    }
    // if the latest block is less than the latest block, start processsing
    if (blockHeight > latestBlockHeight) {
        return (0, exports.processBlock)(blockHeight, lastBlockFromStacks.txs);
    }
    console.log(blockHeight);
    console.log('already processed block');
};
exports.checkLatestBlock = checkLatestBlock;
const processBlock = async (blockHeight, txsFromBlock) => {
    try {
        // get the pending txs
        const pendingTransactions = (await (0, RedisHelpers_1.fetchHash)(boardId + ':PENDING'));
        if (!pendingTransactions) {
            console.log('no pending transactions in board');
            return;
        }
        const approvedTransactions = [];
        // console.log('pendingTransactions', pendingTransactions, txsFromBlock);
        // check if the txId is in the approved txs
        for (const pendingTileKey in pendingTransactions) {
            const pendingTile = pendingTransactions[pendingTileKey];
            const pendingTileTxId = pendingTile.txId;
            // check if the txId is in the last three blocks
            const approvedTxId = txsFromBlock.find((tx) => tx === `0x${pendingTileTxId}`);
            if (approvedTxId) {
                approvedTransactions.push(pendingTile);
            }
        }
        // if approved txs is empty, return
        if (approvedTransactions.length === 0) {
            console.log('No approved transactions from board');
            await redis_1.default.set(`${boardId}:LATEST_BLOCK`, blockHeight);
            return;
        }
        // convert the approved txs to approved tiles
        const converted = convertPendingTileToApproved(approvedTransactions);
        if (!converted) {
            console.log('no converted');
            return;
        }
        console.log('approved', approvedTransactions);
        // save the latest block once done
        await redis_1.default.set(`${boardId}:LATEST_BLOCK`, blockHeight);
    }
    catch (err) {
        console.log('processBlock', err);
    }
};
exports.processBlock = processBlock;
const convertPendingTileToApproved = async (tiles) => {
    try {
        const flattenTiles = tiles.reduce((acc, tile) => {
            const tilesArr = tile.tiles.map((d, i) => {
                return Object.assign(Object.assign({}, tile), d);
            });
            return [...acc, ...tilesArr];
        }, []);
        for (const tile of flattenTiles) {
            // fetch the tile from reids
            const collectionStatusKey = (0, Tile_1.COLLECTION_KEY_GEN)(tile.collectionId, Tile_1.COLLECTION_STATUS.APPROVED);
            const tileLookUp = await (0, RedisHelpers_1.getKeyAtHash)(`${tile.tileId}`, collectionStatusKey);
            if (tileLookUp) {
                // already exist need to update it with its' history
                const approvedTile = tileLookUp;
                const tileData = {
                    id: tile.tileId,
                    color: tile.color,
                    history: [
                        {
                            txId: approvedTile.txId,
                            color: approvedTile.color,
                            principal: approvedTile.principal,
                            created_at: approvedTile.created_at,
                        },
                        ...approvedTile.history,
                    ],
                    created_at: new Date().toString(),
                    txId: tile.txId,
                    principal: tile.principal,
                };
                const savedNewTile = await redis_1.default.hSet(collectionStatusKey, tile.tileId, JSON.stringify(tileData));
            }
            else {
                // does not exist need to create it with its state
                const tileData = {
                    id: tile.tileId,
                    color: tile.color,
                    history: [],
                    created_at: new Date().toString(),
                    txId: tile.txId,
                    principal: tile.principal,
                };
                const savedNewTile = await redis_1.default.hSet(collectionStatusKey, tile.tileId, JSON.stringify(tileData));
            }
            //   remove the peding tx from the pending collection hash
            const deltedKeyHash = await redis_1.default.hDel(tile.collectionId + ':PENDING', tile.txId);
            const tokenCounts = {};
            tile.tiles.forEach((obj) => {
                const tokenId = obj.tokenId;
                const collection = obj.collection;
                if (tokenId in tokenCounts) {
                    tokenCounts[tokenId] = {
                        collection: tile.collection,
                        count: tokenCounts[tokenId].count + 1,
                    };
                }
                else {
                    tokenCounts[tokenId] = { collection: tile.collection, count: 1 };
                }
            });
            Object.keys(tokenCounts).forEach(async (tokenId) => {
                const tokenCount = tokenCounts[parseInt(tokenId)];
                const tileCount = tokenCount.count;
                const collection = tokenCount.collection;
                const substractedAmount = await (0, substractAmount_service_1.default)(parseInt(tokenId), collection, tileCount);
            });
        }
        return true;
    }
    catch (err) {
        console.log('convertPendingTileToApproved', err);
        return false;
    }
};
//# sourceMappingURL=blocks.js.map