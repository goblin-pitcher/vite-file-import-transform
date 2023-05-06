"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  default: () => src_default
});
module.exports = __toCommonJS(src_exports);
var parser = __toESM(require("@babel/parser"));
var import_traverse = __toESM(require("@babel/traverse"));
var import_generator = __toESM(require("@babel/generator"));
var t = __toESM(require("@babel/types"));
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
      (0, import_traverse.default)(ast, {
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
      const output = (0, import_generator.default)(ast);
      return output;
    }
  };
};
var src_default = viteFileImportTransform;
