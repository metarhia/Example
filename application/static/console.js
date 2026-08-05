import { Metacom } from '/metacom.js';

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
for (const [keyName, code] of Object.entries(KEY_CODE)) {
  KEY_NAME[code] = keyName;
}

const pad = (padChar, length) => padChar.repeat(length);

const { userAgent } = navigator;

const MOBILE_UA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i;

const isMobile = () => MOBILE_UA.test(userAgent);

const sleep = (msec) =>
  new Promise((resolve) => {
    setTimeout(resolve, msec);
  });

const urlKind = (url) => {
  if (url.startsWith('mailto:')) return 'mail';
  if (url.startsWith('http:') || url.startsWith('https:')) return 'web';
  const slashIndex = url.indexOf('/');
  if (slashIndex === -1) return 'base';
  return url.substring(0, slashIndex);
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
  const lastMore = mores.at(-1);
  const text = lastMore.getAttribute('data-text');
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

const inputKeyboardEvents = {
  ESC() {
    application.clear();
    application.inputSetValue('');
  },
  SPACE() {
    followLastMore();
  },
  BACKSPACE() {
    const value = application.controlInput.inputValue;
    application.inputSetValue(value.slice(0, -1));
  },
  ENTER() {
    const input = application.controlInput;
    let value = input.inputValue;
    if (input.inputType === 'masked') {
      value = pad('*', value.length);
    }
    application.print(input.inputPrompt + value);
    input.style.display = 'none';
    input.inputActive = false;
    input.inputCallback(null, value);
  },
  CAPS() {
    const keyboard = application.keyboard.controlKeyboard;
    const isCaps = keyboard.className === 'caps';
    keyboard.className = isCaps ? '' : 'caps';
  },
  KEY(char) {
    const keyboard = application.keyboard.controlKeyboard;
    if (keyboard.className === 'caps') {
      char = char.toUpperCase();
    }
    const value = application.controlInput.inputValue + char;
    application.inputSetValue(value);
  },
};

document.onkeydown = (event) => {
  if (!application.controlInput.inputActive) return true;
  const keyName = KEY_NAME[event.keyCode];
  const fn = inputKeyboardEvents[keyName];
  if (!fn) return true;
  fn();
  return false;
};

document.onkeypress = (event) => {
  if (!application.controlInput.inputActive) return true;
  const fn = inputKeyboardEvents.KEY;
  const char = String.fromCharCode(event.keyCode);
  if (!CHARS.includes(char) || !fn) return true;
  fn(char);
  return false;
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

const uploadFile = async (file) => {
  const uploader = application.metacom.createBlobUploader(file);
  await api.files.upload({
    streamId: uploader.id,
    name: file.name,
  });
  await uploader.upload();
  return { uploadedFile: file };
};

const downloadFile = async (name, type) => {
  const { streamId } = await api.files.download({ name });
  const readable = await application.metacom.getStream(streamId);
  const blob = await readable.toBlob(type);
  return new File([blob], name);
};

const saveFile = (fileName, blob) => {
  const link = document.createElement('a');
  link.style.display = 'none';
  document.body.appendChild(link);
  const url = window.URL.createObjectURL(blob);
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

const upload = () => {
  const form = document.createElement('form');
  form.style.visibility = 'hidden';
  form.innerHTML = '<input id="fileSelect" type="file" multiple />';
  document.body.appendChild(form);
  const fileSelect = document.getElementById('fileSelect');
  fileSelect.click();
  fileSelect.onchange = () => {
    const files = Array.from(fileSelect.files);
    application.print(`Uploading ${files.length} file(s)`);
    files.sort((a, b) => a.size - b.size);
    let index = 0;
    const uploadNext = async () => {
      const file = files[index];
      await uploadFile(file);
      application.print(`name: ${file.name}, size: ${file.size} done`);
      index++;
      if (index < files.length) return uploadNext();
      document.body.removeChild(form);
      commandLoop();
      return null;
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
    const bottom = `${this.controlKeyboard.offsetHeight}px`;
    application.controlBrowse.style.bottom = bottom;
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
    const browse = application.controlBrowse;
    this.viewportHeight = browse.offsetHeight;
    this.contentHeight = browse.scrollHeight;
    this.viewableRatio = this.viewportHeight / this.contentHeight;
    this.scrollHeight = this.panelScroll.offsetHeight;
    this.thumbHeight = this.scrollHeight * this.viewableRatio;
    const top = browse.scrollTop;
    this.thumbPosition = (top * this.thumbHeight) / this.viewportHeight;
    this.controlScroll.style.top = `${this.thumbPosition}px`;
    this.controlScroll.style.height = `${this.thumbHeight}px`;
  }

  scrollBottom() {
    this.refreshScroll();
    const top = application.controlBrowse.scrollHeight;
    application.controlBrowse.scrollTop = top;
  }
}

function commandLoop() {
  application.input('command', '.', (err, line) => {
    if (err) console.error(err);
    application.exec(line);
    commandLoop();
  });
}

class Application {
  constructor() {
    this.logged = false;
    this.controlInput = document.getElementById('controlInput');
    this.controlBrowse = document.getElementById('controlBrowse');
    this.keyboard = new Keyboard(this);
    this.scroller = new Scroller(this);
    const protocol = location.protocol === 'http:' ? 'ws' : 'wss';
    this.metacom = Metacom.create(`${protocol}://${location.host}/api`);
    window.api = this.metacom.api;
    window.application = this;
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
    const prompt = this.controlInput.inputPrompt;
    const cursor = '<span>&block;</span>';
    this.controlInput.innerHTML = prompt + value + cursor;
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

  scrollToEnd() {
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
      this.scrollToEnd();
    }
    if (i >= text.length) {
      element.innerHTML += '<br/>';
      this.scrollToEnd();
    }
    const links = element.querySelectorAll('a');
    for (const link of links) {
      link.onclick = followLink;
    }
  }

  async exec(line) {
    const [command] = line.split(' ');
    if (command === 'upload') {
      upload();
    } else if (command === 'download') {
      const fileName = 'content/home.md';
      const file = await downloadFile(fileName, 'txt/plain');
      console.log({ file });
      saveFile('home.md', file);
    } else if (command === 'counter') {
      const packet = await api.example.counter();
      this.print(`counter: ${packet.result}`);
    }
    commandLoop();
  }
}

window.addEventListener('load', async () => {
  const application = new Application();
  await application.metacom.load('auth', 'console', 'example', 'files');
  const token = localStorage.getItem('metarhia.session.token');
  if (token) {
    const res = await api.auth.restore({ token });
    application.logged = res.status === 'logged';
  }
  if (!application.logged) {
    const credentials = { login: 'marcus', password: 'marcus' };
    const res = await api.auth.signin(credentials);
    if (res.token) {
      localStorage.setItem('metarhia.session.token', res.token);
    }
  }
  const { text } = await api.console.content({ name: 'home' });
  application.print(text);
  commandLoop();
});
