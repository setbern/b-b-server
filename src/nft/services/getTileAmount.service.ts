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

const getTileAmount = async (tokenId: string, collectionId: string) => {
  const boardIndex = await fetchBoardIndex(senderAddress);
  const rawAmount = await redis.hGet(boardIndex.toString(), `${collectionId}:::${tokenId}`);


  if (!rawAmount) {
    const initialAmount = collectionId.includes('baby-badgers') || collectionId.includes('btc-badgers-v2')
      ? 24 // Set initial amount to 24 for baby and badgers collections
      : 12; // Set initial amount to 12 for other collections

    await redis.hSet(boardIndex.toString(), `${collectionId}:::${tokenId}`, initialAmount.toString());
    return initialAmount;
  }

  return parseInt(rawAmount);
};

export default getTileAmount;
