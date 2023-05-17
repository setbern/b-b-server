import { parse } from "path";
import redis from "../../redis";
import { callReadOnlyFunction, listCV, uintCV } from "@stacks/transactions";
import { CONTRACT_ADDRESSS, CONTRACT_NAME } from "../../stacks";
import { StacksMainnet } from "@stacks/network";
import {
  contractPrincipalCV,
  principalCV,
} from "@stacks/transactions/dist/clarity/types/principalCV";

const addAmount = async (tokenId: string, collectionId: string) => {
  // get all the collections
  const collections = await redis.hGetAll("3:COLLECTION");
  console.log("collections", collections);
  // get the new balance of token in the collection
  Object.keys(collections).forEach(async (key) => {
    const parsedCollection = JSON.parse(collections[key]);
    const [collectionAddress, collectionName] = key.split(".");
    // check if collection is a badger

    // console.log("nftsToCheckBalance", nftsToCheckBalance);
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
        nftsToCheckBalance[index].push(uintCV(token));
        return nftsToCheckBalance;
      })
    ).then((nftsToCheckBalance) => {
      console.log("nftsToCheckBalance", nftsToCheckBalance[0]);
      return nftsToCheckBalance[0];
    });

    console.log("promise", promise);

    await Promise.all(
      promise.forEach(async (list: any) => {
        console.log("list", principalCV(key), listCV(list));
        const readOnlyCallBoardIndex = await callReadOnlyFunction({
          contractName: CONTRACT_NAME,
          contractAddress: CONTRACT_ADDRESSS,
          functionName: "get-5-item-balance",
          functionArgs: [principalCV(key), listCV(list)],
          senderAddress: "SP2MYPTSQE3NN1HYDQWB1G06G20E6KFTDWWMEG93W",
          network: new StacksMainnet(),
        });
        console.log("readOnlyCallBoardIndex", readOnlyCallBoardIndex);
      })
    );
  });
  return 0;
};

export default addAmount;
