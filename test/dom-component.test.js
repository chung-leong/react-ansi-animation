import { expect } from 'chai';
import { readFile, stat } from 'fs/promises';
import { createElement } from 'react';
import { delay } from 'react-seq';
import { withTestRenderer } from './test-renderer.js';

import {
  AnsiText
} from '../index.js';

describe('#AnsiText', function() {
  it('should produce empty block of text at min width and height when neither src or srcObject is provided', async function() {
    await withTestRenderer(async ({ render, toJSON }) => {
      const el = createElement(AnsiText, { minHeight: 4 });
      await render(el);
      const node = toJSON();
      expect(node).to.have.property('type', 'code');
      expect(node.props).to.eql({ className: 'AnsiText' });
      expect(node.children).to.have.lengthOf(4);
      for (const { children: line } of node.children) {
        const segment = line[0];
        expect(segment).to.have.property('type', 'span');
        expect(segment.props.style).to.have.property('color', '#aaaaaa');
        expect(segment.props.style).to.have.property('backgroundColor', '#000000');
        const text = segment.children[0];
        expect(text).to.have.lengthOf(80);
        expect(text).to.match(/^\s+$/);
      }
    });
  })
  it('should output error message when data source throws', async function() {
    await withTestRenderer(async ({ render, toJSON }) => {
      const srcObject = (async () => {
        throw new Error('This is a test');
      })();
      const el = createElement(AnsiText, { srcObject, minHeight: 4 });
      await render(el);
      const node = toJSON();
      expect(node).to.have.property('type', 'code');
      expect(node.props).to.eql({ className: 'AnsiText' });
      expect(node.children).to.have.lengthOf(4);
      const segment = node.children[0].children[0];
      expect(segment).to.have.property('type', 'span');
      expect(segment.props.style).to.have.property('color', '#aaaaaa');
      expect(segment.props.style).to.have.property('backgroundColor', '#000000');
      const text = segment.children[0];
      expect(text).to.match(/^This is a test\s+/);
    });
  })
  it('should accept a buffer as srcObject', async function() {
    await withTestRenderer(async ({ render, toJSON }) => {
      const srcObject = await readFile(resolve('./ansi/LDA-GARFIELD.ANS'));
      const el = createElement(AnsiText, { srcObject });
      await render(el);
      const node = toJSON();
      expect(node).to.have.property('type', 'code');
      expect(node.props).to.eql({ className: 'AnsiText' });
      expect(node.children).to.have.lengthOf(40);
    });
  })
  it('should accept a promise as srcObject', async function() {
    await withTestRenderer(async ({ render, toJSON }) => {
      const srcObject = readFile(resolve('./ansi/LDA-GARFIELD.ANS'));
      const el = createElement(AnsiText, { srcObject });
      await render(el);
      await delay(50);
      const node = toJSON();
      expect(node).to.have.property('type', 'code');
      expect(node.props).to.eql({ className: 'AnsiText' });
      expect(node.children).to.have.lengthOf(40);
    });
  })
  it('should display blinking text', async function() {
    await withTestRenderer(async ({ render, toJSON }) => {
      const srcObject = await readFile(resolve('./ansi/US-CANDLES.ANS'));
      const el = createElement(AnsiText, { srcObject, blinking: true, blinkDuration: 100 });
      await render(el);
      const node1 = toJSON();
      await delay(120);
      const node2 = toJSON();
      expect(node2).to.not.eql(node1);
    });
  })
  it('should load data through fetch when src is given', async function() {
    await withTestRenderer(async ({ render, toJSON }) => {
      let called = false;
      global.fetch = async function(path) {
        called = true;
        const data = await readFile(resolve(path));
        return {
          status: 200,
          statusText: 'OK',
          arrayBuffer: async () => data,
        };
      };
      try {
        const el = createElement(AnsiText, { src: './ansi/LDA-GARFIELD.ANS' });
        await render(el);
        await delay(10);
        expect(called).to.be.true;
        const node = toJSON();
        expect(node).to.have.property('type', 'code');
        expect(node.props).to.eql({ className: 'AnsiText' });
        expect(node.children).to.have.lengthOf(40); 
      } finally {
        delete global.fetch;
      }
    });
  })
  it('should display error when fetch does not return 200 OK', async function() {
    await withTestRenderer(async ({ render, toJSON }) => {
      let called = false;
      global.fetch = async function(path) {
        called = true;
        await delay(10);
        return {
          status: 404,
          statusText: 'Not Found',
        };
      };
      try {
        const el = createElement(AnsiText, { src: './ansi/LDA-GARFIELD.ANS' });
        await render(el);
        await delay(10);
        expect(called).to.be.true;
        const node = toJSON();
        expect(node).to.have.property('type', 'code');
        expect(node.props).to.eql({ className: 'AnsiText' });
        expect(node.children).to.have.lengthOf(24); 
        const segment = node.children[0].children[0];
        expect(segment).to.have.property('type', 'span');
        expect(segment.props.style).to.have.property('color', '#aaaaaa');
        expect(segment.props.style).to.have.property('backgroundColor', '#000000');
        const text = segment.children[0];
        expect(text).to.match(/^HTTP 404 \- Not Found\s+$/);
      } finally {
        delete global.fetch;
      }
    });
  })
})

function resolve(path) {
  return (new URL(path, import.meta.url)).pathname;
}