import { defineConfig } from "rollup";
import typescript from "@rollup/plugin-typescript";

export default defineConfig({
  input: "lib/index.ts",
  output: [
    {
      file: "dist/index.js",
      format: "esm",
      exports: "auto",
      esModule: true,
    },
    {
      file: "dist/index.cjs",
      format: "cjs",
      exports: "auto",
      esModule: true,
    },
    {
      file: "dist/index.umd.js",
      format: "umd",
      name: "MonnifySDK",
      exports: "auto",
      esModule: true,
    },
  ],
  plugins: [
    typescript({
      tsconfig: "./tsconfig.json",
    }),
  ],
});
