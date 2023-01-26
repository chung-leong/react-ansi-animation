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
        return '';
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
        return '';
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
        return '';
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
  it('should update blink flag as animation occurs', async function() {
    await withTestRenderer(async ({ render }) => {
      const steps = createSteps();
      const outputs = [];
      const dataSource = await readFile(resolve('./ansi/US-CANDLES.ANS'));
      let count = 0;
      function Test() {
        const screen = useAnsi(dataSource, {
          modemSpeed: 224000,
          blinking: true,
          frameDuration: 25,
          blinkDuration: 50,
        });
        outputs.push(screen);
        steps[count++].done();
        return '';
      }
      const el = createElement(Test);
      await render(el);
      await delay(200);
      const blinked = outputs.filter(s => s.blinked === true);
      const unblicked = outputs.filter(s => s.blinked === false);
      expect(blinked).has.length.that.is.greaterThan(1);
      expect(unblicked).has.length.that.is.greaterThan(1);
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
        return '';
      }
      const el = createElement(Test);
      await render(el);
      await steps[0];
      expect(outputs[0]).to.be.an('object');
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
        return '';
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
        return '';
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
        return '';
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
        return '';
      }
      const el = createElement(Test);
      await render(el);
      await steps[0];
      expect(outputs[0]).to.be.an('object');
      expect(outputs[0]).to.have.property('width', 80);
      expect(outputs[0]).to.have.property('height', 24);
    });
  })
  it('should omit background color from untouched segments when transparency is on', async function() {
    await withTestRenderer(async ({ render }) => {
      const steps = createSteps();
      const outputs = [];
      const array = new Uint8Array(Array.from('This is a test').map(ord));
      const dataSource = array.buffer;
      let count = 0;
      function Test() {
        const screen = useAnsi(dataSource, {
          modemSpeed: Infinity,
          transparency: true,
        });
        outputs.push(screen);
        steps[count++].done();
        return '';
      }
      const el = createElement(Test);
      await render(el);
      await steps[0];
      expect(outputs[0]).to.be.an('object');
      expect(outputs[0]).to.have.property('width', 80);
      expect(outputs[0]).to.have.property('height', 24);
      const line1 = outputs[0].lines[0];
      expect(line1).to.have.lengthOf(2);
      expect(line1[0].text).to.equal('This is a test');
      expect(line1[0]).to.have.property('transparent', false);
      expect(line1[1]).to.have.property('transparent', true);
    });
  })
  it('should skip first pass when dimensions are fixed', async function() {
    await withTestRenderer(async ({ render }) => {
      const steps = createSteps();
      const outputs = [];
      const array = new Uint8Array(0);
      const dataSource = array.buffer;
      let count = 0;
      function Test() {
        const screen = useAnsi(dataSource, {
          modemSpeed: Infinity,
          minWidth: 40,
          maxWidth: 40,
          minHeight: 12,
          maxHeight: 12,
        });
        outputs.push(screen);
        steps[count++].done();
        return '';
      }
      const el = createElement(Test);
      await render(el);
      await steps[0];
      expect(outputs[0]).to.be.an('object');
      expect(outputs[0]).to.have.property('width', 40);
      expect(outputs[0]).to.have.property('height', 12);
      // we'll know whether the first pass got skipped from test coverage
    });
  })

  // *** tests for individual ANSI commands ***

  it('should output invalid escape sequence', async function() {
    await withTestRenderer(async ({ render }) => {
      const steps = createSteps();
      const outputs = [];
      const array = new Uint8Array([
        ord('A'),
        ESC, ord(']'), ord('A'),
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
        return '';
      }
      const el = createElement(Test);
      await render(el);
      await steps[0];
      expect(outputs[0]).to.have.property('width', 80);
      expect(outputs[0]).to.have.property('height', 2);
      const line1 = outputs[0].lines[0];
      expect(line1[0].text).to.match(/^A\u001b\]A\s+$/);
    });
  })
  it('should prevent cursor from exceeding the maximum height', async function() {
    await withTestRenderer(async ({ render }) => {
      const steps = createSteps();
      const outputs = [];
      const array = new Uint8Array([
        ord('A'),
        ESC, ord('['), ord('A'),
        ord('B'),
        ESC, ord('['), ord('B'),
        ESC, ord('['), ord('B'),
        ESC, ord('['), ord('B'),
        ord('C'),
        ESC, ord('['), ord('4'), ord('B'),
        ord('D'),
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
        return '';
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
  it('should prevent cursor from exceeding the maximum width', async function() {
    await withTestRenderer(async ({ render }) => {
      const steps = createSteps();
      const outputs = [];
      const array = new Uint8Array([
        ord('A'),
        ESC, ord('['), ord('9'), ord('C'),
        ord('B'),
        ESC, ord('['), ord('7'), ord('A'),
        ESC, ord('['), ord('9'), ord('D'),
        ord('C'),
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
        return '';
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
  it('should should wrap at screen edge', async function() {
    await withTestRenderer(async ({ render }) => {
      const steps = createSteps();
      const outputs = [];
      const array = new Uint8Array([
        ord('A'),
        ESC, ord('['), ord('C'),
        ESC, ord('['), ord('C'),
        ord('B'),   
        ord('C'),                 // line 2
        ESC, ord('['), ord('D'),
        ESC, ord('['), ord('B'),  // line 3
        ESC, ord('['), ord('B'),  // line 4
        ord('D'),
        ord('E'),
        ord('F'),
        ord('G'),
        ord('H'),
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
        return '';
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
  it('should reposition cursor', async function() {
    await withTestRenderer(async ({ render }) => {
      const steps = createSteps();
      const outputs = [];
      const array = new Uint8Array([
        ord('A'),
        ESC, ord('['), ord('8'), ord(';'), ord('4'), ord('H'),
        ord('B'),   
        ESC, ord('['), ord(';'), ord('9'), ord('H'),
        ord('C'),
        ESC, ord('['), ord('f'),
        ord('D'),
        ESC, ord('['), ord('4'), ord('H'),
        ord('E'),
        ESC, ord('['), ord('4'), ord('0'), ord('4'), ord(';'), ord('4'), ord('0'), ord('4'), ord('H'),
        ord('F'), ord('G')
      ]);
      const dataSource = array.buffer;
      let count = 0;
      function Test() {
        const screen = useAnsi(dataSource, {
          modemSpeed: Infinity,
          maxHeight: 24,
        });
        outputs.push(screen);
        steps[count++].done();
        return '';
      }
      const el = createElement(Test);
      await render(el);
      await steps[0];
      const line1 = outputs[0].lines[0];
      expect(line1[0].text).to.match(/^D\s{7}C\s+$/);
      const line8 = outputs[0].lines[7];
      expect(line8[0].text).to.match(/^\s{3}B\s+$/);
      const line4 = outputs[0].lines[3];
      expect(line4[0].text).to.match(/^E\s+$/);
      const line24 = outputs[0].lines[23];
      expect(line24[0].text).to.match(/^G\s+F$/);
    });
  })
  it('should clear contents after cursor', async function() {
    await withTestRenderer(async ({ render }) => {
      const steps = createSteps();
      const outputs = [];
      const array = new Uint8Array([
        ...Array.from('X'.repeat(8 * 8)).map(ord),
        ...[
          ESC, ord('['), ord('4'), ord(';'), ord('4'), ord('H'),
          ESC, ord('['), ord('J'),
        ]
      ]);
      const dataSource = array.buffer;
      let count = 0;
      function Test() {
        const screen = useAnsi(dataSource, {
          modemSpeed: Infinity,
          minWidth: 8,
          maxWidth: 8,
          minHeight: 8,
          maxHeight: 8,
        });
        outputs.push(screen);
        steps[count++].done();
        return '';
      }
      const el = createElement(Test);
      await render(el);
      await steps[0];
      const line1 = outputs[0].lines[0];
      expect(line1[0].text).to.match(/^X{8}$/);
      const line4 = outputs[0].lines[3];
      expect(line4[0].text).to.match(/^X{3}\s+$/);
      const line8 = outputs[0].lines[7];
      expect(line8[0].text).to.match(/^\s+$/);
    });
  })
  it('should clear contents before cursor', async function() {
    await withTestRenderer(async ({ render }) => {
      const steps = createSteps();
      const outputs = [];
      const array = new Uint8Array([
        ...Array.from('X'.repeat(8 * 8)).map(ord),
        ...[
          ESC, ord('['), ord('4'), ord(';'), ord('4'), ord('H'),
          ESC, ord('['), ord('1'), ord('J'),
        ]
      ]);
      const dataSource = array.buffer;
      let count = 0;
      function Test() {
        const screen = useAnsi(dataSource, {
          modemSpeed: Infinity,
          minWidth: 8,
          maxWidth: 8,
          minHeight: 8,
          maxHeight: 8,
        });
        outputs.push(screen);
        steps[count++].done();
        return '';
      }
      const el = createElement(Test);
      await render(el);
      await steps[0];
      const line1 = outputs[0].lines[0];
      expect(line1[0].text).to.match(/^\s+$/);
      const line4 = outputs[0].lines[3];
      expect(line4[0].text).to.match(/^\s{3}X+$/);
      const line8 = outputs[0].lines[7];
      expect(line8[0].text).to.match(/^X{8}$/);
    });
  })
  it('should clear entire screen', async function() {
    await withTestRenderer(async ({ render }) => {
      const steps = createSteps();
      const outputs = [];
      const array = new Uint8Array([
        ...Array.from('X'.repeat(8 * 8)).map(ord),
        ...[
          ESC, ord('['), ord('4'), ord(';'), ord('4'), ord('H'),
          ESC, ord('['), ord('2'), ord('J'),
        ]
      ]);
      const dataSource = array.buffer;
      let count = 0;
      function Test() {
        const screen = useAnsi(dataSource, {
          modemSpeed: Infinity,
          minWidth: 8,
          maxWidth: 8,
          minHeight: 8,
          maxHeight: 8,
        });
        outputs.push(screen);
        steps[count++].done();
        return '';
      }
      const el = createElement(Test);
      await render(el);
      await steps[0];
      const line1 = outputs[0].lines[0];
      expect(line1[0].text).to.match(/^\s+$/);
      const line4 = outputs[0].lines[3];
      expect(line4[0].text).to.match(/^\s+$/);
      const line8 = outputs[0].lines[7];
      expect(line8[0].text).to.match(/^\s+$/);
    });
  })
  it('should erase to end of line', async function() {
    await withTestRenderer(async ({ render }) => {
      const steps = createSteps();
      const outputs = [];
      const array = new Uint8Array([
        ...Array.from('X'.repeat(8 * 8)).map(ord),
        ...[
          ESC, ord('['), ord('4'), ord(';'), ord('4'), ord('H'),
          ESC, ord('['), ord('K'),
        ]
      ]);
      const dataSource = array.buffer;
      let count = 0;
      function Test() {
        const screen = useAnsi(dataSource, {
          modemSpeed: Infinity,
          minWidth: 8,
          maxWidth: 8,
          minHeight: 8,
          maxHeight: 8,
        });
        outputs.push(screen);
        steps[count++].done();
        return '';
      }
      const el = createElement(Test);
      await render(el);
      await steps[0];
      const line1 = outputs[0].lines[0];
      expect(line1[0].text).to.match(/^X{8}$/);
      const line4 = outputs[0].lines[3];
      expect(line4[0].text).to.match(/^X{3}\s+$/);
      const line5 = outputs[0].lines[4];
      expect(line5[0].text).to.match(/^X{8}$/);
    });
  })
  it('should erase to start of line', async function() {
    await withTestRenderer(async ({ render }) => {
      const steps = createSteps();
      const outputs = [];
      const array = new Uint8Array([
        ...Array.from('X'.repeat(8 * 8)).map(ord),
        ...[
          ESC, ord('['), ord('4'), ord(';'), ord('4'), ord('H'),
          ESC, ord('['), ord('1'), ord('K'),
        ]
      ]);
      const dataSource = array.buffer;
      let count = 0;
      function Test() {
        const screen = useAnsi(dataSource, {
          modemSpeed: Infinity,
          minWidth: 8,
          maxWidth: 8,
          minHeight: 8,
          maxHeight: 8,
        });
        outputs.push(screen);
        steps[count++].done();
        return '';
      }
      const el = createElement(Test);
      await render(el);
      await steps[0];
      const line1 = outputs[0].lines[0];
      expect(line1[0].text).to.match(/^X{8}$/);
      const line4 = outputs[0].lines[3];
      expect(line4[0].text).to.match(/^\s{3}X+$/);
      const line3 = outputs[0].lines[2];
      expect(line3[0].text).to.match(/^X{8}$/);
    });
  })
  it('should erase entire line', async function() {
    await withTestRenderer(async ({ render }) => {
      const steps = createSteps();
      const outputs = [];
      const array = new Uint8Array([
        ...Array.from('X'.repeat(8 * 8)).map(ord),
        ...[
          ESC, ord('['), ord('4'), ord(';'), ord('4'), ord('H'),
          ESC, ord('['), ord('2'), ord('K'),
        ]
      ]);
      const dataSource = array.buffer;
      let count = 0;
      function Test() {
        const screen = useAnsi(dataSource, {
          modemSpeed: Infinity,
          minWidth: 8,
          maxWidth: 8,
          minHeight: 8,
          maxHeight: 8,
        });
        outputs.push(screen);
        steps[count++].done();
        return '';
      }
      const el = createElement(Test);
      await render(el);
      await steps[0];
      const line1 = outputs[0].lines[0];
      expect(line1[0].text).to.match(/^X{8}$/);
      const line4 = outputs[0].lines[3];
      expect(line4[0].text).to.match(/^\s+$/);
      const line3 = outputs[0].lines[2];
      expect(line3[0].text).to.match(/^X{8}$/);
    });
  })
  it('should insert lines', async function() {
    await withTestRenderer(async ({ render }) => {
      const steps = createSteps();
      const outputs = [];
      const array = new Uint8Array([
        ...Array.from('X'.repeat(8 * 8)).map(ord),
        ...[
          ESC, ord('['), ord('5'), ord(';'), ord('1'), ord('H'),
          ord('Y'),
          ESC, ord('['), ord('4'), ord(';'), ord('4'), ord('H'),
          ESC, ord('['), ord('2'), ord('L'),
        ]
      ]);
      const dataSource = array.buffer;
      let count = 0;
      function Test() {
        const screen = useAnsi(dataSource, {
          modemSpeed: Infinity,
          minWidth: 8,
          maxWidth: 8,
          minHeight: 8,
          maxHeight: 16,
        });
        outputs.push(screen);
        steps[count++].done();
        return '';
      }
      const el = createElement(Test);
      await render(el);
      await steps[0];
      const line4 = outputs[0].lines[3];
      expect(line4[0].text).to.match(/^\s+$/);
      const line5 = outputs[0].lines[4];
      expect(line5[0].text).to.match(/^\s+$/);
      const line7 = outputs[0].lines[6];
      expect(line7[0].text).to.match(/^YX{7}$/);
      expect(outputs[0].lines).to.have.lengthOf(10)
    });
  })
  it('should delete lines', async function() {
    await withTestRenderer(async ({ render }) => {
      const steps = createSteps();
      const outputs = [];
      const array = new Uint8Array([
        ...Array.from('X'.repeat(8 * 8)).map(ord),
        ...[
          ESC, ord('['), ord('6'), ord(';'), ord('1'), ord('H'),
          ord('Y'),
          ESC, ord('['), ord('4'), ord(';'), ord('4'), ord('H'),
          ESC, ord('['), ord('2'), ord('M'),
        ]
      ]);
      const dataSource = array.buffer;
      let count = 0;
      function Test() {
        const screen = useAnsi(dataSource, {
          modemSpeed: Infinity,
          minWidth: 8,
          maxWidth: 8,
          minHeight: 8,
          maxHeight: 8,
        });
        outputs.push(screen);
        steps[count++].done();
        return '';
      }
      const el = createElement(Test);
      await render(el);
      await steps[0];
      const line4 = outputs[0].lines[3];
      expect(line4[0].text).to.match(/^YX{7}$/);
      const line8 = outputs[0].lines[7];
      expect(line8[0].text).to.match(/^\s+$/);
    });
  })
  it('should delete characters', async function() {
    await withTestRenderer(async ({ render }) => {
      const steps = createSteps();
      const outputs = [];
      const array = new Uint8Array([
        ...Array.from('X'.repeat(8 * 8)).map(ord),
        ...[
          ESC, ord('['), ord('4'), ord(';'), ord('8'), ord('H'),
          ord('Y'),
          ESC, ord('['), ord('4'), ord(';'), ord('4'), ord('H'),
          ESC, ord('['), ord('P'),
        ]
      ]);
      const dataSource = array.buffer;
      let count = 0;
      function Test() {
        const screen = useAnsi(dataSource, {
          modemSpeed: Infinity,
          minWidth: 8,
          maxWidth: 8,
          minHeight: 8,
          maxHeight: 8,
        });
        outputs.push(screen);
        steps[count++].done();
        return '';
      }
      const el = createElement(Test);
      await render(el);
      await steps[0];
      const line4 = outputs[0].lines[3];
      expect(line4[0].text).to.match(/^X+Y\s$/);
      const line5 = outputs[0].lines[4];
      expect(line5[0].text).to.match(/^X+$/);
    });
  })
  it('should clear characters starting at cursor', async function() {
    await withTestRenderer(async ({ render }) => {
      const steps = createSteps();
      const outputs = [];
      const array = new Uint8Array([
        ...Array.from('X'.repeat(8 * 8)).map(ord),
        ...[
          ESC, ord('['), ord('4'), ord(';'), ord('8'), ord('H'),
          ord('Y'),
          ESC, ord('['), ord('4'), ord(';'), ord('4'), ord('H'),
          ESC, ord('['), ord('2'), ord('X'),
          ESC, ord('['), ord('5'), ord(';'), ord('6'), ord('H'),
          ESC, ord('['), ord('9'), ord('X'),
        ]
      ]);
      const dataSource = array.buffer;
      let count = 0;
      function Test() {
        const screen = useAnsi(dataSource, {
          modemSpeed: Infinity,
          minWidth: 8,
          maxWidth: 8,
          minHeight: 8,
          maxHeight: 8,
        });
        outputs.push(screen);
        steps[count++].done();
        return '';
      }
      const el = createElement(Test);
      await render(el);
      await steps[0];
      const line4 = outputs[0].lines[3];
      expect(line4[0].text).to.match(/^X+\s{2}X+Y$/);
      const line5 = outputs[0].lines[4];
      expect(line5[0].text).to.match(/^X+\s{3}$/);
    });
  })
  it('should scroll up', async function() {
    await withTestRenderer(async ({ render }) => {
      const steps = createSteps();
      const outputs = [];
      const array = new Uint8Array([
        ...Array.from('X'.repeat(8 * 8)).map(ord),
        ...[
          ESC, ord('['), ord('6'), ord(';'), ord('1'), ord('H'),
          ord('Y'),
          ESC, ord('['), ord('2'), ord('S'),
        ]
      ]);
      const dataSource = array.buffer;
      let count = 0;
      function Test() {
        const screen = useAnsi(dataSource, {
          modemSpeed: Infinity,
          minWidth: 8,
          maxWidth: 8,
          minHeight: 8,
          maxHeight: 8,
        });
        outputs.push(screen);
        steps[count++].done();
        return '';
      }
      const el = createElement(Test);
      await render(el);
      await steps[0];
      const line4 = outputs[0].lines[3];
      expect(line4[0].text).to.match(/^YX{7}$/);
      const line7 = outputs[0].lines[6];
      expect(line7[0].text).to.match(/^\s+$/);
      const line8 = outputs[0].lines[7];
      expect(line8[0].text).to.match(/^\s+$/);
    });
  })
  it('should scroll down', async function() {
    await withTestRenderer(async ({ render }) => {
      const steps = createSteps();
      const outputs = [];
      const array = new Uint8Array([
        ...Array.from('X'.repeat(8 * 8)).map(ord),
        ...[
          ESC, ord('['), ord('6'), ord(';'), ord('1'), ord('H'),
          ord('Y'),
          ESC, ord('['), ord('2'), ord('T'),
        ]
      ]);
      const dataSource = array.buffer;
      let count = 0;
      function Test() {
        const screen = useAnsi(dataSource, {
          modemSpeed: Infinity,
          minWidth: 8,
          maxWidth: 8,
          minHeight: 8,
          maxHeight: 8,
        });
        outputs.push(screen);
        steps[count++].done();
        return '';
      }
      const el = createElement(Test);
      await render(el);
      await steps[0];
      const line1 = outputs[0].lines[0];
      expect(line1[0].text).to.match(/^\s+$/);
      const line2 = outputs[0].lines[0];
      expect(line2[0].text).to.match(/^\s+$/);
      const line8 = outputs[0].lines[7];
      expect(line8[0].text).to.match(/^YX{7}$/);
    });
  })
  it('should change text attributes', async function() {
    await withTestRenderer(async ({ render }) => {
      const steps = createSteps();
      const outputs = [];
      const array = new Uint8Array([
        ord('A'),
        ESC, ord('['), ord('7'), ord('m'),
        ord('B'),
        ESC, ord('['), ord('m'),
        ord('C'),
        ESC, ord('['), ord('8'), ord('m'),
        ord('D'),
        ESC, ord('['), ord('0'), ord(';'), ord('5'), ord(';'), ord('3'), ord('3'), ord(';'), ord('1'), ord('m'),
        ord('E'),
        ESC, ord('['), ord('2'), ord('m'),
        ord('F'),
        ESC, ord('['), ord('2'), ord('5'), ord('m'),
        ord('G'),
      ]);
      const dataSource = array.buffer;
      let count = 0;
      function Test() {
        const screen = useAnsi(dataSource, {
          modemSpeed: Infinity,
        });
        outputs.push(screen);
        steps[count++].done();
        return '';
      }
      const el = createElement(Test);
      await render(el);
      await steps[0];
      const line1 = outputs[0].lines[0];
      expect(line1[0]).to.have.property('fgColor', 7);
      expect(line1[0]).to.have.property('bgColor', 0);
      expect(line1[1]).to.have.property('fgColor', 0);
      expect(line1[1]).to.have.property('bgColor', 7);
      expect(line1[2]).to.have.property('fgColor', 7);
      expect(line1[2]).to.have.property('bgColor', 0);
      expect(line1[3]).to.have.property('fgColor', 0);
      expect(line1[3]).to.have.property('bgColor', 0);
      expect(line1[4]).to.have.property('fgColor', 11);
      expect(line1[4]).to.have.property('bgColor', 8);
      expect(line1[5]).to.have.property('fgColor', 3);
      expect(line1[5]).to.have.property('bgColor', 8);
      expect(line1[6]).to.have.property('fgColor', 3);
      expect(line1[6]).to.have.property('bgColor', 0);
    });
  })

  // *** tests for control characters ***

  it('should call beep handler', async function() {
    await withTestRenderer(async ({ render }) => {
      const steps = createSteps();
      const array = new Uint8Array([ 7 ]);
      const dataSource = array.buffer;
      let called = false;
      function Test() {
        const screen = useAnsi(dataSource, { modemSpeed: Infinity, onBeep: () => called = true });
        steps[0].done();
        return '';
      }
      const el = createElement(Test);
      await render(el);
      await steps[0];
      expect(called).to.be.true;
    });
  })
  it('should handle tabs correctly', async function() {
    await withTestRenderer(async ({ render }) => {
      const steps = createSteps();
      const outputs = [];
      const array = new Uint8Array(Array.from('AA\tB\tCCCC\tD').map(ord));
      const dataSource = array.buffer;
      let count = 0;
      function Test() {
        const screen = useAnsi(dataSource, { modemSpeed: Infinity });
        outputs.push(screen);
        steps[count++].done();
        return '';
      }
      const el = createElement(Test);
      await render(el);
      await steps[0];
      const line1 = outputs[0].lines[0];
      expect(line1[0].text).to.match(/^AA\s{6}B\s{7}CCCC\s{4}D/);
    });
  })
  it('should handle return and linefeed correctly', async function() {
    await withTestRenderer(async ({ render }) => {
      const steps = createSteps();
      const outputs = [];
      const array = new Uint8Array(Array.from('AA\nB\r\nCCCC').map(ord));
      const dataSource = array.buffer;
      let count = 0;
      function Test() {
        const screen = useAnsi(dataSource, { modemSpeed: Infinity });
        outputs.push(screen);
        steps[count++].done();
        return '';
      }
      const el = createElement(Test);
      await render(el);
      await steps[0];
      const line1 = outputs[0].lines[0];
      expect(line1[0].text).to.match(/^AA\s+$/);
      const line2 = outputs[0].lines[1];
      expect(line2[0].text).to.match(/^\s{2}B\s+$/);
      const line3 = outputs[0].lines[2];
      expect(line3[0].text).to.match(/^CCCC\s+$/);
    });
  })
  it('should handle backspace correctly', async function() {
    await withTestRenderer(async ({ render }) => {
      const steps = createSteps();
      const outputs = [];
      const array = new Uint8Array(Array.from('\b\bAA\bB').map(ord));
      const dataSource = array.buffer;
      let count = 0;
      function Test() {
        const screen = useAnsi(dataSource, { modemSpeed: Infinity });
        outputs.push(screen);
        steps[count++].done();
        return '';
      }
      const el = createElement(Test);
      await render(el);
      await steps[0];
      const line1 = outputs[0].lines[0];
      expect(line1[0].text).to.match(/^AB\s+$/);
    });
  })
  it('should handle clear screen character', async function() {
    await withTestRenderer(async ({ render }) => {
      const steps = createSteps();
      const outputs = [];
      const array = new Uint8Array(Array.from('BBBBBB\nBBBBBB\nBBBBBBBB\u000c').map(ord));
      const dataSource = array.buffer;
      let count = 0;
      function Test() {
        const screen = useAnsi(dataSource, { modemSpeed: Infinity });
        outputs.push(screen);
        steps[count++].done();
        return '';
      }
      const el = createElement(Test);
      await render(el);
      await steps[0];
      const line1 = outputs[0].lines[0];
      expect(line1[0].text).to.match(/^\s+$/);
      const line2 = outputs[0].lines[1];
      expect(line2[0].text).to.match(/^\s+$/);
      const line3 = outputs[0].lines[2];
      expect(line3[0].text).to.match(/^\s+$/);
    });
  })
})

function ord(s) {
  return s.charCodeAt();
}

const ESC = 0x1b;