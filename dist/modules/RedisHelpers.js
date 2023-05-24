"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKeyAtHash = exports.fetchHash = exports.parseHashJSON = void 0;
const redis_1 = __importDefault(require("../redis"));
// parse hash JSON
// parses a hash returned from redis
const parseHashJSON = (hashObj) => {
    // create a new obejct with same keys as hashObj but with values parsed as JSON
    const parsedHashObj = Object.keys(hashObj).reduce((acc, key) => {
        return Object.assign(Object.assign({}, acc), { [key]: JSON.parse(hashObj[key]) });
    }, {});
    return parsedHashObj;
};
exports.parseHashJSON = parseHashJSON;
// fetch all the keys of a redis hash
const fetchHash = async (key) => {
    try {
        const hashObj = await redis_1.default.hGetAll(key);
        // create a new obejct with same keys as hashObj but with values parsed as JSON
        const parsedHashObj = Object.keys(hashObj).reduce((acc, key) => {
            return Object.assign(Object.assign({}, acc), { [key]: JSON.parse(hashObj[key]) });
        }, {});
        return parsedHashObj;
    }
    catch (err) {
        console.log("fechHash error", err);
        return null;
    }
};
exports.fetchHash = fetchHash;
// fetch a spefic key from a redis hash
const getKeyAtHash = async (key, hashKey) => {
    try {
        const hashKeyRes = await redis_1.default.hmGet(hashKey, key);
        if (hashKeyRes) {
            const parsedHash = JSON.parse(hashKeyRes[0]);
            return parsedHash;
        }
        else {
            return null;
        }
    }
    catch (err) {
        console.log("getKeyAtHash error", err);
        return null;
    }
};
exports.getKeyAtHash = getKeyAtHash;
//# sourceMappingURL=RedisHelpers.js.map