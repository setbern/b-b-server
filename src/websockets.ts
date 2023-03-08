import { connectWebSocketClient } from "@stacks/blockchain-api-client";
import {
  checkLatestSuccesfultx,
  checkPendingTilesFromMicoblockUpdates,
} from "./modules/collection";

export const startUpWebSocket = async () => {
  const client = await connectWebSocketClient(
    "wss://stacks-node-api.mainnet.stacks.co/"
  );
  //console.log("client", client);

  const microblock = await client.subscribeMicroblocks((event: any) => {
    checkLatestSuccesfultx();
  });
  const blocks = await client.subscribeBlocks((event: any) => {
    checkLatestSuccesfultx();
  });
  // const sub = await client.subscribeAddressTransactions(
  //   "SP3D03X5BHMNSAAW71NN7BQRMV4DW2G4JB3MZAGJ8",
  //   (event: any) => {
  //     console.log("subscribeAddressTransactions");
  //     console.log(event);
  //   }
  // );

  //await sub.unsubscribe();
};
