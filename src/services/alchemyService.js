// src/services/alchemyService.js
import { Alchemy, Network } from 'alchemy-sdk';

export const getAlchemyInstance = (network) => {
    const apiKey = network === 'polygon'
      ? process.env.ALCHEMY_POLY_API_KEY
      : process.env.ALCHEMY_ETH_API_KEY;

  const settings = {
    apiKey,
    network: network === 'polygon' ? Network.MATIC_MAINNET : Network.ETH_MAINNET,
  };

  return new Alchemy(settings);
};

export const getPriceFromAlchemy = async (token, network, timestamp) => {

  return { price: 1.0, timestamp };
};

export const getTokenCreationTimestamp = async (token, network) => {
  try {
    const alchemy = getAlchemyInstance(network);
    console.log(`📦 Fetching token creation timestamp for token: ${token} on ${network}`);

    const transfers = await alchemy.core.getAssetTransfers({
      fromBlock: '0x0',
      toBlock: 'latest',
      contractAddresses: [token],
      category: ['erc20'],
      order: 'asc',
      maxCount: 1,
    });

    const firstTx = transfers?.transfers?.[0];

    if (!firstTx) {
      console.warn(`⚠️ No transfers found for token: ${token}`);
      return null;
    }

    const block = await alchemy.core.getBlock(firstTx.blockNum);
    const timestamp = block?.timestamp;

    if (!timestamp) {
      console.warn(`⚠️ No timestamp for block ${firstTx.blockNum}`);
      return null;
    }

    console.log(`✅ Token creation timestamp: ${timestamp}`);
    return timestamp;
  } catch (error) {
    console.error(`❌ Error in getTokenCreationTimestamp:`, error);
    return null;
  }
};


