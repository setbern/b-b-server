import { Tile } from "./Tile";

type PendingTile = {
  txId: string;
  tiles: Tile[];
  principal: string;
};



export interface AddNewTileProps extends PendingTile {
  server: any;
}