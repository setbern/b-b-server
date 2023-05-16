import {
  AddNewTileProps,
  PENDING_TX,
  Tile,
  testPendingContractKey,
} from "../../modules/Tile";
import redis from "../../redis";

const place = async (params: AddNewTileProps) => {
  try {
    const tilesClean = params.tiles as Tile[];
    const cleanUp = tilesClean.map((d, i) => {
      return {
        tileId: d.position,
        color: d.color,
      };
    });
    console.log('here>>>>>>>>>>>>', cleanUp)

    const data: PENDING_TX = {
      tiles: cleanUp,
      txId: params.txId,
      principal: params.principal,
      collectionId: 2,
    };

    const keyName = params.txId;
    const pendingCollectionId = testPendingContractKey;

    const saveLatestHash = await redis.hSet(
      pendingCollectionId,
      keyName,
      JSON.stringify(data)
    );

    return { status: "Added to pending" };
  } catch (err) {
    console.log("error in _addNewTile", err);
  }
};

export default place;
