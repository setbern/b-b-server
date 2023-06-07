import redis from '../../redis';

const substractAmount = async (
  tokenId: number,
  collectionId: string,
  amount: number
) => {
  const collection = await redis.hGet('3:COLLECTION', collectionId);
  if (!collection) {
    return 0;
  }

  const parsedCollection = JSON.parse(collection);
  const currentAmount = parsedCollection[tokenId].amount;

  const newAmount = parseInt(currentAmount) - amount;
  if (newAmount < 0) {
    return 0;
  }
  await redis.hSet(
    '3:COLLECTION',
    collectionId,
    JSON.stringify({
      ...parsedCollection,
      [tokenId]: { amount: newAmount, checked: false },
    })
  );
  return newAmount;
};

export default substractAmount;
