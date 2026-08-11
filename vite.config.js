import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import { fileURLToPath } from "url";
import postCssPxToRem from "postcss-pxtorem";

// 自动导入
import AutoImport from "unplugin-auto-import/vite";

const fileName = fileURLToPath(import.meta.url);
const _dirname = path.dirname(fileName);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      // 使用
      imports: ["vue"],
      dts: "src/auto-import.d.ts",
    }),
  ],
  css: {
    postcss: {
      plugins: [
        postCssPxToRem({
          // 自适应，px>rem转换
          rootValue: 16, // 75表示750设计稿，37.5表示375设计稿
          propList: ["*"], // 需要转换的属性，这里选择全部都进行转换
          exclude: "/node_modules", // 忽略包文件转换rem
        }),
      ],
    },
    preprocessorOptions: {
      less: {
        additionalData: `@import "@/style/variable.less";`, // 全局变量
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(_dirname,"./src"),
      "^": path.resolve(_dirname,"./src/assets/images"),
      "#": path.resolve(_dirname,"./src/editor"),
    },
  },
  server: {
    hmr: false,
  },
});
