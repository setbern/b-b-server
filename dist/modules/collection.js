"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPendingByAddress = exports.updateCollectionMeta = exports.createNewCollection = exports.startCollection = exports.checkPendingTilesFromMicoblockUpdates = exports.checkLatestSuccesfultx = exports.checkPendingTiles = void 0;
const addAmount_service_1 = __importDefault(require("../nft/services/addAmount.service"));
const redis_1 = __importDefault(require("../redis"));
const stacks_1 = require("../stacks");
const RedisHelpers_1 = require("./RedisHelpers");
const Tile_1 = require("./Tile");
const checkPendingTiles = async () => {
    try {
        // get the latest block
        const latestBlock = await (0, stacks_1.getLatestBlocks)();
        if (latestBlock.results && latestBlock.results.length > 0) {
            // get the last two blocks that have been burned
            const latestBlockItem = latestBlock.results[0].txs;
            const secondLatestBlockItem = latestBlock.results[1].txs;
            const thirdLatestBlockItem = latestBlock.results[2].txs;
            const lastThreeBlocksApprovedTx = [
                ...latestBlockItem,
                ...secondLatestBlockItem,
                ...thirdLatestBlockItem,
            ];
            // fetch all the pending tiles for each active collection
            const collections = (await (0, RedisHelpers_1.fetchHash)(Tile_1.collectionsHashKey));
            if (!collections) {
                return { status: "no collections" };
            }
            for (const collection in collections) {
                const collectionId = collections[collection].collectionId + "";
                await checkingPendingTilesInHash(collectionId, lastThreeBlocksApprovedTx);
            }
        }
        return { status: "yee" };
    }
    catch (err) {
        console.log("checkPendingTiles", err);
    }
};
exports.checkPendingTiles = checkPendingTiles;
const checkLatestSuccesfultx = async () => {
    try {
        // get the latest block
        const initalWalletFetchHolding = (await (0, stacks_1.getLatestTxFromBoard)(0));
        let totalFetchedAssets = [...initalWalletFetchHolding.results];
        const totalAssetsInWallet = initalWalletFetchHolding.total;
        if (totalAssetsInWallet >= 50) {
            while (totalAssetsInWallet > totalFetchedAssets.length) {
                const nextWalletFetchHolding = (await (0, stacks_1.getLatestTxFromBoard)(totalFetchedAssets.length));
                totalFetchedAssets = [
                    ...totalFetchedAssets,
                    ...nextWalletFetchHolding.results,
                ];
            }
        }
        const filteredItems = totalFetchedAssets
            .filter((item) => {
            if (item.tx_status === "success" && item.tx_type === "contract_call") {
                if (item.contract_call.function_name) {
                    if (item.contract_call.function_name ===
                        "place-tiles-many-collections") {
                        return true;
                    }
                }
            }
            return false;
        })
            .map((d, i) => {
            // reove ox from the tx_id
            const txId = d.tx_id;
            // remove first 2 character of string
            const txIdWithout0x = txId.substring(2);
            return txIdWithout0x;
        });
        await checkingPendingTilesInHash("3", filteredItems);
        await (0, addAmount_service_1.default)();
        console.log('finished checking');
        return "yeet";
    }
    catch (err) {
        console.log("checkLatestSuccesfultx", err);
    }
};
exports.checkLatestSuccesfultx = checkLatestSuccesfultx;
const checkPendingTilesFromMicoblockUpdates = async (txs) => {
    try {
        const collectionId = "3";
        const runIt = await checkingPendingTilesInHash(collectionId, txs);
    }
    catch (err) {
        console.log("err", err);
    }
};
exports.checkPendingTilesFromMicoblockUpdates = checkPendingTilesFromMicoblockUpdates;
const checkingPendingTilesInHash = async (collectionId, approvedTx) => {
    try {
        console.log('approved txs', approvedTx);
        // get the hash of the specfic collection
        const pendingTiles = (await (0, RedisHelpers_1.fetchHash)(collectionId + ":PENDING"));
        if (!pendingTiles) {
            return { status: "no pending tiles" };
        }
        // check if any of the pending tiles exist in the last three blocks
        const approvedTiles = [];
        for (const pendingTileKey in pendingTiles) {
            const pendingTile = pendingTiles[pendingTileKey];
            const pendingTileTxId = pendingTile.txId;
            // check if the txId is in the last three blocks
            const approvedTxId = approvedTx.find((tx) => tx === pendingTileTxId);
            //const approvedTxId = true;
            if (approvedTxId) {
                approvedTiles.push(pendingTile);
            }
        }
        const helperFunc = await convertPendingTileToApproved(approvedTiles);
    }
    catch (err) {
        console.log("checkingPendingTilesInHash", err);
    }
};
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
            // remove the peding tx from the pending collection hash
            const deltedKeyHash = await redis_1.default.hDel(tile.collectionId + ":PENDING", tile.txId);
            // await substractAmount(tile.tokenId as number, tile.collection as string, 1);
        }
    }
    catch (err) {
        console.log("convertPendingTileToApproved", err);
    }
};
const startCollection = async (collectionId) => {
    try {
        // fetch the collection wanting to start
        const collection = (await (0, RedisHelpers_1.getKeyAtHash)(collectionId, Tile_1.collectionsHashKey));
        // fetch the latest block
        const latestBlock = await (0, stacks_1.getLatestBlocks)();
        if (latestBlock.results && latestBlock.results.length > 0) {
            const latestBlockItem = latestBlock.results[0].height;
            const latestMeta = Object.assign(Object.assign({}, collection), { latestBlockChecked: 0, startedBlock: latestBlockItem });
            // save the key
            const savedCollection = await redis_1.default.hSet(Tile_1.collectionsHashKey, collection.collectionId, JSON.stringify(latestMeta));
            return {
                status: "success",
            };
        }
        else {
            throw new Error("no latest block found");
        }
    }
    catch (err) {
        console.log("err", err);
        return {
            status: "Error",
            error: err,
        };
    }
};
exports.startCollection = startCollection;
const createNewCollection = async () => {
    try {
        // get the length of the collection
        //const collectionCheck = await getKeyAtHash("0", collectionsHashKey);
        const collectionLength = await redis_1.default.hLen(Tile_1.collectionsHashKey);
        // create a new collection
        const collectionId = collectionLength + 1;
        const collectionData = {
            collectionId: collectionId,
            name: "test",
            latestBlockChecked: 0,
            startedBlock: 0,
            endBlock: 0,
        };
        const newCollection = await redis_1.default.hSet(Tile_1.collectionsHashKey, collectionId, JSON.stringify(collectionData));
        return {
            status: "success",
            collectionId: collectionLength,
        };
    }
    catch (err) {
        console.log("error creating new collection", err);
        return { status: "error", collectionId: 0 };
    }
};
exports.createNewCollection = createNewCollection;
const updateCollectionMeta = async (collectionId) => {
    try {
        // fetch the collection
        const collections = await (0, RedisHelpers_1.fetchHash)(Tile_1.collectionsHashKey);
        // find collection by id
    }
    catch (err) {
        console.log("error updating collection meta", err);
    }
};
exports.updateCollectionMeta = updateCollectionMeta;
// fetch the pending txs by address
const checkPendingByAddress = async (address) => {
    // const latestTransactions = await getLatestTxFromAddress(
    //   "SP2MYPTSQE3NN1HYDQWB1G06G20E6KFTDWWMEG93W"
    // );
    return null;
};
exports.checkPendingByAddress = checkPendingByAddress;
//# sourceMappingURL=collection.js.map