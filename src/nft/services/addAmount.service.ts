import redis from "../../redis";

const addAmount = async (
  tokenId: string,
  collectionId: string,
  amount: number
) => {
  const collection = await redis.hGet(collectionId, tokenId);
  if (!collection) {
    await redis.hSet(collectionId, tokenId, amount);
    return amount;
  }

  const newAmount = parseInt(collection) + amount;
  await redis.hSet(collectionId, tokenId, newAmount);
  return newAmount;
};
