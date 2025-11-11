import { useStorage } from "nitro/storage";
export const useKv = () => useStorage("data");
