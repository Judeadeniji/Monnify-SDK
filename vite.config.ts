import { defineConfig } from "vite";
import typescript from "@rollup/plugin-typescript";

export default defineConfig({
    build: {
        lib: {
            entry: "lib/index.ts",
            name: "MonnifySDK",
        },
        rollupOptions: {
            output: {
                exports: "auto",
                entryFileNames(chunkInfo) {
                    return "[name].js";
                },
                esModule: true,
            },
            treeshake: true,
            plugins: [typescript({
                tsconfig: "tsconfig.json",
            })],
        }
    },
})