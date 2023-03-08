"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatestTxFromBoard = exports.getLatestBlocks = exports.getBlockInfo = exports.getBnsName = exports.getContractLatestTX = exports.CONTRACT_NAME = exports.CONTRACT_ADDRESSS = exports.STACKS_API = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
exports.STACKS_API = "https://stacks-node-api.mainnet.stacks.co/";
exports.CONTRACT_ADDRESSS = "SP68D5TNN9JH6G582VK824XR47VQABPAZSK9C1SD";
exports.CONTRACT_NAME = "bos-board";
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
const getBlockInfo = async (block) => {
    try {
        const blockInfo = await (0, node_fetch_1.default)(`${exports.STACKS_API}extended/block/by_height/${block}`)
            .then((res) => res.text())
            .then((text) => text);
        if (blockInfo) {
            const clean = JSON.parse(blockInfo);
            return clean;
        }
        else {
            return null;
        }
    }
    catch (err) {
        console.log("getBlockInfo", err);
        return null;
    }
};
exports.getBlockInfo = getBlockInfo;
const getLatestBlocks = async () => {
    try {
        const latestBlocksRes = await (0, node_fetch_1.default)(`${exports.STACKS_API}extended/v1/block`)
            .then((res) => res.text())
            .then((text) => text);
        if (latestBlocksRes) {
            const clean = JSON.parse(latestBlocksRes);
            return clean;
        }
        else {
            return null;
        }
    }
    catch (err) {
        console.log("getLatestBlocks err", err);
        return null;
    }
};
exports.getLatestBlocks = getLatestBlocks;
const getLatestTxFromBoard = async (offset) => {
    try {
        const latestContractTx = await (0, node_fetch_1.default)(`${exports.STACKS_API}extended/v1/address/${exports.CONTRACT_ADDRESSS}.${exports.CONTRACT_NAME}/transactions?unanchored=true`)
            .then((res) => res.text())
            .then((text) => text);
        if (latestContractTx) {
            const clean = JSON.parse(latestContractTx);
            return clean;
        }
        else {
            return null;
        }
    }
    catch (err) {
        console.log("getLatestTxFromBoard err", err);
        return null;
    }
};
exports.getLatestTxFromBoard = getLatestTxFromBoard;
//# sourceMappingURL=stacks.js.map