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
  Object.keys(collections).forEach(async (key) => {
    const parsedCollection = JSON.parse(collections[key]);
    const [collectionAddress, collectionName] = key.split(".");
    // check if collection is a badger

    const promise = await Promise.all(
      Object.keys(parsedCollection).map((token) => {
        const nftsToCheckBalance: any = [];
        let index = 0;
        if (nftsToCheckBalance[index] === undefined) {
          nftsToCheckBalance.push([]);
        }
        if (nftsToCheckBalance[index].length > 4) {
          index = index + 1;
        }
        nftsToCheckBalance[index].push({
          stxVal: someCV(uintCV(token)),
          jsVal: token,
          collection:key
        });
        return nftsToCheckBalance;
      })
    ).then((nftsToCheckBalance) => {
      return nftsToCheckBalance[0];
    });

    promise.forEach(async (list: any) => {
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

      cleanValue.forEach(async (value: any, index: number) => {
        const tileAmount = parseInt(value.value);
        const tokenId = list[index].jsVal;
        const collectionId = list[index].collection;
        const data = { [tokenId]: tileAmount };
        await redis.hSet("3:COLLECTION", collectionId, JSON.stringify(data));
      });
    });
  });
  return 0;
};

export default addAmount;
