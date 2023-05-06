const { readFileSync, writeFileSync } = require("fs");
const { glob } = require("glob");
const viteSloppyMode = require("../dist/index").default;

glob("__test__/case1/*.ts", {
  ignore: "**/*transformed_result.ts"
}).then(async (files: string[])=>{
  const pluginOptions = viteSloppyMode({include: [/\.ts$/]});
  for (const file of files) {
      const fileContent = readFileSync(file, 'utf-8');
      if(!pluginOptions?.transform) {
        throw new Error("there are something wrong with the plugin..")
      }
      const transformedContent = await pluginOptions?.transform(fileContent, file);
      writeFileSync(file.replace('.ts', '_transformed_result.ts'), transformedContent.code);
  }
})