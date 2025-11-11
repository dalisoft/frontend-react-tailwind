import { defineConfig } from "nitro";
import { kv, presets } from "./cloud";
import { platform } from "./config";

export default defineConfig({
  ...presets[platform],
  ...kv[platform],
});
