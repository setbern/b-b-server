import { Tile } from "./Tile";

type PendingTile = {
  txId: string;
  tiles: Tile[];
  principal: string;
  created_at: string;
};



export interface AddNewTileProps extends PendingTile {
  server: any;
}