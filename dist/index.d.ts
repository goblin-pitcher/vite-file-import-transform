import { GeneratorResult } from '@babel/generator';
import * as t from '@babel/types';

interface viteFileImportTransformParams {
    include?: RegExp | RegExp[];
    exclude?: RegExp | RegExp[];
    importPathHandler?: (filePath: t.StringLiteral | t.TemplateLiteral) => t.StringLiteral | t.TemplateLiteral | null;
}
/**
 * require('xxxx') => new URL('xxxx', import.meta.url).href
 * NOTICE:
 * 1. the plugin only works for images or other types that can be supported by [urls](https://developer.mozilla.org/en-US/docs/Web/API/URL)
 * 2. `importPathHandler` can not only solve the problem of aliases，but also control whether to convert nodes
 */
declare const viteFileImportTransform: (params?: viteFileImportTransformParams) => {
    name: string;
    transform: (code: string, id: string) => Promise<GeneratorResult>;
};

export { viteFileImportTransform as default };
