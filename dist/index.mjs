// src/index.ts
import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import generate from "@babel/generator";
import * as t from "@babel/types";
var viteFileImportTransform = (params) => {
  const { include = /\.tsx?$/, exclude = [], importPathHandler = (path) => path } = params || {};
  const includeArr = [].concat(include);
  const excludeArr = [].concat(exclude);
  const checkFilePath = (filePath) => {
    return includeArr.some((reg) => reg.test(filePath)) && excludeArr.every((reg) => !reg.test(filePath));
  };
  const isStringType = (filePath) => t.isStringLiteral(filePath) || t.isTemplateLiteral(filePath);
  const importMeta = t.metaProperty(t.identifier("import"), t.identifier("meta"));
  const importMetaUrl = t.memberExpression(importMeta, t.identifier("url"));
  return {
    name: "vite-url-loader",
    transform: async (code, id) => {
      let newCode = code;
      let sourcemap = null;
      if (!checkFilePath(id)) {
        return {
          code: newCode,
          map: sourcemap
        };
      }
      const ast = parser.parse(code, {
        sourceType: "module",
        sourceFilename: id
      });
      traverse(ast, {
        Identifier: (path) => {
          if (path.isIdentifier({ name: "require" }) && t.isCallExpression(path.parentPath?.node)) {
            const filePath = path.parentPath.node.arguments[0];
            if (!isStringType(filePath)) {
              return;
            }
            const transFilePath = importPathHandler(filePath);
            if (!transFilePath) {
              return;
            }
            const callExp = t.newExpression(t.identifier("URL"), [
              transFilePath,
              importMetaUrl
            ]);
            const decoMemberExp = t.memberExpression(callExp, t.identifier("href"));
            path.parentPath.replaceWith(decoMemberExp);
          }
        }
      });
      const output = generate(ast);
      return output;
    }
  };
};
var src_default = viteFileImportTransform;
export {
  src_default as default
};
