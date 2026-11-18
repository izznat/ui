import { defineConfig } from "vite";
import solid from "@solidjs/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { fileRoutes } from "filesystem-routing/vite";

export default defineConfig({
  plugins: [
    solid({ extensions: [".jsx", ".tsx"] }),
    fileRoutes({
      dir: "src/client/routes",
    }),
    tailwindcss(),
  ],
});
