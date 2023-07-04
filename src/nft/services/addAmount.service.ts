import redis from '../../redis';

import { StacksMainnet } from '@stacks/network';
import { uintCV, callReadOnlyFunction, cvToJSON } from '@stacks/transactions';
import { CONTRACT_ADDRESSS, CONTRACT_NAME, getLatestTxFromBoard } from '../../stacks';

const STACKS_API = "https://stacks-node-api.mainnet.stacks.co/";
const senderAddress = "SP3D03X5BHMNSAAW71NN7BQRMV4DW2G4JB3MZAGJ8"

export const fetchBoardIndex = async (senderAddress: string) => {
  try {
    const network = new StacksMainnet();
    const functionName = "get-board-index";
    const contractAddress = CONTRACT_ADDRESSS;
    const contractName = CONTRACT_NAME;
    const functionArgs: any = [];

    const options: any = {
      contractAddress,
      contractName,
      functionName,
      functionArgs,
      network,
      senderAddress,
    };

    const response = await callReadOnlyFunction(options);
    const jsonResponse = cvToJSON(response);
    const value = jsonResponse.value;
    return parseInt(value);
  } catch (err) {
    console.log("fetchBoardIndex err :(", err);
    return null;
  }
};

const addAmount = async () => {
  const boardIndex = await fetchBoardIndex(senderAddress);
  const collections = await redis.hGetAll(boardIndex.toString());

  for (const key in collections) {
    const parsedCollection = JSON.parse(collections[key]);

    for (const token in parsedCollection) {
      const tokenId = token;
      const collectionId = key;
      const rawCollection = await redis.hGet(boardIndex.toString(), `${collectionId}:::${tokenId}`);
      const collection = JSON.parse(rawCollection as string);

      const amount = collectionId.includes('baby-badgers') || collectionId.includes('btc-badgers-v2')
        ? 24 // Set amount to 24 for baby and badgers collections
        : 12; // Set amount to 12 for other collections

      const data = {
        ...collection,
        [tokenId]: { amount: amount },
      };

      await redis.hSet(boardIndex.toString(), `${collectionId}:::${tokenId}`, JSON.stringify(data));
    }
  }

  console.log('done cron job');
  return 0;
};

export default addAmount;

