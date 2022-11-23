import { connectWebSocketClient } from "@stacks/blockchain-api-client";

export const startUpWebSocket = async () => {
  const client = await connectWebSocketClient(
    "wss://stacks-node-api.mainnet.stacks.co/"
  );

  const sub = await client.subscribeAddressTransactions(
    "SP3D03X5BHMNSAAW71NN7BQRMV4DW2G4JB3MZAGJ8",
    (event: any) => {
      console.log("subscribeAddressTransactions");
      console.log(event);
    }
  );

  //await sub.unsubscribe();
};
