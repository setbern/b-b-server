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

const substractAmount = async (
  tokenId: number,
  collectionId: string,
  amount: number
) => {
  const boardIndex = await fetchBoardIndex(senderAddress);
  const collection = await redis.hGet(boardIndex.toString(), `${collectionId}:::${tokenId}`);
  if (!collection) {
    return 0;
  }

  const parsedCollection = JSON.parse(collection);
  const currentAmount = parsedCollection[tokenId].amount;
  console.log("current amount", currentAmount)


  const newAmount = parseInt(currentAmount) - amount;
  console.log("new amount", newAmount)
  if (newAmount < 0) {
    return 0;
  }
  await redis.hSet(
    boardIndex.toString(), 
    `${collectionId}:::${tokenId}`,
    JSON.stringify({
      ...parsedCollection,
      [tokenId]: { amount: newAmount },
    })
  );
  return newAmount;
};

export default substractAmount;
