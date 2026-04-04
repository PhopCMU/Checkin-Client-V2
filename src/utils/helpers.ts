import CryptoJs from "crypto-js";
export const encryptPayload = (payload: object) => {
  const encrypted = CryptoJs.AES.encrypt(
    JSON.stringify(payload),
    import.meta.env.VITE_CRYPTO_SECRET_KEY,
  ).toString();
  return encodeURIComponent(encrypted);
};
