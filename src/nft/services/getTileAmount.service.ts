import redis from "../../redis";

const getTileAmount = async (tokenId: string, collectionId: string) => {

  // await redis.hSet(collectionId,tokenId, 12 )

  const collection = await redis.hGet(collectionId, tokenId);
  if (!collection) {
    // get the tiles for that collection

    // save the new token id to that collection
    await redis.hSet(collectionId, tokenId, 12);
    return 12;
  }

  return parseInt(collection);
};

export default getTileAmount;
