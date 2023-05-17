import redis from "../../redis";

const getTileAmount = async (tokenId: string, collectionId: string) => {
  // await redis.hSet(collectionId,tokenId, 12 )
  
  const collection = await redis.hGet("3:COLLECTION", collectionId);
  if (!collection) {
    // get the tiles for that collection
    if (
      collectionId ===
        "SP27F9EJH20K3GT6GHZG0RD08REZKY2TDMD6D9M2Z.baby-badgers" ||
      collectionId ===
        "SP27F9EJH20K3GT6GHZG0RD08REZKY2TDMD6D9M2Z.btc-badgers-v2"
    ) {
      const data = { [tokenId]: 12 };
      console.log(data)
      await redis.hSet("3:COLLECTION", collectionId, JSON.stringify(data));
      return 12;
    }

    // save the new token id to that collection

    const data = { [tokenId] : 6 };
    await redis.hSet("3:COLLECTION", collectionId, JSON.stringify(data));
    return 6;
  }

  const parsedCollection = JSON.parse(collection);

  // get amount from NFT
  const amount = parsedCollection[tokenId];

  return parseInt(amount);
};

export default getTileAmount;
