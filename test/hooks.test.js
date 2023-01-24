import { expect } from 'chai';
import { readFile } from 'fs/promises';
import { createElement } from 'react';
import { delay } from 'react-seq';
import { withTestRenderer } from './test-renderer.js';
import { createSteps } from './step.js';

import {
  useANSI
} from '../index.js';

describe('#useANSI()', function() {
  it('should yield once when modem speed is infinite', async function() {
    await withTestRenderer(async ({ render, toJSON }) => {
      const steps = createSteps();
      const outputs = [];
      const dataSource = readFile(resolve('./ansi/LDA-GARFIELD.ANS'));
      let count = 0;
      function Test() {
        const screen = useANSI(dataSource, {
          modemSpeed: Infinity
        });
        outputs.push(screen);
        steps[count++].done();
        return 'Hello';
      }
      const el = createElement(Test);
      await render(el);
      await steps[0];
      await steps[1];
      expect(outputs[0]).to.equal(null);
      expect(outputs[1]).to.be.an('object');
      const { width, height, blinked, willBlink, lines } = outputs[1];
      expect(width).to.equal(80);
      expect(height).to.equal(40);
      expect(blinked).to.be.false;
      expect(willBlink).to.be.false;
      expect(lines).to.have.lengthOf(40);
      for (const line of lines) {
        const text = line.map(s => s.text).join('');
        expect(text).to.have.lengthOf(80);
      }
    });
  })
  it('should return the result immediately when data source is a blob', async function() {
    await withTestRenderer(async ({ render, toJSON }) => {
      const steps = createSteps();
      const outputs = [];
      const dataSource = await readFile(resolve('./ansi/LDA-GARFIELD.ANS'));
      let count = 0;
      function Test() {
        const screen = useANSI(dataSource, {
          modemSpeed: Infinity
        });
        outputs.push(screen);
        steps[count++].done();
        return 'Hello';
      }
      const el = createElement(Test);
      await render(el);
      await steps[0];
      expect(outputs[0]).to.be.an('object');
      const { width, height, blinked, willBlink, lines } = outputs[0];
      expect(width).to.equal(80);
      expect(height).to.equal(40);
      expect(blinked).to.be.false;
      expect(willBlink).to.be.false;
      expect(lines).to.have.lengthOf(40);
      for (const line of lines) {
        const text = line.map(s => s.text).join('');
        expect(text).to.have.lengthOf(80);
      }
    });
  })
  it('should handle blinking text', async function() {
    await withTestRenderer(async ({ render, toJSON }) => {
      const steps = createSteps();
      const outputs = [];
      const dataSource = await readFile(resolve('./ansi/US-CANDLES.ANS'));
      let count = 0;
      function Test() {
        const screen = useANSI(dataSource, {
          modemSpeed: Infinity,
          blinking: true,
          frameDuration: 10,
          blinkDuration: 50,
        });
        outputs.push(screen);
        steps[count++].done();
        return 'Hello';
      }
      const el = createElement(Test);
      await render(el);
      await steps[0];
      expect(outputs[0]).to.be.an('object');
      const { width, height, blinked, willBlink, lines } = outputs[0];
      expect(width).to.equal(80);
      expect(height).to.equal(25);
      expect(blinked).to.be.false;
      expect(willBlink).to.be.true;
      await steps[1];
      const { blinked: blinked1 } = outputs[1];
      expect(blinked1).to.be.true;
    });
  })
  it('should interpret blink flag as bright background when blinking is false', async function() {
    await withTestRenderer(async ({ render, toJSON }) => {
      const steps = createSteps();
      const outputs = [];
      const dataSource = await readFile(resolve('./ansi/US-CANDLES.ANS'));
      let count = 0;
      function Test() {
        const screen = useANSI(dataSource, {
          modemSpeed: Infinity,
          blinking: false,
          frameDuration: 10,
          blinkDuration: 50,
        });
        outputs.push(screen);
        steps[count++].done();
        return 'Hello';
      }
      const el = createElement(Test);
      await render(el);
      await steps[0];
      expect(outputs[0]).to.be.an('object');
      const { width, height, blinked, willBlink, lines } = outputs[0];
      expect(width).to.equal(80);
      expect(height).to.equal(25);
      expect(blinked).to.be.false;
      expect(willBlink).to.be.false;
    });
  })
  it('should not go into a loop at the end when blinking is only truthy', async function() {
    await withTestRenderer(async ({ render, toJSON }) => {
      const steps = createSteps();
      const outputs = [];
      const dataSource = await readFile(resolve('./ansi/US-CANDLES.ANS'));
      let count = 0;
      function Test() {
        const screen = useANSI(dataSource, {
          modemSpeed: Infinity,
          blinking: 'manual',
          frameDuration: 10,
          blinkDuration: 50,
        });
        outputs.push(screen);
        steps[count++].done();
        return 'Hello';
      }
      const el = createElement(Test);
      await render(el);
      await steps[0];
      expect(outputs[0]).to.be.an('object');
      const { width, height, blinked, willBlink, lines } = outputs[0];
      expect(width).to.equal(80);
      expect(height).to.equal(25);
      expect(blinked).to.be.false;
      expect(willBlink).to.be.true;
      await Promise.race([ delay(75), steps[1] ]);
      expect(outputs).to.have.lengthOf(1);
    });
  })
})

function resolve(path) {
  return (new URL(path, import.meta.url)).pathname;
}