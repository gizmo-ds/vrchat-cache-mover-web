<script setup lang="ts">
import { computed } from "vue";
import { useOsTheme, darkTheme } from "naive-ui";
import { useClipboard } from "@vueuse/core";
import hljs from "highlight.js/lib/core";
import _json from "highlight.js/lib/languages/json";
import { BrandGithub } from "@vicons/tabler";
import pkg from "../package.json";

hljs.registerLanguage("json", _json);

const osTheme = useOsTheme();
const theme = computed(() => (osTheme.value === "dark" ? darkTheme : null));

let fileHandle: FileSystemFileHandle;
let config = $ref({ cache_directory: "" });
const configP = computed(() => JSON.stringify(config, null, 2));
let whoami = $ref("");

const configPath = computed(() => {
  const username = !whoami
    ? "[当前用户名]"
    : whoami.trim().includes("\\")
    ? whoami.split("\\")[1]
    : whoami;
  return `C:\\Users\\${username}\\AppData\\LocalLow\\VRChat\\VRChat\\config.json`;
});
const { copy, copied } = useClipboard({ source: configPath });

const openConfig = () => {
  window
    .showOpenFilePicker({
      multiple: false,
      excludeAcceptAllOption: true,
      types: [{ description: "JSON File", accept: { "json/*": [".json"] } }],
    })
    .then((h) => {
      if (!h) return;
      fileHandle = h[0];
      loadConfig(fileHandle);
    });
};

const loadConfig = async (fileHandle: FileSystemFileHandle) => {
  const file = await fileHandle.getFile();
  config = JSON.parse(await file.text());
};

const saveConfig = async () => {
  const data = JSON.stringify(config);
  if (!fileHandle) {
    try {
      fileHandle = await window.showSaveFilePicker({
        suggestedName: "config.json",
        types: [{ description: "JSON File", accept: { "json/*": [".json"] } }],
      });
    } catch (error) {
      alert(error);
      return;
    }
  }
  fileHandle
    .createWritable()
    .then(async (writable) => {
      await writable.write(data);
      await writable.close();
      alert("成功保存配置文件");
    })
    .catch((err) => alert(err));
};

const openGitHub = () => {
  window.open(pkg.repository.url);
};
</script>

<template>
  <n-config-provider :theme="theme" :hljs="hljs" :style="{ padding: '8px' }">
    <n-space vertical>
      <n-alert :show-icon="false">
        请在
        <n-popover trigger="hover" raw :show-arrow="false">
          <template #trigger>
            <code :style="{ color: '#8a2be2' }">CMD</code>
          </template>
          <div style="width: 100px; height: 100px; transform-origin: inherit">
            <img src="./assets/cmd_whoami.png" />
          </div>
        </n-popover>
        或
        <n-popover trigger="hover" raw :show-arrow="false">
          <template #trigger>
            <code :style="{ color: '#8a2be2' }">PowerShell</code>
          </template>
          <div style="width: 100px; height: 100px; transform-origin: inherit">
            <img src="./assets/powershell_whoami.png" />
          </div>
        </n-popover>
        下执行
        <code :style="{ color: '#ff69b4' }">whoami</code>
        命令，并将结果复制到下面的当前用户名文本框中。
      </n-alert>
      <n-input-group>
        <n-input-group-label :style="{ minWidth: '140px' }">
          当前用户名
        </n-input-group-label>
        <n-input
          v-model:value="whoami"
          type="text"
          placeholder="如: abyss\cunyu"
        />
      </n-input-group>

      <n-input-group>
        <n-input-group-label :style="{ minWidth: '140px' }">
          VRChat配置文件
        </n-input-group-label>
        <n-input v-model:value="configPath" type="text" :readonly="true" />
        <n-button type="default" @click="copy()" :disabled="whoami === ''">
          {{ copied ? "复制成功" : "复制路径" }}
        </n-button>
      </n-input-group>

      <n-button @click="openConfig" secondary type="primary">
        打开配置文件
      </n-button>

      <n-input-group>
        <n-input-group-label :style="{ minWidth: '100px' }">
          缓存目录
        </n-input-group-label>
        <n-input
          v-model:value="config.cache_directory"
          type="text"
          placeholder="如: D:\Cache\VRChat"
        />
      </n-input-group>

      <n-button @click="saveConfig" secondary type="primary">
        保存配置文件
      </n-button>

      <n-card><n-code :code="configP" language="json" /></n-card>
    </n-space>

    <n-button text class="github" type="primary" @click="openGitHub">
      <template #icon>
        <n-icon>
          <BrandGithub />
        </n-icon>
      </template>
      GitHub
    </n-button>
  </n-config-provider>
</template>

<style>
:root {
  color-scheme: dark light;
}
.github {
  position: fixed;
  bottom: 12px;
  right: 20px;
}
</style>
