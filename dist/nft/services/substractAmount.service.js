"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = __importDefault(require("../../redis"));
const substractAmount = async (tokenId, collectionId, amount) => {
    const collection = await redis_1.default.hGet('3:COLLECTION', collectionId);
    if (!collection) {
        return 0;
    }
    const parsedCollection = JSON.parse(collection);
    const currentAmount = parsedCollection[tokenId].amount;
    const newAmount = parseInt(currentAmount) - amount;
    if (newAmount < 0) {
        return 0;
    }
    await redis_1.default.hSet('3:COLLECTION', collectionId, JSON.stringify(Object.assign(Object.assign({}, parsedCollection), { [tokenId]: { amount: newAmount, checked: false } })));
    return newAmount;
};
exports.default = substractAmount;
//# sourceMappingURL=substractAmount.service.js.map