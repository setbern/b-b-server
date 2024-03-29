import fetch from "node-fetch";
export const STACKS_API = "https://stacks-node-api.mainnet.stacks.co/";

export const CONTRACT_ADDRESSS = "SP68D5TNN9JH6G582VK824XR47VQABPAZSK9C1SD";
export const CONTRACT_NAME = "bos-board";
//https://stacks-node-api.mainnet.stacks.co/extended/v1/address/{principal}/transactions

export const getContractLatestTX = async () => {
  try {
    const contractInferface = await fetch(
      `${STACKS_API}extended/v1/address/SP3D03X5BHMNSAAW71NN7BQRMV4DW2G4JB3MZAGJ8.canvas1/transactions`
    )
      .then((res: any) => res.text())
      .then((text: any) => text);

    if (contractInferface) {
      const clean = JSON.parse(contractInferface);
      const total = clean.total;
      const latest = clean.results[0];
      const offset = clean.offset;

      
    }
  } catch (err) {
    console.log("getContractLatestTX", err);
  }
};

export const getBnsName = async (prinicpal: string) => {
  try {
    const address = prinicpal;
    if (!address) {
      return;
    }
    return fetch(
      `https://stacks-node-api.mainnet.stacks.co/v1/addresses/stacks/${address}`
    )
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
      })
      .then(({ names }) => {
        return names[0].toLowerCase();
      })
      .catch(() => null);
  } catch (err) {
    console.log("getBnsName", err);

    return undefined;
  }
};

export const getBlockInfo = async (block: number) => {
  try {
    const blockInfo = await fetch(
      `${STACKS_API}extended/block/by_height/${block}`
    )
      .then((res: any) => res.text())
      .then((text: any) => text);

    if (blockInfo) {
      const clean = JSON.parse(blockInfo);
      return clean;
    } else {
      return null;
    }
  } catch (err) {
    console.log("getBlockInfo", err);
    return null;
  }
};

export const getLatestBlocks = async () => {
  try {
    const latestBlocksRes = await fetch(`${STACKS_API}extended/v1/block`)
      .then((res: any) => res.text())
      .then((text: any) => text);

    if (latestBlocksRes) {
      const clean = JSON.parse(latestBlocksRes);
      return clean;
    } else {
      return null;
    }
  } catch (err) {
    console.log("getLatestBlocks err", err);
    return null;
  }
};

export const getLatestTxFromBoard = async (offset: number) => {
  try {
    const latestContractTx = await fetch(
      `${STACKS_API}extended/v1/address/${CONTRACT_ADDRESSS}.${CONTRACT_NAME}/transactions?unanchored=true`
    )
      .then((res: any) => res.text())
      .then((text: any) => text);

    if (latestContractTx) {
      const clean = JSON.parse(latestContractTx);
      return clean;
    } else {
      return null;
    }
  } catch (err) {
    console.log("getLatestTxFromBoard err", err);
    return null;
  }
};

export const getLatestTxFromAddress = async (address: string) => {
  try {
    const rawData = await fetch(`${STACKS_API}extended/v1/tx/mempool`);

    if (!rawData.ok) {
      throw new Error("Failed to fetch transactions");
    }

    const data = await rawData.json();

    const pendingInteractions = data.results.filter(
      (tx: any) => tx.sender_address === address
    );
    // .filter(
    //   (tx: any) =>
    //     tx.tx_type === "contract_call" &&
    //     tx.contract_call.contract_id === CONTRACT_ADDRESSS + ".bos-board"
    // );
    console.log(pendingInteractions);
    if (pendingInteractions.length > 0) {
      return pendingInteractions;
    } else {
      return null;
    }
  } catch (err) {
    console.log("getLatestTxFromBoard err", err);
    return null;
  }
};
