import { expect } from 'chai';
import { readFile, stat } from 'fs/promises';
import { createElement } from 'react';
import { delay } from 'react-seq';
import { withTestRenderer } from './test-renderer.js';

import {
  AnsiText
} from '../index.js';

describe('DOM components', function() {
  describe('#AnsiText', function() {
    it('should produce empty block of text at min width and height when neither src or srcObject is provided', async function() {
      await withTestRenderer(async ({ render, toJSON }) => {
        const el = createElement(AnsiText, { minHeight: 4 });
        await render(el);
        const node = toJSON();
        expect(node).to.have.property('type', 'div');
        expect(node.props).to.eql({ className: 'AnsiText' });
        expect(node.children).to.have.lengthOf(4);
        for (const { children: line } of node.children) {
          const segment = line[0];
          expect(segment).to.have.property('type', 'span');
          expect(segment.props.style).to.have.property('color', '#aaaaaa');
          expect(segment.props.style).to.have.property('backgroundColor', undefined);
          const text = segment.children[0];
          expect(text).to.have.lengthOf(79);
          expect(text).to.match(/^\s+$/);
        }
      });
    })
    it('should output error message when fetch throws', async function() {
      await withTestRenderer(async ({ render, toJSON }) => {
        try {
          global.fetch = () => {
            // checking handling of non-ASCII characters
            throw new Error('Stało się coś strasznego');
          };
          const src = 'http://whatever';
          let error;
          const el = createElement(AnsiText, { src, minHeight: 4, onError: (err) => error = err });
          await render(el);
          const node = toJSON();
          expect(node).to.have.property('type', 'div');
          expect(node.props).to.eql({ className: 'AnsiText' });
          expect(node.children).to.have.lengthOf(4);
          const segment = node.children[0].children[0];
          expect(segment).to.have.property('type', 'span');
          expect(segment.props.style).to.have.property('color', '#aaaaaa');
          expect(segment.props.style).to.have.property('backgroundColor', '#000000');
          const text = segment.children[0];
          expect(text).to.match(/^Sta\?o si\? co\? strasznego\s+/);
          expect(error).to.be.an('error');
          } finally {
          delete global.fetch;
        }
      });
    })
    it('should accept a buffer as srcObject', async function() {
      await withTestRenderer(async ({ render, toJSON }) => {
        const srcObject = await readFile(resolve('./ansi/LDA-GARFIELD.ANS'));
        const el = createElement(AnsiText, { srcObject, maxHeight: 1024 });
        await render(el);
        const node = toJSON();
        expect(node).to.have.property('type', 'div');
        expect(node.props).to.eql({ className: 'AnsiText' });
        expect(node.children).to.have.lengthOf(40);
      });
    })
    it('should call onMetadata when file contains metadata', async function() {
      await withTestRenderer(async ({ render, toJSON }) => {
        const srcObject = await readFile(resolve('./ansi/LDA-GARFIELD.ANS'));
        let metadata = null;
        const el = createElement(AnsiText, { srcObject, modemSpeed: Infinity, onMetadata: (m) => metadata = m });
        await render(el);
        expect(metadata).to.be.an('array');
      });
    })
    it('should accept a promise as srcObject', async function() {
      await withTestRenderer(async ({ render, toJSON }) => {
        const srcObject = readFile(resolve('./ansi/LDA-GARFIELD.ANS'));
        const el = createElement(AnsiText, { srcObject, maxHeight: 1024 });
        await render(el);
        await delay(50);
        const node = toJSON();
        expect(node).to.have.property('type', 'div');
        expect(node.props).to.eql({ className: 'AnsiText' });
        expect(node.children).to.have.lengthOf(40);
      });
    })
    it('should return status through onStatus', async function() {
      await withTestRenderer(async ({ render, toJSON }) => {
        const srcObject = await readFile(resolve('./ansi/LDA-GARFIELD.ANS'));
        let status = null;
        const el = createElement(AnsiText, { 
          srcObject, 
          maxHeight: 1024,
          onStatus: s => status = s,
        });
        await render(el);
        await delay(50);
        const node = toJSON();
        expect(node).to.have.property('type', 'div');
        expect(node.props).to.eql({ className: 'AnsiText' });
        expect(node.children).to.have.lengthOf(40);
        expect(status.position).to.be.at.least(0).and.at.most(0.5);
      });
    })
    it('should display blinking text', async function() {
      await withTestRenderer(async ({ render, toJSON }) => {
        const srcObject = await readFile(resolve('./ansi/US-CANDLES.ANS'));
        const el = createElement(AnsiText, { srcObject, blinking: true, modemSpeed: Infinity, blinkDuration: 100 });
        await render(el);
        const node1 = toJSON();
        await delay(120);
        const node2 = toJSON();
        expect(node2).to.not.eql(node1);
        await delay(120);
        const node3 = toJSON();
        expect(node3).to.not.eql(node2);
        expect(node3).to.eql(node1);
      });
    })
    it('should leave out background color from undrawn area when transparency is on', async function() {
      await withTestRenderer(async ({ render, toJSON }) => {
        const srcObject = await readFile(resolve('./ansi/LDA-GARFIELD.ANS'));
        const el = createElement(AnsiText, { srcObject, transparency: true });
        await render(el);
        const node = toJSON();
        let transparentSegment;
        for (const line of node.children) {
          for (const segment of line.children) {
            if (!segment.props.style.backgroundColor) {
              transparentSegment = segment;
            }
          }
        }
        expect(transparentSegment).to.not.be.null;
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
          const el = createElement(AnsiText, { src: './ansi/LDA-GARFIELD.ANS', maxHeight: 1024 });
          await render(el);
          await delay(10);
          expect(called).to.be.true;
          const node = toJSON();
          expect(node).to.have.property('type', 'div');
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
          await delay(30);
          expect(called).to.be.true;
          const node = toJSON();
          expect(node).to.have.property('type', 'div');
          expect(node.props).to.eql({ className: 'AnsiText' });
          expect(node.children).to.have.lengthOf(22); 
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
    it('should blink text using CSS when palette is set to css', async function() {
      await withTestRenderer(async ({ render, toJSON }) => {
        const srcObject = await readFile(resolve('./ansi/US-CANDLES.ANS'));
        const el = createElement(AnsiText, { 
          srcObject, 
          blinking: true, 
          modemSpeed: Infinity, 
          blinkDuration: 100 ,
          palette: 'css',
        });
        await render(el);
        const node1 = toJSON();
        const segment = node1.children[0].children[0];
        expect(segment.props).to.not.have.property('style');
        expect(segment.props).to.have.property('className').that.matches(/fgColor\d+ bgColor\d+/);
        await delay(120);
        let blinkingSegment = null;
        for (const line of node1.children) {
          for (const segment of line.children) {
            if (/\bblink\b/.test(segment.props.className)) {
              blinkingSegment = segment;
            }
          }
        }
        expect(blinkingSegment).to.be.null;
        const node2 = toJSON();
        expect(node2).to.not.eql(node1);
        for (const line of node2.children) {
          for (const segment of line.children) {
            if (/\bblink\b/.test(segment.props.className)) {
              blinkingSegment = segment;
            }
          }
        }
        expect(blinkingSegment).to.not.be.null;
        expect(blinkingSegment.props.className).to.match(/fgColor\d+ bgColor\d+ blink\b/);
      });
    })
    it('should use CSS for blinking when blinking is also set to css', async function() {
      await withTestRenderer(async ({ render, toJSON }) => {
        const srcObject = await readFile(resolve('./ansi/US-CANDLES.ANS'));
        const el = createElement(AnsiText, { 
          srcObject, 
          blinking: 'css', 
          modemSpeed: Infinity, 
          blinkDuration: 100 ,
          palette: 'css',
        });
        await render(el);
        const node1 = toJSON();
        const segment = node1.children[0].children[0];
        expect(segment.props).to.not.have.property('style');
        expect(segment.props).to.have.property('className').that.matches(/fgColor\d+ bgColor\d+/);
        let blinkingSegment = null;
        for (const line of node1.children) {
          for (const segment of line.children) {
            if (/\bblinking\b/.test(segment.props.className)) {
              blinkingSegment = segment;
            }
          }
        }
        expect(blinkingSegment).to.not.be.null;
        expect(blinkingSegment.props.className).to.match(/fgColor\d+ bgColor\d+ blinking\b/);
        await delay(120);
        const node2 = toJSON();
        expect(node2).to.eql(node1);
      });
    })
  }) 
})
