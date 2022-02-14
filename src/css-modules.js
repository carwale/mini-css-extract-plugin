import path from "path";

import postcss from "postcss";
import { interpolateName } from "loader-utils";
import normalizePath from "normalize-path";
import cssesc from "cssesc";

// Source: https://github.com/webpack-contrib/css-loader/blob/v3.5.2/src/utils.js

// eslint-disable-next-line no-control-regex
const filenameReservedRegex = /[<>:"/\\|?*\x00-\x1F]/g;
// eslint-disable-next-line no-control-regex
const reControlChars = /[\u0000-\u001f\u0080-\u009f]/g;
const reRelativePath = /^\.+/;

/**
 * @param {{ rootContext: any; resourcePath: string; }} loaderContext
 * @param {string} localIdentName
 */
function getLocalIdent(loaderContext, localIdentName) {
  const options = {
    context: loaderContext.rootContext,
    content: "",
    hashPrefix: "",
    regExp: null,
  };

  const request = normalizePath(
    path.relative(options.context || "", loaderContext.resourcePath)
  );

  // eslint-disable-next-line no-param-reassign
  options.content = `${options.hashPrefix + request}`;

  // Using `[path]` placeholder outputs `/` we need escape their
  // Also directories can contains invalid characters for css we need escape their too
  return cssesc(
    interpolateName(loaderContext, localIdentName, options)
      // For `[hash]` placeholder
      .replace(/^((-?[0-9])|--)/, "_$1")
      .replace(filenameReservedRegex, "-")
      .replace(reControlChars, "-")
      .replace(reRelativePath, "-")
      .replace(/\./g, "-"),
    { isIdentifier: true }
  ).replace(/\\\[local\\\]/gi, "");
}

const CSS_MODULES_REGEX = new RegExp(/\.module\.scss$/);
const LOCAL_IDENT_NAME = "[hash:base64:10]";

/**
 * @param {{ rootContext: any; resourcePath: string; }} loaderContext
 */
function isCSSModulesFile(loaderContext) {
  const request = normalizePath(
    path.relative(loaderContext.rootContext || "", loaderContext.resourcePath)
  );

  return CSS_MODULES_REGEX.test(request);
}

/**
 * @param {any} loaderContext
 * @param {string | any[]} text
 * @param {any} locals
 */
function getCustomResult(loaderContext, text, locals) {
  const cssContent = text.length > 0 ? text[0].content || "" : "";
  const cssRoot = postcss.parse(cssContent);
  const cssRules = new Set();

  cssRoot.walkRules((rule) => {
    // @ts-ignore
    if (rule.parent.type === "atrule") {
      // @ts-ignore
      cssRules.add(rule.parent.toString());
    } else {
      cssRules.add(rule.toString());
    }
  });

  const fileId = getLocalIdent(loaderContext, LOCAL_IDENT_NAME);
  let result = "";

  result = `\nmodule.exports = ${JSON.stringify(locals)};`;
  result += `\nmodule.exports.__css__ = ${JSON.stringify(
    Array.from(cssRules)
  )};`;
  result += `\nmodule.exports.__id__ = "${fileId}";`;

  return result;
}

export { isCSSModulesFile, getCustomResult };
