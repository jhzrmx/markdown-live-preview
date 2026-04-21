import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

const repositoryTarget = "markdown-live-preview/";

export default defineConfig({
  plugins: [solid(), tailwindcss()],
  base: `/${repositoryTarget}`,
  build: {
    target: "esnext",
  },
});
