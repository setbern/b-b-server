import redis from '../redis';

export const checkLatestBlock = async () => {
  // last processed block
const latestBlockHeight = await redis.get('3:LATEST_BLOCK');

  // last block in the hiro

  const rawStacksBlocks = await fetch(
    'https://api.mainnet.hiro.so/extended/v1/block'
  );
  const stacksBlocks = await rawStacksBlocks.json();

  const blockHeight = stacksBlocks.results[0].height;

  //   if theres no latest block, set it to the latest block
  if (!latestBlockHeight) {
    return processBlock(blockHeight);
  }

  // if the latest block is less than the latest block, start processsing
  if (latestBlockHeight < blockHeight) {
    return processBlock(blockHeight);
  }

  console.log('latestStackBlock', blockHeight, latestBlockHeight);
};

export const processBlock = async (blockHeight: number) => {
  try {
    // processing the block

    // save the latest block once done
    await redis.set('3:LATEST_BLOCK', blockHeight);
  } catch (err) {
    console.log('processBlock', err);
  }
};
