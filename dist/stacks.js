"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBnsName = exports.getContractLatestTX = exports.STACKS_API = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
exports.STACKS_API = "https://stacks-node-api.mainnet.stacks.co/";
//https://stacks-node-api.mainnet.stacks.co/extended/v1/address/{principal}/transactions
const getContractLatestTX = async () => {
    try {
        const contractInferface = await (0, node_fetch_1.default)(`${exports.STACKS_API}extended/v1/address/SP3D03X5BHMNSAAW71NN7BQRMV4DW2G4JB3MZAGJ8.canvas1/transactions`)
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
const getBnsName = async (prinicpal) => {
    try {
        const address = prinicpal;
        if (!address) {
            return;
        }
        return (0, node_fetch_1.default)(`https://stacks-node-api.mainnet.stacks.co/v1/addresses/stacks/${address}`)
            .then((res) => {
            if (res.ok) {
                return res.json();
            }
        })
            .then(({ names }) => {
            return names[0].toLowerCase();
        })
            .catch(() => null);
    }
    catch (err) {
        console.log("getBnsName", err);
        return undefined;
    }
};
exports.getBnsName = getBnsName;
//# sourceMappingURL=stacks.js.map