"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = __importDefault(require("../../redis"));
const transactions_1 = require("@stacks/transactions");
const stacks_1 = require("../../stacks");
const network_1 = require("@stacks/network");
const principalCV_1 = require("@stacks/transactions/dist/clarity/types/principalCV");
const addAmount = async () => {
    // get all the collections
    const collections = await redis_1.default.hGetAll("3:COLLECTION");
    // get the new balance of token in the collection
    Object.keys(collections).forEach(async (key) => {
        const parsedCollection = JSON.parse(collections[key]);
        const [collectionAddress, collectionName] = key.split(".");
        // check if collection is a badger
        const promise = await Promise.all(Object.keys(parsedCollection).map((token) => {
            const nftsToCheckBalance = [];
            let index = 0;
            if (nftsToCheckBalance[index] === undefined) {
                nftsToCheckBalance.push([]);
            }
            if (nftsToCheckBalance[index].length > 4) {
                index = index + 1;
            }
            nftsToCheckBalance[index].push({
                stxVal: (0, transactions_1.someCV)((0, transactions_1.uintCV)(token)),
                jsVal: token,
                collection: key
            });
            return nftsToCheckBalance;
        })).then((nftsToCheckBalance) => {
            return nftsToCheckBalance[0];
        });
        promise.forEach(async (list) => {
            const readOnlyCallBoardIndex = await (0, transactions_1.callReadOnlyFunction)({
                contractName: stacks_1.CONTRACT_NAME,
                contractAddress: stacks_1.CONTRACT_ADDRESSS,
                functionName: "get-5-item-balance",
                functionArgs: [
                    (0, principalCV_1.principalCV)(key),
                    (0, transactions_1.listCV)(list.map((x) => x.stxVal)),
                ],
                senderAddress: "SP2MYPTSQE3NN1HYDQWB1G06G20E6KFTDWWMEG93W",
                network: new network_1.StacksMainnet(),
            });
            const cleanValue = (0, transactions_1.cvToJSON)(readOnlyCallBoardIndex).value.value;
            cleanValue.forEach(async (value, index) => {
                const tileAmount = parseInt(value.value);
                const tokenId = list[index].jsVal;
                const collectionId = list[index].collection;
                const rawCollection = await redis_1.default.hGet("3:COLLECTION", collectionId);
                const collection = JSON.parse(rawCollection);
                const data = Object.assign(Object.assign({}, collection), { [tokenId]: tileAmount });
                await redis_1.default.hSet("3:COLLECTION", collectionId, JSON.stringify(data));
            });
        });
    });
    return 0;
};
exports.default = addAmount;
//# sourceMappingURL=addAmount.service.js.map