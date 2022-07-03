import { ethers } from "ethers";

export const getEventHash = (signature: string) => ethers.utils.id(signature);
export const getProvider = (url: string) => {
  if (url.slice(0, 3) === "wss") {
    return new ethers.providers.WebSocketProvider(url);
  }
  return new ethers.providers.JsonRpcProvider(url);
};
