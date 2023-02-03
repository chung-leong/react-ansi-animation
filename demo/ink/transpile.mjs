#!/usr/bin/env node
import { statSync, readFileSync, writeFileSync } from 'fs';
import { globbySync } from 'globby';
import jsxTransform from '@babel/plugin-transform-react-jsx';
import { transformSync } from '@babel/core';

const ext = /\.jsx$/;
const force = process.argv.includes('-f');
const src = new URL('.', import.meta.url).pathname;
const dest = src + 'bin/';

const scriptTime = mtime(import.meta.url.pathname);
for (const jsxPath of globbySync(src + '**/*.jsx', { gitignore: true })) {
  const jsPath = dest + jsxPath.substr(src.length).replace(ext, '.mjs');
  const jsTime = mtime(jsPath);
  const jsxTime = mtime(jsxPath);
  if (force || jsxTime > jsTime || scriptTime > jsTime) {
    transpile(jsxPath, jsPath);
  }
}

function transpile(jsxPath, jsPath) {
  const rawSource = readFileSync(jsxPath, 'utf-8');
  const { code } = transformSync(rawSource, {
    plugins: [
      [ renameJSX ],
      [ jsxTransform, { runtime: 'automatic' } ],
    ],
    filename: jsxPath,
    sourceMaps: 'inline',
    babelrc: false,
    configFile: false
  });
  writeFileSync(jsPath, code, 'utf-8');
}

function renameJSX({ types:t }) {
  const mjs = (source) => t.stringLiteral(source.value.replace(ext, '.mjs'));
  return {
    visitor: {
      Program: (path) => {
        const visitor = {
          ImportDeclaration: (path) => {
            const { node } = path;
            const { source } = node;
            if (ext.test(source.value)) {
              node.source = mjs(source);
            }
          },
          CallExpression: (path)  => {
            const { node } = path;
            if (t.isImport(node.callee)) {
              const [ source ] = node.arguments;
              if (t.isStringLiteral(source)) {
                if (ext.test(source.value)) {
                  node.arguments = [ mjs(source) ];
                }
              } else {
                // insert replacement operation for non-static path
                // import(path)  ==>  import((path + "").replace(/\.jsx/, ""))
                const toString = t.binaryExpression('+', source, t.stringLiteral(''));
                const replace = t.memberExpression(toString, t.identifier('replace'));
                const regExp = t.regExpLiteral(ext.source, ext.flags);
                const call = t.callExpression(replace, [ regExp, t.stringLiteral('.mjs') ]);
                node.arguments = [ call ];
              }
            }            
          }
        };
        path.traverse(visitor);
      }
    }    
  };
}

function mtime(path) {
  try {
    return statSync(path).mtime;
  } catch (err) {
    return -1;
  }
}

