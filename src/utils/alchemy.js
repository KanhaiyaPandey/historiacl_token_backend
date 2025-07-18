import { Alchemy, Network } from 'alchemy-sdk';
import dotenv from 'dotenv';
dotenv.config();

export const getAlchemyInstance = (network) => {
  const settings = {
    apiKey: network === 'polygon'
      ? process.env.ALCHEMY_POLY_URL.split('/').pop()
      : process.env.ALCHEMY_ETH_URL.split('/').pop(),
    network: network === 'polygon' ? Network.MATIC_MAINNET : Network.ETH_MAINNET,
  };
  return new Alchemy(settings);
};
