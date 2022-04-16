import { defineConfig, UserConfigExport } from "vite";
import vue from "@vitejs/plugin-vue";
import { existsSync, readFileSync } from "fs";
import Components from "unplugin-vue-components/vite";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";

const cert = {
  key: ".cert/localhost-key.pem",
  cert: ".cert/localhost.pem",
};

const config: UserConfigExport = {
  plugins: [
    vue({
      reactivityTransform: true,
    }),
    Components({
      resolvers: [NaiveUiResolver()],
    }),
  ],
};

if (existsSync(cert.key) && existsSync(cert.cert)) {
  !config.server && (config.server = {});
  config.server.https = {
    key: readFileSync(cert.key),
    cert: readFileSync(cert.cert),
  };
}

export default defineConfig(config);
