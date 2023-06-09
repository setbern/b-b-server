import substractAmount from '../nft/services/substractAmount.service';
import redis from '../redis';
import { getLatestTxFromBoard } from '../stacks';
import { fetchHash, getKeyAtHash } from './RedisHelpers';
import {
  APPROVED_TILE,
  COLLECTION_KEY_GEN,
  COLLECTION_STATUS,
  PENDING_TILE,
  PENDING_TX,
} from './Tile';

const boardId = '3';
export const checkLatestBlock = async () => {
  // last processed block
  const latestBlockHeight = await redis.get(`${boardId}:LATEST_BLOCK`);

  // last block in the hiro
  const rawStacksBlocks = await fetch(
    'https://api.mainnet.hiro.so/extended/v1/block'
  );

  //   const rawStacksBlocks = await fetch(
  //     `https://api.mainnet.hiro.so/extended/v1/tx/block_height/108524`
  //   );
  const stacksBlocks = await rawStacksBlocks.json();
  //   const results = stacksBlocks.results.map((block) => block.tx_id);

  const lastBlockFromStacks = stacksBlocks.results[0];
  //   const lastBlockFromStacks = { txs: results };

  const blockHeight = stacksBlocks.results[0].height ?? 108524;
  //   if theres no latest block, set it to the latest block
  if (!latestBlockHeight) {
    return processBlock(blockHeight, lastBlockFromStacks.txs);
  }

  // if the latest block is less than the latest block, start processsing
  if (blockHeight > latestBlockHeight) {
    return processBlock(blockHeight, lastBlockFromStacks.txs);
  }
  console.log('already processed block');
};

export const processBlock = async (
  blockHeight: number,
  txsFromBlock: string[]
) => {
  try {
    // get the pending txs
    const pendingTransactions = (await fetchHash(
      boardId + ':PENDING'
    )) as PENDING_TX[];
    if (!pendingTransactions) {
      console.log('no pending transactions in board');
      return;
    }

    const approvedTransactions: PENDING_TX[] = [];

    console.log('pendingTransactions', pendingTransactions);

    // check if the txId is in the approved txs
    for (const pendingTileKey in pendingTransactions) {
      const pendingTile = pendingTransactions[pendingTileKey];
      const pendingTileTxId = pendingTile.txId;
      console.log('pendingTileTxId', pendingTileTxId);

      // check if the txId is in the last three blocks
      const approvedTxId = txsFromBlock.find(
        (tx) => tx === `0x${pendingTileTxId}`
      );

      if (approvedTxId) {
        approvedTransactions.push(pendingTile);
      }
    }

    // if approved txs is empty, return
    if (approvedTransactions.length === 0) {
      console.log('No approved transactions from board');
      await redis.set(`${boardId}:LATEST_BLOCK`, blockHeight);
      return;
    }

    // convert the approved txs to approved tiles
    const converted = convertPendingTileToApproved(approvedTransactions);

    if (!converted) {
      console.log('no converted');
      return;
    }
    console.log('pendingTiles', approvedTransactions);

    // save the latest block once done
    await redis.set(`${boardId}:LATEST_BLOCK`, blockHeight);
  } catch (err) {
    console.log('processBlock', err);
  }
};

export const checkLatestSuccessfulTx = async () => {
  try {
    // get the latest block
    const initalWalletFetchHolding = (await getLatestTxFromBoard(0)) as any;

    let totalFetchedAssets = [...initalWalletFetchHolding.results];
    const totalAssetsInWallet = initalWalletFetchHolding.total;

    console.log('totalAssetsInWallet', totalFetchedAssets);

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
    //   await checkingPendingTilesInHash('3', filteredItems);
    // await addAmount()
    return filteredItems;
  } catch (err) {
    console.log('checkLatestSuccesfultx', err);
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
        // const savedNewTile = await redis.hSet(
        //   collectionStatusKey,
        //   tile.tileId,
        //   JSON.stringify(tileData)
        // );
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

        // const savedNewTile = await redis.hSet(
        //   collectionStatusKey,
        //   tile.tileId,
        //   JSON.stringify(tileData)
        // );
      }

      // remove the peding tx from the pending collection hash
    //   const deltedKeyHash = await redis.hDel(
    //     tile.collectionId + ':PENDING',
    //     tile.txId
    //   );

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

    //   Object.keys(tokenCounts).forEach(async (tokenId) => {
    //     const tokenCount = tokenCounts[parseInt(tokenId)];
    //     const tileCount = tokenCount.count;
    //     const collection = tokenCount.collection;
    //     const substractedAmount = await substractAmount(
    //       parseInt(tokenId),
    //       collection,
    //       tileCount
    //     );
    //   });
    }
    return true;
  } catch (err) {
    console.log('convertPendingTileToApproved', err);
    return false;
  }
};
