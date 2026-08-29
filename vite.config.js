import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(async ({ command }) => {
  const plugins = [
    tailwindcss(),
    tanstackStart({
      // Redirect the bundled server entry to src/server.js (our SSR error wrapper).
      server: { entry: "server" },
    }),
  ];

  if (command === "build") {
    const { nitro } = await import("nitro/vite");
    plugins.push(nitro({ preset: "netlify" }));
  }

  plugins.push(viteReact());

  return {
    plugins,
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
      dedupe: [
        "react",
        "react-dom",
        "@tanstack/react-router",
        "@tanstack/react-query",
        "@tanstack/react-start",
      ],
    },
    server: {
      host: "::",
      port: 8080,
      strictPort: true,
      allowedHosts: true,
    },
  };
});
