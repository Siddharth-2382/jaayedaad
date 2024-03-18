import CryptoJS from "crypto-js";

export interface siaObject {
  eTag: string;
  health: number;
  modTime: string;
  name: string;
  size: number;
  mimeType: string;
}

export default async function findExistingAssetFromSia(
  userId: string,
  assetSymbol: string,
  assetName: string,
  isManualEntry: boolean | undefined
) {
  const username = "username";
  const password = "1234";
  const basicAuth =
    "Basic " + Buffer.from(username + ":" + password).toString("base64");

  const encryptionKey =
    userId.slice(0, 4) + process.env.SIA_ENCRYPTION_KEY + userId.slice(-4);

  const res = await fetch(
    `${process.env.SIA_API_URL}/workers/object/${userId}/assets/`,
    {
      method: "GET",
      headers: {
        Authorization: basicAuth,
      },
    }
  );

  if (!res.ok) {
    return false;
  } else {
    const response: siaObject[] = await res.json();
    const assetAddressArray = response.map((res: siaObject) => res.name);

    const requests = assetAddressArray.map((address) =>
      fetch(`${process.env.SIA_API_URL}/worker/objects${address}data`, {
        method: "GET",
        headers: {
          AUthorization: basicAuth,
        },
      }).then((response) => response.json())
    );
    const responses = await Promise.all(requests);

    let assetFound = false;

    responses.forEach((response) => {
      const encryptedData = response.data;

      // Decrypting the encrypted data
      const bytes = CryptoJS.AES.decrypt(encryptedData, encryptionKey);
      const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

      // Parsing decrypted data
      const decryptedObject = JSON.parse(decryptedData);
      if (!isManualEntry) {
        if (decryptedObject.symbol === assetSymbol) {
          assetFound = true; // Set assetFound to true if symbol matches
        }
      } else {
        if (decryptedObject.name === assetName) {
          assetFound = true; // Set assetFound to true if name matches
        }
      }
    });

    return assetFound;
  }
}
