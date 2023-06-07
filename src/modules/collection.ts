import { object } from 'zod';
import { PostTilesQuery, TEST_REDIS_CHANNEL } from '..';
import addAmount from '../nft/services/addAmount.service';
import substractAmount from '../nft/services/substractAmount.service';
import redis from '../redis';
import {
  getBlockInfo,
  getBnsName,
  getLatestBlocks,
  getLatestTxFromAddress,
  getLatestTxFromBoard,
  STACKS_API,
} from '../stacks';
import { fetchHash, getKeyAtHash } from './RedisHelpers';
import {
  APPROVED_TILE,
  COLLECTION,
  collectionsHashKey,
  COLLECTION_KEY_GEN,
  COLLECTION_STATUS,
  PENDING_TILE,
  PENDING_TX,
} from './Tile';

export const checkPendingTiles = async () => {
  try {
    // get the latest block
    const latestBlock = await getLatestBlocks();

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
      const collections = (await fetchHash(collectionsHashKey)) as COLLECTION[];
      if (!collections) {
        return { status: 'no collections' };
      }

      for (const collection in collections) {
        const collectionId = collections[collection].collectionId + '';
        await checkingPendingTilesInHash(
          collectionId,
          lastThreeBlocksApprovedTx
        );
      }
    }

    return { status: 'yee' };
  } catch (err) {
    console.log('checkPendingTiles', err);
  }
};

export const checkLatestSuccesfultx = async () => {
  try {
    // get the latest block
    const initalWalletFetchHolding = (await getLatestTxFromBoard(0)) as any;

    let totalFetchedAssets = [...initalWalletFetchHolding.results];
    const totalAssetsInWallet = initalWalletFetchHolding.total;

    if (totalAssetsInWallet >= 50) {
      while (totalAssetsInWallet > totalFetchedAssets.length) {
        const nextWalletFetchHolding = (await getLatestTxFromBoard(
          totalFetchedAssets.length
        )) as any;

        totalFetchedAssets = [
          ...totalFetchedAssets,
          ...nextWalletFetchHolding.results,
        ];
      }
    }

    const filteredItems = totalFetchedAssets
      .filter((item: any) => {
        if (item.tx_status === 'success' && item.tx_type === 'contract_call') {
          if (item.contract_call.function_name) {
            if (
              item.contract_call.function_name ===
              'place-tiles-many-collections'
            ) {
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
    await checkingPendingTilesInHash('3', filteredItems);
    // await addAmount();
    console.log('finished checking');
    return 'yeet';
  } catch (err) {
    console.log('checkLatestSuccesfultx', err);
  }
};
export const checkPendingTilesFromMicoblockUpdates = async (txs: string[]) => {
  try {
    const collectionId = '3';
    const runIt = await checkingPendingTilesInHash(collectionId, txs);
  } catch (err) {
    console.log('err', err);
  }
};
const checkingPendingTilesInHash = async (
  collectionId: string,
  approvedTx: string[]
) => {
  try {
    console.log('approved txs', approvedTx);

    // get the hash of the specfic collection
    const pendingTiles = (await fetchHash(
      collectionId + ':PENDING'
    )) as PENDING_TX[];
    if (!pendingTiles) {
      return { status: 'no pending tiles' };
    }
    // check if any of the pending tiles exist in the last three blocks

    const approvedTiles: PENDING_TX[] = [];

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
  } catch (err) {
    console.log('checkingPendingTilesInHash', err);
  }
};

const convertPendingTileToApproved = async (tiles: PENDING_TX[]) => {
  try {
    const flattenTiles: PENDING_TILE[] = tiles.reduce(
      (acc: PENDING_TILE[], tile: PENDING_TX) => {
        const tilesArr = tile.tiles.map((d, i) => {
          return {
            ...tile,
            ...d,
          };
        });
        return [...acc, ...tilesArr];
      },
      []
    );
    for (const tile of flattenTiles) {
      // fetch the tile from reids
      const collectionStatusKey = COLLECTION_KEY_GEN(
        tile.collectionId,
        COLLECTION_STATUS.APPROVED
      );
      const tileLookUp = await getKeyAtHash(
        `${tile.tileId}`,
        collectionStatusKey
      );
      if (tileLookUp) {
        // already exist need to update it with its' history
        const approvedTile = tileLookUp as APPROVED_TILE;

        const tileData: APPROVED_TILE = {
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
        const savedNewTile = await redis.hSet(
          collectionStatusKey,
          tile.tileId,
          JSON.stringify(tileData)
        );
      } else {
        // does not exist need to create it with its state
        const tileData: APPROVED_TILE = {
          id: tile.tileId,
          color: tile.color,
          history: [],
          created_at: new Date().toString(),
          txId: tile.txId,
          principal: tile.principal,
        };

        const savedNewTile = await redis.hSet(
          collectionStatusKey,
          tile.tileId,
          JSON.stringify(tileData)
        );
      }

      // remove the peding tx from the pending collection hash
      const deltedKeyHash = await redis.hDel(
        tile.collectionId + ":PENDING",
        tile.txId
      );

      const tokenCounts: any = {};

      tile.tiles.forEach((obj) => {
        const tokenId = obj.tokenId as number;
        const collection = obj.collection as string;
        if (tokenId in tokenCounts) {
          tokenCounts[tokenId] = {
            collection: tile.collection,
            count: tokenCounts[tokenId].count + 1,
          };
        } else {
          tokenCounts[tokenId] = { collection: tile.collection, count: 1 };
        }
      });

      Object.keys(tokenCounts).forEach(async (tokenId) => {
        const tokenCount = tokenCounts[parseInt(tokenId)];
        const tileCount = tokenCount.count;
        const collection = tokenCount.collection;
        const substractedAmount = await substractAmount(
          parseInt(tokenId),
          collection,
          tileCount
        );
      });
    }
  } catch (err) {
    console.log('convertPendingTileToApproved', err);
  }
};

export const startCollection = async (collectionId: string) => {
  try {
    // fetch the collection wanting to start
    const collection = (await getKeyAtHash(
      collectionId,
      collectionsHashKey
    )) as COLLECTION;

    // fetch the latest block
    const latestBlock = await getLatestBlocks();

    if (latestBlock.results && latestBlock.results.length > 0) {
      const latestBlockItem = latestBlock.results[0].height;

      const latestMeta: COLLECTION = {
        ...collection,
        latestBlockChecked: 0,
        startedBlock: latestBlockItem,
      };
      // save the key
      const savedCollection = await redis.hSet(
        collectionsHashKey,
        collection.collectionId,
        JSON.stringify(latestMeta)
      );
      return {
        status: 'success',
      };
    } else {
      throw new Error('no latest block found');
    }
  } catch (err) {
    console.log('err', err);
    return {
      status: 'Error',
      error: err,
    };
  }
};
export const createNewCollection = async () => {
  try {
    // get the length of the collection

    //const collectionCheck = await getKeyAtHash("0", collectionsHashKey);

    const collectionLength = await redis.hLen(collectionsHashKey);
    // create a new collection
    const collectionId = collectionLength + 1;
    const collectionData = {
      collectionId: collectionId,
      name: 'test',
      latestBlockChecked: 0,
      startedBlock: 0,
      endBlock: 0,
    };
    const newCollection = await redis.hSet(
      collectionsHashKey,
      collectionId,
      JSON.stringify(collectionData)
    );

    return {
      status: 'success',
      collectionId: collectionLength,
    };
  } catch (err) {
    console.log('error creating new collection', err);
    return { status: 'error', collectionId: 0 };
  }
};

export const updateCollectionMeta = async (collectionId: number) => {
  try {
    // fetch the collection
    const collections = await fetchHash(collectionsHashKey);

    // find collection by id
  } catch (err) {
    console.log('error updating collection meta', err);
  }
};

// fetch the pending txs by address
export const checkPendingByAddress = async (address: string) => {
  // const latestTransactions = await getLatestTxFromAddress(
  //   "SP2MYPTSQE3NN1HYDQWB1G06G20E6KFTDWWMEG93W"
  // );

  return null;
};
