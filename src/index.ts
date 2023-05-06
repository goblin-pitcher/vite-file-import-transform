import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import generate, { GeneratorResult } from "@babel/generator";
import * as t from "@babel/types";

interface viteFileImportTransformParams {
  include?: RegExp|RegExp[];
  exclude?: RegExp|RegExp[];
  importPathHandler?: (filePath: t.StringLiteral|t.TemplateLiteral) => t.StringLiteral|t.TemplateLiteral|null;
}

/**
 * require('xxxx') => new URL('xxxx', import.meta.url).href
 * NOTICE:
 * 1. the plugin only works for images or other types that can be supported by [urls](https://developer.mozilla.org/en-US/docs/Web/API/URL)
 * 2. `importPathHandler` can not only solve the problem of aliases，but also control whether to convert nodes
 */

const viteFileImportTransform = (params?: viteFileImportTransformParams) => {
  const { include = /\.tsx?$/, exclude = [], importPathHandler = ((path) => path) as Required<viteFileImportTransformParams>["importPathHandler"] } = params || {};
  const includeArr = ([] as RegExp[]).concat(include);
  const excludeArr = ([] as RegExp[]).concat(exclude);
  const checkFilePath = (filePath: string) => {
    return includeArr.some(reg => reg.test(filePath))
            && excludeArr.every(reg => !(reg.test(filePath)));
  };
  const isStringType = (filePath: t.Node) => t.isStringLiteral(filePath) || t.isTemplateLiteral(filePath);
  const importMeta = t.metaProperty(t.identifier("import"), t.identifier("meta"));
  const importMetaUrl = t.memberExpression(importMeta, t.identifier("url"));
  return {
    name: "vite-url-loader",
    transform: async (code: string, id: string) => {
			let newCode = code;
			let sourcemap: GeneratorResult["map"] = null;
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
            const transFilePath = importPathHandler(filePath as t.StringLiteral|t.TemplateLiteral);
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

export default viteFileImportTransform;