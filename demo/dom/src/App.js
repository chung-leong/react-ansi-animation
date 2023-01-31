import { useState, useCallback, useEffect } from 'react';
import { AnsiText, AnsiCanvas } from './react-ansi-animation';
import './css/App.css';

const font = {
  family: 'Flexi IBM VGA',
  size: '12pt',
  src: `url('/fonts/flexi-ibm-vga-true-437.woff2') format('woff2'),
        url('/fonts/flexi-ibm-vga-true-437.woff') format('woff')`,
};

export default function App() {
  const [ modemSpeed, setModemSpeed ] = useState(56000);
  const [ blinking, setBlinking ] = useState(false);
  const [ scrolling, setScrolling ] = useState(true);
  const [ canvas, setCanvas ] = useState(false);
  const [ transparency, setTransparency ] = useState(false);
  const [ filename, setFilename ] = useState('ABYSS1.ANS');
  const [ initialStatus, setInitialStatus ] = useState({ position: 0, playing: true });
  const [ currentStatus, setCurrentStatus ] = useState(initialStatus);
  const Ansi = (canvas) ? AnsiCanvas : AnsiText;
  const maxHeight = (scrolling) ? 25 : 1024;

  const onSpeedChange = useCallback(({ target }) => {
    setModemSpeed(parseFloat(target.value));
  }, []);
  const onBlinkChange = useCallback(({ target }) => {
    setBlinking(target.checked);
  }, []);
  const onScrollChange = useCallback(({ target }) => {
    setScrolling(target.checked);
  }, []);
  const onCanvasChange = useCallback(({ target }) => {
    setCanvas(target.checked);
  }, []);
  const onTransparencyChange = useCallback(({ target }) => {
    setTransparency(target.checked);
  }, []);
  const onFileClick = useCallback(({ target }) => {
    if (target.tagName === 'LI') {
      setFilename(target.firstChild.nodeValue);
      setInitialStatus({ position: 0, playing: true });
      document.body.parentElement.scrollTop = 0;
    }
  }, []);
  const onPositionChange = useCallback(({ target }) => {
    const position = parseFloat(target.value);
    setInitialStatus({ position, playing: false });
  }, []);
  const onStatus = useCallback((status) => {
    setCurrentStatus(status);
  }, []);

  useEffect(() => {
    if (transparency) {
      document.body.style.backgroundColor = '#005500';
      return () => {
        document.body.style.backgroundColor = '';
      };
    }
  }, [ transparency ]);

  return (
    <div className="App">
      <div className="controls">
        <label>
          Modem speed: 
          <select onChange={onSpeedChange} value={modemSpeed}>
            <option>2400</option>
            <option>9600</option>
            <option>14400</option>
            <option>19200</option>
            <option>28800</option>
            <option>33600</option>
            <option>56000</option>
            <option>115200</option>
            <option>230400</option>
            <option>460800</option>
            <option>576000</option>
            <option>921600</option>
            <option>Infinity</option>
          </select>
        </label>
        <label>
          <input type="checkbox" checked={blinking} onChange={onBlinkChange} />Blinking
        </label>
        <label>
          <input type="checkbox" checked={scrolling} onChange={onScrollChange} />Scrolling
        </label>
        <label>
          <input type="checkbox" checked={canvas} onChange={onCanvasChange} />Canvas
        </label>
        <label>
          <input type="checkbox" checked={transparency} onChange={onTransparencyChange} />Transparent
        </label>
      </div>
      <div className="contents">
        <Ansi src={`/ansi/${filename}`} {...{ modemSpeed, blinking, transparency, maxHeight, font, initialStatus, onStatus }} />
        <div className={`playback-controls ${currentStatus.playing ? 'playing' : 'paused'}`}>
          <input type="range" value={currentStatus.position} min="0" max="1" step="0.001" onChange={onPositionChange} />
          <button>Play {'\u25b6'}</button>
        </div>
      </div>
      <div className="file-list" onClick={onFileClick}>
        <h4>Static:</h4>
        <ul>
          <li>ABYSS1.ANS</li>
          <li>AN-D2.ANS</li>
          <li>BK-KING.ANS</li>
          <li>COMICS14.ANS</li>
          <li>CT-DIE_HARD.ANS</li>
          <li>CT-PIXELS.ANS</li>
          <li>DONATELO.ANS</li>
          <li>DW-FACES.ANS</li>
          <li>DW-HAPPY_HOLIDAYS.ANS</li>
          <li>ED-NS.ANS</li>
          <li>JET.ANS</li>
          <li>FROSTBBS.ANS</li>
          <li>GAVEL30.ANS</li>
          <li>GLOBE.ANS</li>
          <li>LDA-GARFIELD.ANS</li>
          <li>THEQ.ANS</li>
          <li>US-UWU.ANS</li>
          <li>WWANS54.ANS</li>
        </ul>
        <h4>Blinking:</h4>
        <ul>
          <li>CHRIST1.ANS</li>
          <li>SMRFBONK.ANS</li>
          <li>US-CANDLES.ANS</li>          
          <li>UTOPIA20.ANS</li>
          <li>XMAS1.ANS</li>
        </ul>
        <h4>Animations:</h4>
        <ul>
          <li>BCACID7.ANS</li>
          <li>BOGACID1.ANS</li>
          <li>CC-ICE1.ICE</li>
          <li>DT-GHETO.ANS</li>
          <li>JD-BUTT.ANS</li>
          <li>LM-OKC.ICE</li>
          <li>SC-ACID5.ANS</li>
          <li>SUBACID.ANS</li>
          <li>UTOPIA86.ANS</li>
        </ul>
      </div>
      <div className="link">
        <a href="https://github.com/chung-leong/react-ansi-animation#readme" target="_blank" rel="noreferrer">GitHub repo</a>
      </div>
    </div>
  );
}
