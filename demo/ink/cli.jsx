#!/usr/bin/env node
import { render, useInput } from 'ink';
import meow from 'meow';
import meowhelp from 'cli-meow-help';
import meowrev, { meowparse } from 'meow-reverse';
import parse from 'shell-quote/parse.js';
import quote from 'shell-quote/quote.js';
import { createContext } from 'react';
import { useSequential } from 'react-seq';
import { useSequentialRouter } from './array-router/index.js';
import main from './main.jsx';

const name = `ink-ansi`;
const commands = {
  'show [FILE]': { desc: `Show an ANSI animation` },
  'loop [FILE]...': { desc: `Show files in a loop` },
	'list': { desc: `List ANSI files in current directory` },
};
const flags = {
  modemSpeed: {
    desc: `Emulate modem of specific baudrate`,
    alias: 'm',
    type: 'number',
    default: 56000
  },
  blinking: {
    desc: `Enable blinking text`,
    alias: 'b',
    type: 'boolean',
  },
  scrolling: {
    desc: `Enable scrolling`,
    alias: 's',
    type: 'boolean',
  },
  transparency: {
    desc: `Enable transparency`,
    alias: 't',
    type: 'boolean',
  },
};

const helpText = meowhelp({	name: `ink-ansi`,	flags, commands });
const options = { importMeta: import.meta, flags };
const { input: parts, flags: query } = meow(helpText, options);

function parseURL(_, { pathname }) {
  const argv = parse(pathname);
  const { input: parts, flags: query } = meowparse(argv, options);
  return { parts, query };
}

function createURL(_, { parts: input, query: flags }) {
  const argv = meowrev({ input, flags }, options);
  const pathname = quote(argv);
  return new URL(`argv:${pathname}`);
}

function applyURL(currentURL) {
  globalThis.location.href = currentURL.href;
}

globalThis.location = createURL(null, { parts, query });

const SpecialContext = createContext();

function App() {
  useInput((input) => {
    if (input.toLowerCase() === 'q') {
      process.exit(0);
    }
  })
  // use command-line URL
  const override = { createURL, parseURL, applyURL };
  const [ parts, query, rMethods, { createContext, createBoundary } ] = useSequentialRouter(override);
  return createContext(useSequential((sMethods) => {
    const methods = { ...rMethods, ...sMethods };
    const { fallback, wrap, trap, reject } = methods;
    // default fallback (issue #142 in React-seq 0.9.0)
    fallback(null);
    // create error boundary
    wrap(children => createBoundary(children));
    // redirect error from boundary to generator function
    trap('error', err => reject(err));
    // method for managing route
    methods.manageRoute = () => [ parts, query ];
    return main(methods);
  }, [ parts, query, rMethods, createBoundary ]));
}

render(<App />);
