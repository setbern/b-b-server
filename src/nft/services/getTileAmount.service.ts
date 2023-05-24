import redis from "../../redis";

const getTileAmount = async (tokenId: string, collectionId: string) => {
  // await redis.hSet(collectionId,tokenId, 12 )
  
  const rawCollection = await redis.hGet("3:COLLECTION", collectionId);
  if (!rawCollection) {
    // get the tiles for that collection
    if (
      collectionId ===
        "SP27F9EJH20K3GT6GHZG0RD08REZKY2TDMD6D9M2Z.baby-badgers" ||
      collectionId ===
        "SP27F9EJH20K3GT6GHZG0RD08REZKY2TDMD6D9M2Z.btc-badgers-v2"
    ) {
      const data = { [tokenId]: 12 };
      await redis.hSet("3:COLLECTION", collectionId, JSON.stringify(data));
      return 12;
    }

    // save the new token id to that collection

    const data = { [tokenId] : 6 };
    await redis.hSet("3:COLLECTION", collectionId, JSON.stringify(data));
    return 6;
  }

  const collection = JSON.parse(rawCollection)
  if(!collection[tokenId])
  {
    if (
      collectionId ===
        "SP27F9EJH20K3GT6GHZG0RD08REZKY2TDMD6D9M2Z.baby-badgers" ||
      collectionId ===
        "SP27F9EJH20K3GT6GHZG0RD08REZKY2TDMD6D9M2Z.btc-badgers-v2"
    ) {
      const data = { ...collection, [tokenId]: 12 };
      await redis.hSet("3:COLLECTION", collectionId, JSON.stringify(data));
      return 12;
    }

    // save the new token id to that collection

    const data = { ...collection, [tokenId] : 6 };
    await redis.hSet("3:COLLECTION", collectionId, JSON.stringify(data));
    return 6;
  }


  // get amount from NFT
  const amount = collection[tokenId];

  return parseInt(amount);
};

export default getTileAmount;
