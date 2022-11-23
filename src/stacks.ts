import fetch from "node-fetch";
export const STACKS_API = "https://stacks-node-api.mainnet.stacks.co/";

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

      console.log("tot`al", total);
      console.log("latest", latest);
      console.log("offset", offset);
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
