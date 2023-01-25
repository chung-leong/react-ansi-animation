import { expect } from 'chai';
import { readFile, stat } from 'fs/promises';
import { createElement } from 'react';
import { delay } from 'react-seq';
import { withTestRenderer } from './test-renderer.js';
import { createSteps } from './step.js';

import {
  useAnsi
} from '../index.js';

describe('#useANSI()', function() {
  it('should yield once when modem speed is infinite', async function() {
    await withTestRenderer(async ({ render }) => {
      const steps = createSteps();
      const outputs = [];
      const dataSource = readFile(resolve('./ansi/LDA-GARFIELD.ANS'));
      let count = 0;
      function Test() {
        const screen = useAnsi(dataSource, {
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
      expect(outputs[0]).to.be.an('object');
      expect(outputs[0]).to.have.property('width', 80);
      expect(outputs[0]).to.have.property('height', 24);
      expect(outputs[1]).to.be.an('object');
      expect(outputs[1]).to.have.property('width', 80);
      expect(outputs[1]).to.have.property('height', 40);
      expect(outputs[1]).to.have.property('blinked', false);
      expect(outputs[1]).to.have.property('willBlink', false);
      expect(outputs[1]).to.have.property('lines').that.has.lengthOf(40);
      for (const line of outputs[1].lines) {
        const text = line.map(s => s.text).join('');
        expect(text).to.have.lengthOf(80);
      }
    });
  })
  it('should return the result immediately when data source is a blob', async function() {
    await withTestRenderer(async ({ render }) => {
      const steps = createSteps();
      const outputs = [];
      const dataSource = await readFile(resolve('./ansi/LDA-GARFIELD.ANS'));
      let count = 0;
      function Test() {
        const screen = useAnsi(dataSource, {
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
      expect(outputs[0]).to.have.property('width', 80);
      expect(outputs[0]).to.have.property('height', 40);
      expect(outputs[0]).to.have.property('blinked', false);
      expect(outputs[0]).to.have.property('willBlink', false);
      expect(outputs[0]).to.have.property('lines').that.has.lengthOf(40);
      for (const line of outputs[0].lines) {
        const text = line.map(s => s.text).join('');
        expect(text).to.have.lengthOf(80);
      }
    });
  })
  it('should handle blinking text', async function() {
    await withTestRenderer(async ({ render }) => {
      const steps = createSteps();
      const outputs = [];
      const dataSource = await readFile(resolve('./ansi/US-CANDLES.ANS'));
      let count = 0;
      function Test() {
        const screen = useAnsi(dataSource, {
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
      expect(outputs[0]).to.have.property('width', 80);
      expect(outputs[0]).to.have.property('height', 25);
      expect(outputs[0]).to.have.property('blinked', false);
      expect(outputs[0]).to.have.property('willBlink', true);
      await steps[1];
      expect(outputs[1]).to.have.property('blinked', true);
    });
  })
  it('should interpret blink flag as bright background when blinking is false', async function() {
    await withTestRenderer(async ({ render }) => {
      const steps = createSteps();
      const outputs = [];
      const dataSource = await readFile(resolve('./ansi/US-CANDLES.ANS'));
      let count = 0;
      function Test() {
        const screen = useAnsi(dataSource, {
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
      expect(outputs[0]).to.have.property('width', 80);
      expect(outputs[0]).to.have.property('height', 25);
      expect(outputs[0]).to.have.property('blinked', false);
      expect(outputs[0]).to.have.property('willBlink', false);
    });
  })
  it('should not go into a loop at the end when blinking is only truthy', async function() {
    await withTestRenderer(async ({ render }) => {
      const steps = createSteps();
      const outputs = [];
      const dataSource = await readFile(resolve('./ansi/US-CANDLES.ANS'));
      let count = 0;
      function Test() {
        const screen = useAnsi(dataSource, {
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
      expect(outputs[0]).to.have.property('width', 80);
      expect(outputs[0]).to.have.property('height', 25);
      expect(outputs[0]).to.have.property('blinked', false);
      expect(outputs[0]).to.have.property('willBlink', true);
      await Promise.race([ delay(75), steps[1] ]);
      expect(outputs).to.have.lengthOf(1);
    });
  })
  it('should be able to parse a file correctly at a slower speed', async function() {
    await withTestRenderer(async ({ render, unmount }) => {
      const steps = createSteps();
      const outputs = [];
      const path = resolve('./ansi/LDA-GARFIELD.ANS');
      const dataSource = await readFile(path);
      const frameDuration = 100;
      const { size } = await stat(path);
      let count = 0;
      function Test({ modemSpeed }) {
        const screen = useAnsi(dataSource, { modemSpeed, frameDuration });
        outputs.push(screen);
        steps[count++].done();
        return 'Hello';
      }
      const el1 = createElement(Test, { modemSpeed: Infinity });
      await render(el1);
      await steps[0];
      await unmount();
      const modemSpeed = 112000;
      const frameCount = Math.ceil(size / (modemSpeed / 10000) / frameDuration);
      const el2 = createElement(Test, { modemSpeed });
      await render(el2);
      await steps[frameCount];
      expect(outputs[frameCount]).to.eql(outputs[0]);
    });
  })
  it('should be able to handle a long animation', async function() {
    await withTestRenderer(async ({ render, unmount }) => {
      const steps = createSteps();
      const outputs = [];
      const path = resolve('./ansi/LM-OKC.ICE');
      const dataSource = await readFile(path);
      const frameDuration = 5;
      const { size } = await stat(path);
      let count = 0;
      function Test({ modemSpeed }) {
        const screen = useAnsi(dataSource, { modemSpeed, frameDuration });
        outputs.push(screen);
        steps[count++].done();
        return 'Hello';
      }
      const el1 = createElement(Test, { modemSpeed: Infinity });
      await render(el1);
      await steps[0];
      await unmount();
      const modemSpeed = 5600000;
      const frameCount = Math.ceil(size / (modemSpeed / 10000) / frameDuration);
      const el2 = createElement(Test, { modemSpeed });
      await render(el2);
      await steps[frameCount];
      expect(outputs[frameCount]).to.eql(outputs[0]);
    });
  })
  it('should be able to deal with empty data source', async function() {
    await withTestRenderer(async ({ render }) => {
      const steps = createSteps();
      const outputs = [];
      const array = new Uint8Array(0);
      const dataSource = array.buffer;
      let count = 0;
      function Test() {
        const screen = useAnsi(dataSource, {
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
      expect(outputs[0]).to.have.property('width', 80);
      expect(outputs[0]).to.have.property('height', 24);
    });
  })
  // *** tests for individual ANSI commands
  it('should prevent cursor from exceeding the maximum height', async function () {
    await withTestRenderer(async ({ render }) => {
      const steps = createSteps();
      const outputs = [];
      const array = new Uint8Array([
        chr('A'),
        ESC, chr('['), chr('A'),
        chr('B'),
        ESC, chr('['), chr('B'),
        ESC, chr('['), chr('B'),
        ESC, chr('['), chr('B'),
        chr('C'),
        ESC, chr('['), chr('4'), chr('B'),
        chr('D'),
      ]);
      const dataSource = array.buffer;
      let count = 0;
      function Test() {
        const screen = useAnsi(dataSource, {
          modemSpeed: Infinity,
          minHeight: 2,
          maxHeight: 4,
        });
        outputs.push(screen);
        steps[count++].done();
        return 'Hello';
      }
      const el = createElement(Test);
      await render(el);
      await steps[0];
      expect(outputs[0]).to.have.property('width', 80);
      expect(outputs[0]).to.have.property('height', 4);
      const line1 = outputs[0].lines[0];
      expect(line1[0].text).to.match(/^AB\s+$/);
      const line4 = outputs[0].lines[3];
      expect(line4[0].text).to.match(/^\s{2}CD\s+$/);
    });
  })
  it('should prevent cursor from exceeding the maximum width', async function () {
    await withTestRenderer(async ({ render }) => {
      const steps = createSteps();
      const outputs = [];
      const array = new Uint8Array([
        chr('A'),
        ESC, chr('['), chr('9'), chr('C'),
        chr('B'),
        ESC, chr('['), chr('7'), chr('A'),
        ESC, chr('['), chr('9'), chr('D'),
        chr('C'),
      ]);
      const dataSource = array.buffer;
      let count = 0;
      function Test() {
        const screen = useAnsi(dataSource, {
          modemSpeed: Infinity,
          minWidth: 2,
          maxWidth: 4,
        });
        outputs.push(screen);
        steps[count++].done();
        return 'Hello';
      }
      const el = createElement(Test);
      await render(el);
      await steps[0];
      expect(outputs[0]).to.have.property('width', 4);
      expect(outputs[0]).to.have.property('height', 24);
      const line1 = outputs[0].lines[0];
      expect(line1[0].text).to.match(/^C\s+B$/);
    });
  })
  it('should should wrap at screen edge', async function () {
    await withTestRenderer(async ({ render }) => {
      const steps = createSteps();
      const outputs = [];
      const array = new Uint8Array([
        chr('A'),
        ESC, chr('['), chr('C'),
        ESC, chr('['), chr('C'),
        chr('B'),   
        chr('C'),                 // line 2
        ESC, chr('['), chr('D'),
        ESC, chr('['), chr('B'),  // line 3
        ESC, chr('['), chr('B'),  // line 4
        chr('D'),
        chr('E'),
        chr('F'),
        chr('G'),
        chr('H'),
      ]);
      const dataSource = array.buffer;
      let count = 0;
      function Test() {
        const screen = useAnsi(dataSource, {
          modemSpeed: Infinity,
          minHeight: 2,
          maxHeight: 4,
          minWidth: 2,
          maxWidth: 4,
        });
        outputs.push(screen);
        steps[count++].done();
        return 'Hello';
      }
      const el = createElement(Test);
      await render(el);
      await steps[0];
      expect(outputs[0]).to.have.property('width', 4);
      expect(outputs[0]).to.have.property('height', 4);
      const line1 = outputs[0].lines[0];
      expect(line1[0].text).to.match(/^A\s+B$/);
      const line2 = outputs[0].lines[1];
      expect(line2[0].text).to.match(/^C\s+$/);
      const line4 = outputs[0].lines[3];
      expect(line4[0].text).to.match(/^HEFG$/);
    });
  })

})

function resolve(path) {
  return (new URL(path, import.meta.url)).pathname;
}

function chr(s) {
  return s.charCodeAt(0);
}

const ESC = 0x1b;
