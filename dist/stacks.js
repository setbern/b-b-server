"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContractLatestTX = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const STACKS_API = "https://stacks-node-api.mainnet.stacks.co/";
//https://stacks-node-api.mainnet.stacks.co/extended/v1/address/{principal}/transactions
const getContractLatestTX = async () => {
    try {
        const contractInferface = await (0, node_fetch_1.default)(`${STACKS_API}extended/v1/address/SP3D03X5BHMNSAAW71NN7BQRMV4DW2G4JB3MZAGJ8.canvas1/transactions`)
            .then((res) => res.text())
            .then((text) => text);
        if (contractInferface) {
            const clean = JSON.parse(contractInferface);
            const total = clean.total;
            const latest = clean.results[0];
            const offset = clean.offset;
            console.log("tot`al", total);
            console.log("latest", latest);
            console.log("offset", offset);
        }
    }
    catch (err) {
        console.log("getContractLatestTX", err);
    }
};
exports.getContractLatestTX = getContractLatestTX;
//# sourceMappingURL=stacks.js.map