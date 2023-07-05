import { FastifyPluginAsync } from "fastify";
import addAmount from "../services/addAmount.service";
import { StacksMainnet } from "@stacks/network";
import { uintCV, callReadOnlyFunction, cvToJSON } from "@stacks/transactions";
import {
  CONTRACT_ADDRESSS,
  CONTRACT_NAME,
  getLatestTxFromBoard,
} from "../../stacks";

const STACKS_API = "https://stacks-node-api.mainnet.stacks.co/";
const senderAddress = "SP3D03X5BHMNSAAW71NN7BQRMV4DW2G4JB3MZAGJ8";
const contract_address = "SP3D03X5BHMNSAAW71NN7BQRMV4DW2G4JB3MZAGJ8";

export const fetchRemainingBlocks = async (senderAddress: string) => {
  try {
    const network = new StacksMainnet();
    const functionName = "get-board-time-remaining";
    const contractAddress = contract_address;
    const contractName = CONTRACT_NAME;
    const functionArgs: any = [uintCV(1)];

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
    const value = jsonResponse.value.value;
    return parseInt(value);
  } catch (err) {
    console.log("fetchRemainingBlocks err :(", err);
    return null;
  }
};

export const trackRemainingBlocks = async () => {
  let currentNumber = await fetchRemainingBlocks(senderAddress);

  if (currentNumber !== null) {
    console.log(`Current Time Remaining: ${currentNumber}`);
    if (currentNumber === 864) {
      console.log(
        "Do something when number becomes equal to or lower than 864"
      );
      await addAmount(); // Reset NFT collections
    } else if (currentNumber === 1728) {
      console.log(
        "Do something when number becomes equal to or lower than 1,728"
      );
      await addAmount(); // Reset NFT collections
    } else if (currentNumber === 2592) {
      console.log(
        "Do something when number becomes equal to or lower than 2,592"
      );
      await addAmount(); // Reset NFT collections
    } else if (currentNumber === 3456) {
      console.log(
        "Do something when number becomes equal to or lower than 3,456"
      );
      await addAmount(); // Reset NFT collections
    } else if (currentNumber === 4320) {
      console.log(
        "Do something when number becomes equal to or lower than 4,320"
      );
      await addAmount(); // Reset NFT collections
    } else {
      console.log("Do something for other cases");
      // Perform an action for any other cases not covered by the above conditions
    }
  } else {
    console.log("Current number is null");
  }
};

const runTrackRemainingBlocks = () => {
  setInterval(async () => {
    await trackRemainingBlocks();
  }, 60000); // Run every minute (60000 milliseconds)
};

//runTrackRemainingBlocks();

const updateTileAmount: FastifyPluginAsync = async (fastify, _opts) => {
  fastify.post<{
    Body: string;
    Reply: { status?: string };
  }>("/update-tile-amount", async (req, reply) => {
    await addAmount();
    return { status: "ok" };
  });
};

export default updateTileAmount;
