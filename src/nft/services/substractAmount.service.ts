import redis from "../../redis";

const substractAmount = async (
  tokenId: string,
  collectionId: string,
  amount: number
) => {
  const collection = await redis.hGet(collectionId, tokenId);
  if (!collection) {
    return 0;
  }

  const newAmount = parseInt(collection) - amount;
  await redis.hSet(collectionId, tokenId, newAmount);
  return newAmount;
};
