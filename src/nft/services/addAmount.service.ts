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

const addAmount = async () => {
  // get all the collections
  const collections = await redis.hGetAll('3:COLLECTION');
  // get the new balance of token in the collection
  let index = 0;
  const nftsToCheckBalance: any = [];
  Object.keys(collections).forEach(async (key) => {
    const parsedCollection = JSON.parse(collections[key]);

    const [collectionAddress, collectionName] = key.split('.');

    const promise = await Promise.all(
      Object.keys(parsedCollection).map((token) => {
        const currentToken = parsedCollection[token];
        const checked = currentToken.checked;
        const collectionId = key;

        // if the max of 10 calls if reached, finish loop
        if (nftsToCheckBalance.length > 10) return;

        // is the token has been checked, return
        if (checked) return;

        // if the token has not been checked, add it to the list of tokens to check
        if (nftsToCheckBalance.length === 0) {
          return nftsToCheckBalance.push([
            {
              stxVal: someCV(uintCV(token)),
              jsVal: token,
              collection: key,
            },
          ]);
        }

        // check that the current items in the list have the same collection
        // if they do, add the token to the list
        // if they don't, create a new list and add the token to it

        const current = nftsToCheckBalance[index];
        const lastCollection = current[current.length - 1].collection;

        if (lastCollection !== key) {
          index = index + 1;
          nftsToCheckBalance[index] = [
            {
              stxVal: someCV(uintCV(token)),
              jsVal: token,
              collection: key,
            },
          ];
          return;
        }

        if (nftsToCheckBalance[index].length > 4) {
          index = index + 1;
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
        return nftsToCheckBalance;
      })
    ).then(() => {
      return nftsToCheckBalance;
    });

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
        cleanValue.forEach(async (value: any, index: number) => {
          const tileAmount = parseInt(value.value);
          const tokenId = list[index].jsVal;
          const collectionId = list[index].collection;
          const rawCollection = await redis.hGet('3:COLLECTION', collectionId);
          const collection = JSON.parse(rawCollection as string);

          
          const data = {
            ...collection,
            [tokenId]: { amount: tileAmount, checked: true },
          };

          await redis.hSet('3:COLLECTION', collectionId, JSON.stringify(data));
        });
      } catch (error) {
        console.log('error', error)
      }
    });
  });
  console.log('done cron job');
  return 0;
};

export default addAmount;
