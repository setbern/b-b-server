import redis from "../../redis";

const substractAmount = async (
  tokenId: number,
  collectionId: string,
  amount: number
) => {
  const collection = await redis.hGet(collectionId, tokenId.toString());
  if (!collection) {
    return 0;
  }

  const newAmount = parseInt(collection) - amount;
  if (newAmount < 0) {
    return 0;
  }
  await redis.hSet(collectionId, tokenId, newAmount);
  return newAmount;
};

export default substractAmount;
