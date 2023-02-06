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
    it('should accept promise to data as well', async function() {
      const srcObject = readFile(resolve('./ansi/LDA-GARFIELD.ANS'));
      const el = createElement(AnsiText, { 
        srcObject, 
        modemSpeed: Infinity, 
        maxHeight: 1024 
      });
      const { lastFrame } = render(el);
      await delay(50);
      const s = lastFrame();
      const m = s.match(/\n/g);
      expect(m).to.have.lengthOf(39);
      expect(s).to.contain('lda');
    })
    it('should return metadata contained in file', async function() {
      const srcObject = await readFile(resolve('./ansi/LDA-GARFIELD.ANS'));
      let metadata = null;
      const el = createElement(AnsiText, { 
        srcObject, 
        modemSpeed: Infinity, 
        maxHeight: 1024,
        onMetadata: m => metadata = m,
      });
      const { lastFrame } = render(el);
      await delay(10);
      expect(metadata).to.be.an('array');
    })
    it('should load ANSI text from file', async function() {
      const src = resolve('./ansi/LDA-GARFIELD.ANS');
      const el = createElement(AnsiText, { 
        src, 
        modemSpeed: Infinity, 
        maxHeight: 1024 
      });
      const { lastFrame, stdout } = render(el);
      await delay(50);
      expect(stdout.frames).to.have.lengthOf(2);
      const s = lastFrame();
      const m = s.match(/\n/g);
      expect(m).to.have.lengthOf(39);
      expect(s).to.contain('lda');
    })
    it('should render error message when file is missing', async function() {
      const src = resolve('./ansi/BOGUS.ANS');
      let error;
      const el = createElement(AnsiText, { 
        src, 
        modemSpeed: Infinity, 
        maxHeight: 1024,
        onError: err => error = err,
      });
      const { lastFrame, stdout } = render(el);
      await delay(10);
      expect(stdout.frames).to.have.lengthOf(2);
      const s = lastFrame();
      expect(s).to.contain('no such file or directory');
      expect(error).to.be.an('error');
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
      try {
        const s1 = lastFrame();
        const m = s1.match(/\n/g);
        expect(m).to.have.lengthOf(24);
        await delay(70);
        expect(stdout.frames).to.have.lengthOf(2);
        const s2 = lastFrame();
        expect(s2).to.not.equal(s1); 
      } finally {
        unmount();

      }
    })
    it('should be able to render an animation', async function() {
      const path = resolve('./ansi/LM-OKC.ICE');
      const statuses = [];
      const el = createElement(AnsiText, { 
        src: path, 
        modemSpeed: 10000000, 
        frameDuration: 10, 
        onStatus: s => statuses.push(s),
      });
      let previousCount = 0;
      const { stdout, unmount } = render(el);      
      try {
        while (previousCount !== stdout.frames.length) {
          previousCount = stdout.frames.length;
          await delay(20);
        }
        expect(previousCount).to.be.at.least(10);
        expect(statuses.length).to.be.at.least(10);
      } finally {
        unmount();
      }
    })
  })
})
