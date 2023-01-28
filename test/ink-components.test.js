import { expect } from 'chai';
import { readFile, stat } from 'fs/promises';
import { createElement } from 'react';
import { delay } from 'react-seq';
import { render } from 'ink-testing-library';

import {
  AnsiText
} from '../ink.js';

describe('Ink components', function() {
  describe('#AnsiText', function() {
    it('should yield empty string when both src and srcObject are absent', async function() {
      const el = createElement(AnsiText);
      const { lastFrame } = render(el);
      const s = lastFrame();
      const t = s.replace(/\u001b\[.*?[@-~]/g, '');
      expect(t).to.match(/^\s+$/);
      expect(t).to.have.length.that.is.at.least(22 * 79);
      const m = s.match(/\n/g);
      expect(m).to.have.lengthOf(21);
    })
    it('should render ANSI text', async function() {
      const srcObject = await readFile(resolve('./ansi/LDA-GARFIELD.ANS'));
      const el = createElement(AnsiText, { 
        srcObject, 
        modemSpeed: Infinity, 
        maxHeight: 1024 
      });
      const { lastFrame } = render(el);
      const s = lastFrame();
      const m = s.match(/\n/g);
      expect(m).to.have.lengthOf(39);
      expect(s).to.contain('lda');
    })
    it('should accept a promise as data source', async function() {
      const srcObject = readFile(resolve('./ansi/LDA-GARFIELD.ANS'));
      const el = createElement(AnsiText, { 
        srcObject, 
        modemSpeed: Infinity, 
        maxHeight: 1024 
      });
      const { lastFrame, stdout } = render(el);
      await delay(10);
      expect(stdout.frames).to.have.lengthOf(2);
      const s = lastFrame();
      const m = s.match(/\n/g);
      expect(m).to.have.lengthOf(39);
      expect(s).to.contain('lda');
    })
    it('should render error message when file is missing', async function() {
      const srcObject = readFile(resolve('./ansi/BOGUS.ANS'));
      const el = createElement(AnsiText, { 
        srcObject, 
        modemSpeed: Infinity, 
        maxHeight: 1024 
      });
      const { lastFrame, stdout } = render(el);
      await delay(10);
      expect(stdout.frames).to.have.lengthOf(2);
      const s = lastFrame();
      expect(s).to.contain('no such file or directory');
    })
    it('should handle ANSI text with blinking text', async function() {
      const srcObject = await readFile(resolve('./ansi/US-CANDLES.ANS'));
      const el = createElement(AnsiText, { 
        srcObject, 
        modemSpeed: Infinity, 
        frameDuration: 10, 
        blinkDuration: 50,
        blinking: true,
      });
      const { lastFrame, stdout, unmount } = render(el);
      const s1 = lastFrame();
      const m = s1.match(/\n/g);
      expect(m).to.have.lengthOf(24);
      await delay(70);
      expect(stdout.frames).to.have.lengthOf(2);
      const s2 = lastFrame();
      expect(s2).to.not.equal(s1);
      unmount();
    })
    it('should be able to render an animation', async function() {
      const path = resolve('./ansi/LM-OKC.ICE');
      const el = createElement(AnsiText, { 
        src: path, 
        modemSpeed: 10000000, 
        frameDuration: 10, 
      });
      let previousCount = 0;
      const { stdout, unmount } = render(el);      
      while (previousCount !== stdout.frames.length) {
        previousCount = stdout.frames.length;
        await delay(20);
      }
      expect(previousCount).to.be.at.least(10);
      unmount();
    })
  })
})
