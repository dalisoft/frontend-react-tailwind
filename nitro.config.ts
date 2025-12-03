import { defineConfig } from "nitro";
import { presets } from "./cloud";
import { platform } from "./config";

export default defineConfig({
  ...presets[platform],
});
