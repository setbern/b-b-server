"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TileSchema = exports.Tile = exports.getTileRepository = void 0;
const redis_om_1 = require("redis-om");
const redis_1 = __importDefault(require("../redis"));
class Tile extends redis_om_1.Entity {
}
exports.Tile = Tile;
const TileSchema = new redis_om_1.Schema(Tile, {
    tileId: { type: "number" },
    txId: { type: "string" },
    wallet: { type: "string" },
    color: { type: "string" },
    created_at: { type: "number" },
}, {
    dataStructure: "JSON",
});
exports.TileSchema = TileSchema;
const getTileRepository = async () => {
    const redisOm = await new redis_om_1.Client().use(redis_1.default);
    const thing = redisOm.fetchRepository(TileSchema);
    await thing.createIndex();
    return thing;
};
exports.getTileRepository = getTileRepository;
//# sourceMappingURL=Tile.js.map