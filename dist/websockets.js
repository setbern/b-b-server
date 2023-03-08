"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startUpWebSocket = void 0;
const blockchain_api_client_1 = require("@stacks/blockchain-api-client");
const collection_1 = require("./modules/collection");
const startUpWebSocket = async () => {
    const client = await (0, blockchain_api_client_1.connectWebSocketClient)("wss://stacks-node-api.mainnet.stacks.co/");
    //console.log("client", client);
    const microblock = await client.subscribeMicroblocks((event) => {
        (0, collection_1.checkLatestSuccesfultx)();
    });
    const blocks = await client.subscribeBlocks((event) => {
        (0, collection_1.checkLatestSuccesfultx)();
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
exports.startUpWebSocket = startUpWebSocket;
//# sourceMappingURL=websockets.js.map