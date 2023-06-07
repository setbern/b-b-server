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
    const collections = await redis_1.default.hGetAll('3:COLLECTION');
    // get the new balance of token in the collection
    let index = 0;
    const nftsToCheckBalance = [];
    Object.keys(collections).forEach(async (key) => {
        const parsedCollection = JSON.parse(collections[key]);
        const [collectionAddress, collectionName] = key.split('.');
        const promise = await Promise.all(Object.keys(parsedCollection).map((token) => {
            const currentToken = parsedCollection[token];
            const checked = currentToken.checked;
            const collectionId = key;
            // if the max of 10 calls if reached, finish loop
            if (nftsToCheckBalance.length > 10)
                return;
            // is the token has been checked, return
            if (checked)
                return;
            // if the token has not been checked, add it to the list of tokens to check
            if (nftsToCheckBalance.length === 0) {
                return nftsToCheckBalance.push([
                    {
                        stxVal: (0, transactions_1.someCV)((0, transactions_1.uintCV)(token)),
                        jsVal: token,
                        collection: key,
                    },
                ]);
            }
            // check that the current items in the list have the same collection
            // if they do, add the token to the list
            // if they don't, create a new list and add the token to it
            const current = nftsToCheckBalance[index];
            const lastCollection = current[current.length - 1].collection;
            if (lastCollection !== key) {
                index = index + 1;
                nftsToCheckBalance[index] = [
                    {
                        stxVal: (0, transactions_1.someCV)((0, transactions_1.uintCV)(token)),
                        jsVal: token,
                        collection: key,
                    },
                ];
                return;
            }
            if (nftsToCheckBalance[index].length > 4) {
                index = index + 1;
                nftsToCheckBalance[index] = [
                    {
                        stxVal: (0, transactions_1.someCV)((0, transactions_1.uintCV)(token)),
                        jsVal: token,
                        collection: key,
                    },
                ];
                return;
            }
            nftsToCheckBalance[index].push({
                stxVal: (0, transactions_1.someCV)((0, transactions_1.uintCV)(token)),
                jsVal: token,
                collection: key,
            });
            return nftsToCheckBalance;
        })).then(() => {
            return nftsToCheckBalance;
        });
        promise.forEach(async (list) => {
            const listcv = (0, transactions_1.listCV)(list.map((x) => x.stxVal));
            // call the contract
            try {
                const readOnlyCallBoardIndex = await (0, transactions_1.callReadOnlyFunction)({
                    contractName: stacks_1.CONTRACT_NAME,
                    contractAddress: stacks_1.CONTRACT_ADDRESSS,
                    functionName: 'get-5-item-balance',
                    functionArgs: [(0, principalCV_1.principalCV)(key), listcv],
                    senderAddress: 'SP2MYPTSQE3NN1HYDQWB1G06G20E6KFTDWWMEG93W',
                    network: new network_1.StacksMainnet(),
                });
                const cleanValue = (0, transactions_1.cvToJSON)(readOnlyCallBoardIndex).value.value;
                console.log('cleanValue', cleanValue);
                cleanValue.forEach(async (value, index) => {
                    const tileAmount = parseInt(value.value);
                    const tokenId = list[index].jsVal;
                    const collectionId = list[index].collection;
                    const rawCollection = await redis_1.default.hGet('3:COLLECTION', collectionId);
                    const collection = JSON.parse(rawCollection);
                    const data = Object.assign(Object.assign({}, collection), { [tokenId]: { amount: tileAmount, checked: true } });
                    console.log("valor>>>>", list[index], index, tileAmount, cleanValue, value, list.length);
                    // await redis.hSet('3:COLLECTION', collectionId, JSON.stringify(data));
                });
            }
            catch (error) {
                console.log('error', error);
            }
        });
    });
    console.log('done cron job');
    return 0;
};
exports.default = addAmount;
//# sourceMappingURL=addAmount.service.js.map