import redis from '../../redis';
import {
  callReadOnlyFunction,
  cvToJSON,
  listCV,
  someCV,
  uintCV,
} from '@stacks/transactions';
import { CONTRACT_ADDRESSS, CONTRACT_NAME } from '../../stacks';
import { StacksMainnet } from '@stacks/network';
import { principalCV } from '@stacks/transactions/dist/clarity/types/principalCV';

const addAmountTest = async () => {
  // get all the collections
  const collections = await redis.hGetAll('3:COLLECTION');
  // get the new balance of token in the collection
  let index = 0;
  const nftsToCheckBalance: any = [];
  Object.keys(collections).forEach(async (key) => {
    const parsedCollection = JSON.parse(collections[key]);

    const promise = await Promise.all(
      Object.keys(parsedCollection).map((token) => {
        const currentToken = parsedCollection[token];
        const checked = currentToken.checked;

        // if the max of 10 calls if reached, finish loop
        if (nftsToCheckBalance.length > 20) return;

        // is the token has been checked, return
        if (checked) return;

        nftsToCheckBalance.push([
          {
            stxVal: someCV(uintCV(token)),
            jsVal: token,
            collection: key,
          },
        ]);

        return nftsToCheckBalance;
      })
    ).then(() => {
      return nftsToCheckBalance;
    });

    // console.log('promise', promise);
    promise.forEach(async (list: any) => {
      const listcv = listCV(list.map((x: any) => x.stxVal));

      // call the contract
      try {
        const readOnlyCallBoardIndex = await callReadOnlyFunction({
          contractName: CONTRACT_NAME,
          contractAddress: CONTRACT_ADDRESSS,
          functionName: 'get-5-item-balance',
          functionArgs: [principalCV(key), listcv],
          senderAddress: 'SP2MYPTSQE3NN1HYDQWB1G06G20E6KFTDWWMEG93W',
          network: new StacksMainnet(),
        });
        const cleanValue = cvToJSON(readOnlyCallBoardIndex).value.value;

        console.log('cleanValue', cleanValue);

        await cleanValue.map(async (value: any, index: number) => {
          const tileAmount = parseInt(value.value);
          const tokenId = list[index].jsVal;
          const collectionId = list[index].collection;
          const rawCollection = await redis.hGet('3:COLLECTION', collectionId);
          const collection = JSON.parse(rawCollection as string);

          const data = {
            ...collection,
            [tokenId]: { amount: tileAmount, checked: true },
          };

          // console.log(data, tokenId, tileAmount);

          await redis.hSet('3:COLLECTION', collectionId, JSON.stringify(data));
        });
      } catch (error) {
        console.log('error', error);
      }
    });
  });
  console.log('done cron job');
  return 0;
};

export default addAmountTest;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
