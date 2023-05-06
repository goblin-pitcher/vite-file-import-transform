## Vite-file-import-transform

项目打包替换为vite时，需要引入依赖代码转es module的库，但这类库通常不会替换项目中`const img = require("@/assets/xxxx.jpg")`的写法。

`vite`官方推荐将其替换为`new URL('@/assets/xxxx.jpg', import.meta.url).href`的写法，参考[地址](https://vitejs.dev/guide/assets.html#new-url-url-import-meta-url)

本插件即是自动将`require`的写法替换成`new URL`的写法

### 配置和用法

配置如下：

```typescript
import * as t from "@babel/types";

interface viteFileImportTransformParams {
  include?: RegExp|RegExp[];
  exclude?: RegExp|RegExp[];
  // 假设require('./xxx.jpg'), filePath即是'./xxx.jpg'对应的ast树节点，若函数返回null，则不转换
  // 该函数用于细化控制转换内容
  importPathHandler?: (filePath: t.StringLiteral|t.TemplateLiteral) => t.StringLiteral|t.TemplateLiteral|null;
}
```



用法：

```typescript
import { defineConfig } from "vite";
import viteFileImportTransform from "vite-file-import-transform";

const config = defineConfig({
  plugins: [
    viteFileImportTransform({
      // 假设只针对node_modules下的xxx库
      // include、exclude传入格式为: RegExp[]
      include: [/\.tsx?$/], // include不穿的话默认是匹配.ts和.tsx
      exclude: [],
      importPathHandler: ()=>{}
    })
  ]
})

export default config;

```

