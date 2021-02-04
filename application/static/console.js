import { Metacom } from './metacom.js';

const ALPHA_UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const ALPHA_LOWER = 'abcdefghijklmnopqrstuvwxyz';
const ALPHA = ALPHA_UPPER + ALPHA_LOWER;
const DIGIT = '0123456789';
const CHARS = ALPHA + DIGIT;
const TIME_CHAR = 5;

const KEY_CODE = {
  BACKSPACE: 8,
  TAB: 9,
  ENTER: 13,
  PAUSE: 19,
  ESC: 27,
  SPACE: 32,
  PGUP: 33,
  PGDN: 34,
  END: 35,
  HOME: 36,
  LT: 37,
  UP: 38,
  RT: 39,
  DN: 40,
  INS: 45,
  DEL: 46,
  F1: 112,
  F2: 113,
  F3: 114,
  F4: 115,
  F5: 116,
  F6: 117,
  F7: 118,
  F8: 119,
  F9: 120,
  F10: 121,
  F11: 122,
  F12: 123,
  ACCENT: 192,
};

const KEYBOARD_LAYOUT = [
  '1234567890',
  'qwertyuiop',
  'asdfghjkl<',
  '^zxcvbnm_>',
];

const KEY_NAME = {};
for (const keyName in KEY_CODE) KEY_NAME[KEY_CODE[keyName]] = keyName;

const pad = (padChar, length) => new Array(length + 1).join(padChar);

const { userAgent } = navigator;

const isMobile = () =>
  userAgent.match(/Android/i) ||
  userAgent.match(/webOS/i) ||
  userAgent.match(/iPhone/i) ||
  userAgent.match(/iPad/i) ||
  userAgent.match(/iPod/i) ||
  userAgent.match(/BlackBerry/i) ||
  userAgent.match(/Windows Phone/i);

const sleep = (msec) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, msec);
  });

const urlKind = (url) => {
  if (url.startsWith('mailto:')) return 'mail';
  if (url.startsWith('http:')) return 'web';
  if (url.startsWith('https:')) return 'web';
  const k = url.indexOf('/');
  if (k === -1) return 'base';
  return url.substring(0, k);
};

const followLink = async (event) => {
  const url = event.target.getAttribute('data-link');
  const kind = urlKind(url);
  if (kind === 'mail' || kind === 'web') {
    window.open(url, '_blank');
    return;
  }
  const name = url.substring(0, url.length - '.md'.length);
  const { text } = await api.console.content({ name });
  application.print(text);
};

const followLastMore = () => {
  const mores = document.querySelectorAll('#panelConsole a.more');
  if (mores.length === 0) return;
  const text = mores[mores.length - 1].getAttribute('data-text');
  for (const more of mores) more.parentElement.remove();
  application.print(text);
};

const removeMores = () => {
  const mores = document.querySelectorAll('#panelConsole a.more');
  for (const more of mores) more.parentElement.remove();
};

const moreLink = (event) => {
  const text = event.target.getAttribute('data-text');
  event.target.parentElement.remove();
  application.print(text);
};

const blobToBase64 = (blob) => {
  const reader = new FileReader();
  reader.readAsDataURL(blob);
  return new Promise((resolve) => {
    reader.onloadend = () => {
      resolve(reader.result);
    };
  });
};

const inputKeyboardEvents = {
  ESC() {
    application.clear();
    application.inputSetValue('');
  },
  SPACE() {
    followLastMore();
  },
  BACKSPACE() {
    application.inputSetValue(application.controlInput.inputValue.slice(0, -1));
  },
  ENTER() {
    let value = application.controlInput.inputValue;
    if (application.controlInput.inputType === 'masked') {
      value = pad('*', value.length);
    }
    application.print(application.controlInput.inputPrompt + value);
    application.controlInput.style.display = 'none';
    application.controlInput.inputActive = false;
    application.controlInput.inputCallback(null, value);
  },
  CAPS() {
    if (application.keyboard.controlKeyboard.className === 'caps') {
      application.keyboard.controlKeyboard.className = '';
    } else {
      application.keyboard.controlKeyboard.className = 'caps';
    }
  },
  KEY(char) {
    // Alpha or Digit
    if (application.keyboard.controlKeyboard.className === 'caps') {
      char = char.toUpperCase();
    }
    application.inputSetValue(application.controlInput.inputValue + char);
  },
};

document.onkeydown = (event) => {
  if (application.controlInput.inputActive) {
    const keyName = KEY_NAME[event.keyCode];
    const fn = inputKeyboardEvents[keyName];
    if (fn) {
      fn();
      return false;
    }
  }
};

document.onkeypress = (event) => {
  if (application.controlInput.inputActive) {
    const fn = inputKeyboardEvents['KEY'];
    const char = String.fromCharCode(event.keyCode);
    if (CHARS.includes(char) && fn) {
      fn(char);
      return false;
    }
  }
};

const keyboardClick = (e) => {
  let char = e.target.inputChar;
  if (char === '_') char = ' ';
  let keyName = 'KEY';
  if (char === '<') keyName = 'BACKSPACE';
  if (char === '>') keyName = 'ENTER';
  if (char === '^') keyName = 'CAPS';
  const fn = inputKeyboardEvents[keyName];
  if (fn) fn(char);
  e.stopPropagation();
  return false;
};

const uploadFile = (file, done) => {
  blobToBase64(file).then((url) => {
    const data = url.substring(url.indexOf(',') + 1);
    api.example.uploadFile({ name: file.name, data }).then(done);
  });
};

const saveFile = (fileName, blob) => {
  const a = document.createElement('a');
  a.style.display = 'none';
  document.body.appendChild(a);
  const url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
};

const upload = () => {
  const element = document.createElement('form');
  element.style.visibility = 'hidden';
  element.innerHTML = '<input id="fileSelect" type="file" multiple />';
  document.body.appendChild(element);
  const fileSelect = document.getElementById('fileSelect');
  fileSelect.click();
  fileSelect.onchange = () => {
    const files = Array.from(fileSelect.files);
    application.print('Uploading ' + files.length + ' file(s)');
    files.sort((a, b) => a.size - b.size);
    let i = 0;
    const uploadNext = () => {
      const file = files[i];
      uploadFile(file, () => {
        application.print(`name: ${file.name}, size: ${file.size} done`);
        i++;
        if (i < files.length) {
          return uploadNext();
        }
        document.body.removeChild(element);
        commandLoop();
      });
    };
    uploadNext();
  };
};

class Keyboard {
  constructor() {
    this.controlKeyboard = document.getElementById('controlKeyboard');
    if (!isMobile()) return;
    for (let i = 0; i < KEYBOARD_LAYOUT.length; i++) {
      const keyboardLine = KEYBOARD_LAYOUT[i];
      const elementLine = document.createElement('div');
      this.controlKeyboard.appendChild(elementLine);
      for (let j = 0; j < keyboardLine.length; j++) {
        let char = keyboardLine[j];
        if (char === ' ') char = '&nbsp;';
        const elementKey = document.createElement('div');
        elementKey.innerHTML = char;
        elementKey.inputChar = char;
        elementKey.className = 'key';
        elementKey.style.opacity = (i + j) % 2 ? 0.8 : 1;
        elementKey.addEventListener('click', keyboardClick);
        elementLine.appendChild(elementKey);
      }
    }
    this.controlKeyboard.style.display = 'none';
  }

  show() {
    this.controlKeyboard.style.display = 'block';
    const down = this.controlKeyboard.offsetHeight + 'px';
    application.controlBrowse.style.bottom = down;
  }

  hide() {
    this.controlKeyboard.style.display = 'none';
    application.controlBrowse.style.bottom = '0';
  }
}

class Scroller {
  constructor(application) {
    this.viewportHeight = 0;
    this.viewableRatio = 0;
    this.contentHeight = 0;
    this.scrollHeight = 0;
    this.thumbHeight = 0;
    this.thumbPosition = 0;
    this.panelScroll = document.getElementById('panelScroll');
    this.controlScroll = document.getElementById('controlScroll');
    const height = application.controlBrowse.scrollHeight;
    application.controlBrowse.scrollTop = height;
    application.controlBrowse.addEventListener('scroll', () => {
      this.refreshScroll();
    });
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.scrollBottom();
      }, 0);
    });
  }

  refreshScroll() {
    this.viewportHeight = application.controlBrowse.offsetHeight;
    this.contentHeight = application.controlBrowse.scrollHeight;
    this.viewableRatio = this.viewportHeight / this.contentHeight;
    this.scrollHeight = this.panelScroll.offsetHeight;
    this.thumbHeight = this.scrollHeight * this.viewableRatio;
    const top = application.controlBrowse.scrollTop;
    this.thumbPosition = (top * this.thumbHeight) / this.viewportHeight;
    this.controlScroll.style.top = this.thumbPosition + 'px';
    this.controlScroll.style.height = this.thumbHeight + 'px';
  }

  scrollBottom() {
    this.refreshScroll();
    const top = application.controlBrowse.scrollHeight;
    application.controlBrowse.scrollTop = top;
  }
}

function commandLoop() {
  application.input('command', '.', (err, line) => {
    application.exec(line);
    commandLoop();
  });
}

class Application {
  constructor() {
    this.controlInput = document.getElementById('controlInput');
    this.controlBrowse = document.getElementById('controlBrowse');
    this.keyboard = new Keyboard(this);
    this.scroller = new Scroller(this);
    const protocol = location.protocol === 'http:' ? 'ws' : 'wss';
    this.metacom = Metacom.create(`${protocol}://${location.host}/api`);
  }

  clear() {
    const elements = this.controlBrowse.children;
    for (let i = elements.length - 2; i > 1; i--) {
      const element = elements[i];
      this.controlBrowse.removeChild(element);
    }
  }

  inputSetValue(value) {
    this.controlInput.inputValue = value;
    if (this.controlInput.inputType === 'masked') {
      value = pad('*', value.length);
    }
    value = value.replace(/ /g, '&nbsp;');
    const html = this.controlInput.inputPrompt + value + '<span>&block;</span>';
    this.controlInput.innerHTML = html;
  }

  input(type, prompt, callback) {
    this.controlInput.style.display = 'none';
    this.controlBrowse.removeChild(this.controlInput);
    this.controlInput.inputActive = true;
    this.controlInput.inputPrompt = prompt;
    this.inputSetValue('');
    this.controlInput.inputType = type;
    this.controlInput.inputCallback = callback;
    this.controlBrowse.appendChild(this.controlInput);
    this.controlInput.style.display = 'block';
    setTimeout(() => {
      this.scroller.scrollBottom();
    }, 0);
  }

  more(text = '') {
    const element = document.createElement('div');
    this.controlBrowse.insertBefore(element, this.controlInput);
    const label = '--More--';
    element.innerHTML = `<a data-text="${text}" class="more">${label}</a>`;
    const [link] = element.querySelectorAll('a');
    link.onclick = moreLink;
    const top = this.controlBrowse.scrollHeight;
    this.controlBrowse.scrollTop = top;
    this.scroller.scrollBottom();
  }

  async print(text = '') {
    removeMores();
    const element = document.createElement('div');
    this.controlBrowse.insertBefore(element, this.controlInput);
    let i = 0;
    let word = '';
    const output = async () => {
      if (word === '') return;
      element.innerHTML += word;
      word = '';
      await sleep(TIME_CHAR);
    };
    while (i < text.length) {
      const char = text.charAt(i);
      i++;
      if (char === '\n') {
        await output();
        const next = text.charAt(i);
        const prev = text.charAt(i - 2);
        word = ' ';
        if (next === '\n' || prev === '\n') word = '<br/>';
        if (next === '-' || (next >= 0 && next <= 9)) word = '<br/>';
        await output();
      } else if (char === '#') {
        await output();
        if (i > 1) {
          this.more(text.substring(i));
          break;
        }
        const headerStart = text.indexOf(' ', i) + 1;
        const headerEnd = text.indexOf('\n', i);
        const header = text.substring(headerStart, headerEnd);
        word = `<span class="header">${header}</span>`;
        i = headerEnd;
        await output();
      } else if (char === '[') {
        await output();
        const labelEnd = text.indexOf(']', i);
        const linkEnd = text.indexOf(')', i);
        const label = text.substring(i, labelEnd);
        const url = text.substring(labelEnd + 2, linkEnd);
        const kind = urlKind(url);
        word = `<a data-link="${url}" class="${kind}">${label}</a>`;
        i = linkEnd + 1;
        await output();
      } else {
        word += char;
      }
      const top = this.controlBrowse.scrollHeight;
      this.controlBrowse.scrollTop = top;
      this.scroller.scrollBottom();
    }
    if (i >= text.length) {
      element.innerHTML += '<br/>';
      const top = this.controlBrowse.scrollHeight;
      this.controlBrowse.scrollTop = top;
      this.scroller.scrollBottom();
    }
    const links = element.querySelectorAll('a');
    for (const link of links) {
      link.onclick = followLink;
    }
  }

  async exec(line) {
    const args = line.split(' ');
    if (args[0] === 'upload') {
      upload();
    } else if (args[0] === 'download') {
      const packet = await api.example.downloadFile();
      console.log({ packet });
      saveFile('fileName', packet);
    } else if (args[0] === 'counter') {
      const packet = await api.example.counter();
      application.print(`counter: ${packet.result}`);
    }
    commandLoop();
  }
}

window.addEventListener('load', async () => {
  window.application = new Application();
  window.api = window.application.metacom.api;
  await application.metacom.load('auth', 'console', 'example');
  const token = localStorage.getItem('metarhia.session.token');
  let logged = false;
  if (token) {
    const res = await api.auth.restore({ token });
    logged = res.status === 'logged';
  }
  if (!logged) {
    const res = await api.auth.signin({ login: 'marcus', password: 'marcus' });
    if (res.token) {
      localStorage.setItem('metarhia.session.token', res.token);
    }
  }
  const { text } = await api.console.content({ name: 'home' });
  application.print(text);
  commandLoop();
});

if (navigator.serviceWorker) {
  navigator.serviceWorker.register('/worker.js');
}
