import { FastifyPluginAsync } from 'fastify';
import { _addNewTile } from '../../modules/Tile';
import getTileAmount from '../services/getTileAmount.service';
import addAmount from '../services/addAmount.service';

const updateTileAmount: FastifyPluginAsync = async (fastify, _opts) => {
  fastify.post<{
    Body: string;
    Reply: { status?: string };
  }>('/update-tile-amount', async (req, reply) => {
    addAmount();
    return { status: 'ok' };
  });
};

export default updateTileAmount;
