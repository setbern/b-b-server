import redis from "../../redis";

const getTileAmount = async (tokenId: string, collectionId: string) => {
  // await redis.hSet(collectionId,tokenId, 12 )

  const collection = await redis.hGet(collectionId, tokenId);
  if (!collection) {
    // get the tiles for that collection
    if (
      collectionId ===
        "SP27F9EJH20K3GT6GHZG0RD08REZKY2TDMD6D9M2Z.baby-badgers" ||
      collectionId ===
        "SP27F9EJH20K3GT6GHZG0RD08REZKY2TDMD6D9M2Z.btc-badgers-v2"
    ) {
      await redis.hSet(collectionId, tokenId, 12);
      return 6;
    }

    // save the new token id to that collection

    await redis.hSet(collectionId, tokenId, 6);
    return 12;
  }

  return parseInt(collection);
};

export default getTileAmount;
