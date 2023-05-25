import redis from "../../redis";
import {
  callReadOnlyFunction,
  cvToJSON,
  listCV,
  someCV,
  uintCV,
} from "@stacks/transactions";
import { CONTRACT_ADDRESSS, CONTRACT_NAME } from "../../stacks";
import { StacksMainnet } from "@stacks/network";
import { principalCV } from "@stacks/transactions/dist/clarity/types/principalCV";

const addAmount = async () => {
  // get all the collections
  const collections = await redis.hGetAll("3:COLLECTION");
  // get the new balance of token in the collection
  console.log("collections", collections);
  let index = 0;
  const nftsToCheckBalance: any = [];
  Object.keys(collections).forEach(async (key) => {
    const parsedCollection = JSON.parse(collections[key]);
    // console.log('parsedCollection', parsedCollection)
    const [collectionAddress, collectionName] = key.split(".");
    // check if collection is a badger

    const promise = await Promise.all(
      Object.keys(parsedCollection).map((token) => {
        if (nftsToCheckBalance.length === 0) {
          console.log(
            "undefined",
            nftsToCheckBalance[index],
            index,
            nftsToCheckBalance
          );

          return nftsToCheckBalance.push([
            {
              stxVal: someCV(uintCV(token)),
              jsVal: token,
              collection: key,
            },
          ]);
        }
        console.log("outside", index, nftsToCheckBalance);
        if (nftsToCheckBalance[index].length > 4) {
          console.log("inside", index);
          index = index + 1;
          console.log("index", index);
          nftsToCheckBalance[index] = [
            {
              stxVal: someCV(uintCV(token)),
              jsVal: token,
              collection: key,
            },
          ];
          return;
        }
        nftsToCheckBalance[index].push({
          stxVal: someCV(uintCV(token)),
          jsVal: token,
          collection: key,
        });
        // console.log('nftsToCheckBalance', nftsToCheckBalance, token, index)
        return nftsToCheckBalance;
      })
    ).then(() => {
     
      return nftsToCheckBalance;
    });
    // console.log('promise', promise)

    promise.forEach(async (list: any) => {
      console.log("list", list);
      const readOnlyCallBoardIndex = await callReadOnlyFunction({
        contractName: CONTRACT_NAME,
        contractAddress: CONTRACT_ADDRESSS,
        functionName: "get-5-item-balance",
        functionArgs: [
          principalCV(key),
          listCV(list.map((x: any) => x.stxVal)),
        ],
        senderAddress: "SP2MYPTSQE3NN1HYDQWB1G06G20E6KFTDWWMEG93W",
        network: new StacksMainnet(),
      });
      const cleanValue = cvToJSON(readOnlyCallBoardIndex).value.value;
      // console.log('cleanValue', cleanValue)

      cleanValue.forEach(async (value: any, index: number) => {
        const tileAmount = parseInt(value.value);
        const tokenId = list[index].jsVal;
        const collectionId = list[index].collection;
        const rawCollection = await redis.hGet("3:COLLECTION", collectionId);
        const collection = JSON.parse(rawCollection as string);

        const data = { ...collection, [tokenId]: tileAmount };
        console.log(data);
        await redis.hSet("3:COLLECTION", collectionId, JSON.stringify(data));
      });
    });
  });
  return 0;
};

export default addAmount;
