export type LoaderOptions = import("./index.js").LoaderOptions;
/**
 * @param {{ rootContext: any; resourcePath: string; }} loaderContext
 */
export function isCSSModulesFile(loaderContext: {
  rootContext: any;
  resourcePath: string;
}): boolean;
/**
 * @param {any} loaderContext
 * @param {string | any[]} text
 * @param {any} locals
 */
export function getCustomResult(
  loaderContext: any,
  text: string | any[],
  locals: any
): string;
