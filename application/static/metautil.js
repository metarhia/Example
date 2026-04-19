// error.js

class Error extends globalThis.Error {
  constructor(message, options = {}) {
    super(message);
    const hasOptions = typeof options === 'object';
    const { code, cause } = hasOptions ? options : { code: options };
    this.code = code;
    this.cause = cause;
  }
}

class DomainError extends Error {
  constructor(code, options = {}) {
    const hasCode = typeof code !== 'object';
    const opt = hasCode ? { ...options, code } : code;
    super('Domain error', opt);
  }

  toError(errors) {
    const { code, cause } = this;
    const message = errors[this.code] || this.message;
    return new Error(message, { code, cause });
  }
}

const isError = (err) => err?.constructor?.name?.includes('Error') || false;

// strings.js

const replace = (str, substr, newstr) => {
  if (substr === '') return str;
  let src = str;
  let res = '';
  do {
    const index = src.indexOf(substr);
    if (index === -1) return res + src;
    const start = src.substring(0, index);
    src = src.substring(index + substr.length, src.length);
    res += start + newstr;
  } while (true);
};

const between = (s, prefix, suffix) => {
  let i = s.indexOf(prefix);
  if (i === -1) return '';
  s = s.substring(i + prefix.length);
  if (suffix) {
    i = s.indexOf(suffix);
    if (i === -1) return '';
    s = s.substring(0, i);
  }
  return s;
};

const split = (s, separator) => {
  const i = s.indexOf(separator);
  if (i < 0) return [s, ''];
  return [s.slice(0, i), s.slice(i + separator.length)];
};

const inRange = (x, min, max) => x >= min && x <= max;

const isFirstUpper = (s) => !!s && inRange(s[0], 'A', 'Z');

const isFirstLower = (s) => !!s && inRange(s[0], 'a', 'z');

const isFirstLetter = (s) => isFirstUpper(s) || isFirstLower(s);

const toLowerCamel = (s) => s.charAt(0).toLowerCase() + s.slice(1);

const toUpperCamel = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const toLower = (s) => s.toLowerCase();

const toCamel = (separator) => (s) => {
  const words = s.split(separator);
  const first = words.length > 0 ? words.shift().toLowerCase() : '';
  return first + words.map(toLower).map(toUpperCamel).join('');
};

const spinalToCamel = toCamel('-');

const snakeToCamel = toCamel('_');

const isConstant = (s) => s === s.toUpperCase();

const fileExt = (fileName) => {
  const dot = fileName.lastIndexOf('.');
  const slash = fileName.lastIndexOf('/');
  if (slash > dot) return '';
  return fileName.substring(dot + 1, fileName.length).toLowerCase();
};

const trimLines = (s) => {
  const chunks = s.split('\n').map((d) => d.trim());
  return chunks.filter((d) => d !== '').join('\n');
};

// array.js

const sample = (array, random = Math.random) => {
  const index = Math.floor(random() * array.length);
  return array[index];
};

const shuffle = (array, random = Math.random) => {
  // Based on the algorithm described here:
  // https://en.wikipedia.org/wiki/Fisher-Yates_shuffle
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const projection = (source, fields) => {
  const entries = [];
  for (const key of fields) {
    if (Object.hasOwn(source, key)) {
      const value = source[key];
      entries.push([key, value]);
    }
  }
  return Object.fromEntries(entries);
};

// async.js

const toBool = [() => true, () => false];

const timeout = (msec, signal = null) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout of ${msec}ms reached`, 'ETIMEOUT'));
    }, msec);
    if (!signal) return;
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new Error('Timeout aborted'));
    });
  });

const delay = (msec, signal = null) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, msec);
    if (!signal) return;
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new Error('Delay aborted'));
    });
  });

const timeoutify = (promise, msec) =>
  new Promise((resolve, reject) => {
    let timer = setTimeout(() => {
      timer = null;
      reject(new Error(`Timeout of ${msec}ms reached`, 'ETIMEOUT'));
    }, msec);
    promise.then(resolve, reject).finally(() => {
      if (timer) clearTimeout(timer);
    });
  });

// datetime.js

const DURATION_UNITS = {
  d: 86400, // days
  h: 3600, // hours
  m: 60, // minutes
  s: 1, // seconds
};

const duration = (s) => {
  if (typeof s === 'number') return s;
  if (typeof s !== 'string') return 0;
  let result = 0;
  const parts = s.split(' ');
  for (const part of parts) {
    const unit = part.slice(-1);
    const value = parseInt(part.slice(0, -1));
    const mult = DURATION_UNITS[unit];
    if (!isNaN(value) && mult) result += value * mult;
  }
  return result * 1000;
};

const twoDigit = (n) => n.toString().padStart(2, '0');

const nowDate = (date = new Date()) => {
  const yyyy = date.getUTCFullYear().toString();
  const mm = twoDigit(date.getUTCMonth() + 1);
  const dd = twoDigit(date.getUTCDate());
  return `${yyyy}-${mm}-${dd}`;
};

const nowDateTimeUTC = (date = new Date(), timeSep = ':') => {
  const yyyy = date.getUTCFullYear().toString();
  const mm = twoDigit(date.getUTCMonth() + 1);
  const dd = twoDigit(date.getUTCDate());
  const hh = twoDigit(date.getUTCHours());
  const min = twoDigit(date.getUTCMinutes());
  const ss = twoDigit(date.getUTCSeconds());
  return `${yyyy}-${mm}-${dd}T${hh}${timeSep}${min}${timeSep}${ss}`;
};

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const NAME_LEN = 3;

const parseMonth = (s) => {
  const name = s.substring(0, NAME_LEN);
  const i = MONTHS.indexOf(name);
  return i >= 0 ? i + 1 : -1;
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const parseDay = (s) => {
  const name = s.substring(0, NAME_LEN);
  const i = DAYS.indexOf(name);
  return i >= 0 ? i + 1 : -1;
};

const ORDINAL = ['st', 'nd', 'rd', 'th'];

const isOrdinal = (s) => ORDINAL.some((d) => s.endsWith(d));

const YEAR_LEN = 4;

const parseEvery = (s = '') => {
  let YY = -1;
  let MM = -1;
  let DD = -1;
  let wd = -1;
  let hh = -1;
  let mm = -1;
  let ms = 0;
  const parts = s.split(' ');
  for (const part of parts) {
    if (part.includes(':')) {
      const [h, m] = split(part, ':');
      if (h !== '') hh = parseInt(h);
      mm = m === '' ? 0 : parseInt(m);
      continue;
    }
    if (isOrdinal(part)) {
      DD = parseInt(part);
      continue;
    }
    if (part.length === YEAR_LEN) {
      YY = parseInt(part);
      continue;
    }
    if (MM === -1) {
      MM = parseMonth(part);
      if (MM > -1) continue;
    }
    if (wd === -1) {
      wd = parseDay(part);
      if (wd > -1) continue;
    }
    const unit = part.slice(-1);
    const mult = DURATION_UNITS[unit];
    if (typeof mult === 'number') {
      const value = parseInt(part);
      if (!isNaN(value)) ms += value * mult;
    }
  }
  return { YY, MM, DD, wd, hh, mm, ms: ms > 0 ? ms * 1000 : -1 };
};

const nextEvent = (ev, d = new Date()) => {
  let ms = 0;
  const Y = d.getUTCFullYear();
  const M = d.getUTCMonth() + 1;
  const D = d.getUTCDate();
  const w = d.getUTCDay() + 1;
  const h = d.getUTCHours();
  const m = d.getUTCMinutes();

  const iY = ev.YY > -1;
  const iM = ev.MM > -1;
  const iD = ev.DD > -1;
  const iw = ev.wd > -1;
  const ih = ev.hh > -1;
  const im = ev.mm > -1;
  const ims = ev.ms > -1;

  if (iY && ev.YY !== Y) return ev.YY < Y ? -1 : 0;
  if (iM && ev.MM !== M) return ev.MM < M ? -1 : 0;
  if (iD && ev.DD !== D) return ev.DD < D ? -1 : 0;
  if (iw && ev.wd !== w) return 0;
  if (ih && (ev.hh < h || (ev.hh === h && im && ev.mm < m))) return -1;

  if (ih) ms += (ev.hh - h) * DURATION_UNITS.h;
  if (im) ms += (ev.mm - m) * DURATION_UNITS.m;

  ms *= 1000;
  if (ims) ms += ev.ms;
  return ms;
};

// objects.js

const makePrivate = (instance) => {
  const iface = {};
  const fields = Object.keys(instance);
  for (const fieldName of fields) {
    const field = instance[fieldName];
    if (isConstant(fieldName)) {
      iface[fieldName] = field;
    } else if (typeof field === 'function') {
      const boundMethod = field.bind(instance);
      iface[fieldName] = boundMethod;
      instance[fieldName] = boundMethod;
    }
  }
  return iface;
};

const protect = (allowMixins, ...namespaces) => {
  for (const namespace of namespaces) {
    const names = Object.keys(namespace);
    for (const name of names) {
      const target = namespace[name];
      if (!allowMixins.includes(name)) Object.freeze(target);
    }
  }
};

const jsonParse = (data) => {
  if (data === null || data === undefined) return null;
  if (data.length === 0) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

const isHashObject = (o) =>
  typeof o === 'object' && o !== null && !Array.isArray(o);

const flatObject = (source, fields = []) => {
  const target = {};
  for (const [key, value] of Object.entries(source)) {
    if (!isHashObject(value)) {
      target[key] = value;
      continue;
    }
    if (fields.length > 0 && !fields.includes(key)) {
      target[key] = { ...value };
      continue;
    }
    for (const [childKey, childValue] of Object.entries(value)) {
      const combined = `${key}${toUpperCamel(childKey)}`;
      if (source[combined] !== undefined) {
        const error = `Can not combine keys: key "${combined}" already exists`;
        throw new Error(error);
      }
      target[combined] = childValue;
    }
  }
  return target;
};

const unflatObject = (source, fields) => {
  const result = {};
  for (const [key, value] of Object.entries(source)) {
    const prefix = fields.find((name) => key.startsWith(name));
    if (prefix) {
      if (Object.hasOwn(source, prefix)) {
        throw new Error(`Can not combine keys: key "${prefix}" already exists`);
      }
      const newKey = key.substring(prefix.length).toLowerCase();
      const section = result[prefix];
      if (section) section[newKey] = value;
      else result[prefix] = { [newKey]: value };
      continue;
    }
    result[key] = value;
  }
  return result;
};

const getSignature = (method) => {
  const src = method.toString();
  const signature = between(src, '({', '})');
  if (signature === '') return [];
  return signature.split(',').map((s) => s.trim());
};

const namespaceByPath = (namespace, path) => {
  const [key, rest] = split(path, '.');
  const step = namespace[key];
  if (!step) return null;
  if (rest === '') return step;
  return namespaceByPath(step, rest);
};

const serializeArguments = (fields, args) => {
  if (!fields) return '';
  const data = {};
  for (const par of fields) {
    data[par] = args[par];
  }
  return JSON.stringify(data);
};

const firstKey = (obj) => Object.keys(obj).find(isFirstLetter);

const isInstanceOf = (obj, constrName) => obj?.constructor?.name === constrName;

// collector.js

class Collector {
  done = false;
  data = {};
  keys = [];
  count = 0;
  exact = true;
  reassign = false;
  timeout = 0;
  defaults = {};
  validate = null;
  #fulfill = null;
  #reject = null;
  #cause = null;
  #controller = null;
  #signal = null;
  #timeout = null;

  constructor(keys, options = {}) {
    const { exact = true, reassign = false } = options;
    const { timeout = 0, defaults = {}, validate } = options;
    if (validate) this.validate = validate;
    this.keys = keys;
    if (exact === false) this.exact = false;
    if (reassign === false) this.reassign = reassign;
    if (typeof defaults === 'object') this.defaults = defaults;
    this.#controller = new AbortController();
    this.#signal = this.#controller.signal;
    if (typeof timeout === 'number' && timeout > 0) {
      this.#timeout = AbortSignal.timeout(timeout);
      this.#signal = AbortSignal.any([this.#signal, this.#timeout]);
      this.#signal.addEventListener('abort', () => {
        if (Object.keys(this.defaults).length > 0) this.#default();
        if (this.done) return;
        this.fail(this.#signal.reason);
      });
    }
  }

  #default() {
    for (const [key, value] of Object.entries(this.defaults)) {
      if (this.data[key] === undefined) this.set(key, value);
    }
  }

  get signal() {
    return this.#signal;
  }

  set(key, value) {
    if (this.done) return;
    const expected = this.keys.includes(key);
    if (!expected && this.exact) {
      this.fail(new Error('Unexpected key: ' + key));
      return;
    }
    const has = this.data[key] !== undefined;
    if (has && !this.reassign) {
      const error = new Error('Collector reassign mode is off');
      return void this.fail(error);
    }
    if (!has && expected) this.count++;
    this.data[key] = value;
    if (this.count === this.keys.length) {
      this.done = true;
      this.#timeout = null;
      if (this.#fulfill) this.#fulfill(this.data);
    }
  }

  take(key, fn, ...args) {
    fn(...args, (error, data) => {
      if (error) this.fail(error);
      else this.set(key, data);
    });
  }

  wait(key, fn, ...args) {
    const promise = fn instanceof Promise ? fn : fn(...args);
    promise.then(
      (data) => this.set(key, data),
      (error) => this.fail(error),
    );
  }

  collect(sources) {
    for (const [key, collector] of Object.entries(sources)) {
      collector.then(
        (data) => this.set(key, data),
        (error) => this.fail(error),
      );
    }
  }

  fail(error) {
    this.done = true;
    this.#timeout = null;
    const cause = error || new Error('Collector aborted');
    this.#cause = cause;
    this.#controller.abort();
    if (this.#reject) this.#reject(cause);
  }

  abort() {
    this.fail();
  }

  then(onFulfilled, onRejected = null) {
    return new Promise((resolve, reject) => {
      this.#fulfill = resolve;
      this.#reject = reject;
      if (!this.done) return;
      if (this.validate) {
        try {
          this.validate(this.data);
        } catch (error) {
          this.#cause = error;
        }
      }
      if (this.#cause) reject(this.#cause);
      else resolve(this.data);
    }).then(onFulfilled, onRejected);
  }
}

const collect = (keys, options) => new Collector(keys, options);

// events.js

const DONE = { done: true, value: undefined };

class EventIterator {
  #resolvers = [];
  #emitter = null;
  #eventName = '';
  #listener = null;
  #onerror = null;
  #done = false;

  constructor(emitter, eventName) {
    this.#emitter = emitter;
    this.#eventName = eventName;

    this.#listener = (value) => {
      const resolvers = this.#resolvers;
      this.#resolvers = [];
      for (const resolver of resolvers) {
        resolver.resolve({ done: this.#done, value });
      }
    };
    emitter.on(eventName, this.#listener);

    this.#onerror = (error) => {
      const resolvers = this.#resolvers;
      this.#resolvers = [];
      for (const resolver of resolvers) {
        resolver.reject(error);
      }
      this.#finalize();
    };
    emitter.on('error', this.#onerror);
  }

  next() {
    return new Promise((resolve, reject) => {
      if (this.#done) return void resolve(DONE);
      this.#resolvers.push({ resolve, reject });
    });
  }

  #finalize() {
    if (this.#done) return;
    this.#done = true;
    this.#emitter.off(this.#eventName, this.#listener);
    this.#emitter.off('error', this.#onerror);
    for (const resolver of this.#resolvers) {
      resolver.resolve(DONE);
    }
    this.#resolvers.length = 0;
  }

  async return() {
    this.#finalize();
    return DONE;
  }

  async throw() {
    this.#finalize();
    return DONE;
  }
}

class EventIterable {
  #emitter = null;
  #eventName = '';

  constructor(emitter, eventName) {
    this.#emitter = emitter;
    this.#eventName = eventName;
  }

  [Symbol.asyncIterator]() {
    return new EventIterator(this.#emitter, this.#eventName);
  }
}

class Emitter {
  #events = new Map();
  #maxListeners = 10;

  constructor(options = {}) {
    this.#maxListeners = options.maxListeners ?? 10;
  }

  emit(eventName, value) {
    const event = this.#events.get(eventName);
    if (!event) {
      if (eventName !== 'error') return Promise.resolve();
      throw new Error('Unhandled error');
    }
    const listeners = event.on.slice();
    const promises = listeners.map(async (fn) => fn(value));
    if (event.once.size > 0) {
      const len = event.on.length;
      const remaining = new Array(len);
      let index = 0;
      for (let i = 0; i < len; i++) {
        const listener = event.on[i];
        if (!event.once.has(listener)) remaining[index++] = listener;
      }
      if (index === 0) {
        this.#events.delete(eventName);
      } else {
        remaining.length = index;
        this.#events.set(eventName, { on: remaining, once: new Set() });
      }
    }
    return Promise.all(promises).then(() => undefined);
  }

  #addListener(eventName, listener, once) {
    let event = this.#events.get(eventName);
    if (!event) {
      const on = [listener];
      event = { on, once: once ? new Set(on) : new Set() };
      this.#events.set(eventName, event);
    } else {
      if (event.on.includes(listener)) {
        throw new Error('Duplicate listeners detected');
      }
      event.on.push(listener);
      if (once) event.once.add(listener);
    }
    if (event.on.length > this.#maxListeners) {
      throw new Error(
        `MaxListenersExceededWarning: Possible memory leak. ` +
          `Current maxListeners is ${this.#maxListeners}.`,
      );
    }
  }

  on(eventName, listener) {
    this.#addListener(eventName, listener, false);
  }

  once(eventName, listener) {
    this.#addListener(eventName, listener, true);
  }

  off(eventName, listener) {
    if (!listener) return void this.#events.delete(eventName);
    const event = this.#events.get(eventName);
    if (!event) return;
    const index = event.on.indexOf(listener);
    if (index > -1) event.on.splice(index, 1);
    event.once.delete(listener);
  }

  toPromise(eventName) {
    return new Promise((resolve) => {
      this.once(eventName, resolve);
    });
  }

  toAsyncIterable(eventName) {
    return new EventIterable(this, eventName);
  }

  clear(eventName) {
    if (!eventName) return void this.#events.clear();
    this.#events.delete(eventName);
  }

  listeners(eventName) {
    if (!eventName) throw new Error('Expected eventName');
    const event = this.#events.get(eventName);
    return event ? event.on : [];
  }

  listenerCount(eventName) {
    if (!eventName) throw new Error('Expected eventName');
    const event = this.#events.get(eventName);
    return event ? event.on.length : 0;
  }

  eventNames() {
    return Array.from(this.#events.keys());
  }
}

// http.js

const parseHost = (host) => {
  if (!host) return 'no-host-name-in-http-headers';
  const portOffset = host.indexOf(':');
  if (portOffset > -1) return host.substring(0, portOffset);
  return host;
};

const parseParams = (params) => Object.fromEntries(new URLSearchParams(params));

const parseCookies = (cookie) => {
  const values = [];
  const items = cookie.split(';');
  for (const item of items) {
    const [key, val = ''] = item.split('=');
    values.push([key.trim(), val.trim()]);
  }
  return Object.fromEntries(values);
};

const parseRange = (range) => {
  if (!range || !range.includes('=')) return {};
  const bytes = range.split('=').pop();
  if (!bytes || !range.includes('-')) return {};
  const [start, end] = bytes.split('-').map((n) => parseInt(n));
  if (isNaN(start)) return isNaN(end) ? {} : { tail: end };
  return isNaN(end) ? { start } : { start, end };
};

// pool.js

class Pool {
  constructor(options = {}) {
    this.items = [];
    this.free = [];
    this.queue = [];
    this.timeout = options.timeout || 0;
    this.current = 0;
    this.size = 0;
    this.available = 0;
  }

  async next(exclusive = false) {
    if (this.size === 0) return null;
    if (this.available === 0) {
      return new Promise((resolve, reject) => {
        const waiting = { resolve, timer: null };
        waiting.timer = setTimeout(() => {
          waiting.resolve = null;
          this.queue.shift();
          reject(new Error('Pool next item timeout'));
        }, this.timeout);
        this.queue.push(waiting);
      });
    }
    let item = null;
    let free = false;
    let attempts = 0;
    do {
      item = this.items[this.current];
      free = this.free[this.current];
      this.current++;
      if (this.current === this.size) this.current = 0;
      if (++attempts > this.size) return null;
    } while (!item || !free);
    if (exclusive) {
      const index = this.items.indexOf(item);
      this.free[index] = false;
      this.available--;
    }
    return item;
  }

  add(item) {
    if (this.items.includes(item)) throw new Error('Pool: add duplicates');
    this.size++;
    this.available++;
    this.items.push(item);
    this.free.push(true);
  }

  async capture() {
    return this.next(true);
  }

  release(item) {
    const index = this.items.indexOf(item);
    if (index < 0) throw new Error('Pool: release unexpected item');
    if (this.free[index]) throw new Error('Pool: release not captured');
    if (this.queue.length > 0) {
      const { resolve, timer } = this.queue.shift();
      clearTimeout(timer);
      if (resolve) return void setTimeout(resolve, 0, item);
    }
    this.free[index] = true;
    this.available++;
  }

  isFree(item) {
    const index = this.items.indexOf(item);
    if (index < 0) return false;
    return this.free[index];
  }
}

// semaphore.js

class Semaphore {
  constructor({ concurrency, size = 0, timeout = 0 }) {
    this.concurrency = concurrency;
    this.counter = concurrency;
    this.timeout = timeout;
    this.size = size;
    this.queue = [];
    this.empty = true;
  }

  async enter() {
    return new Promise((resolve, reject) => {
      if (this.counter > 0) {
        this.counter--;
        this.empty = false;
        return void resolve();
      }
      if (this.queue.length >= this.size) {
        return void reject(new Error('Semaphore queue is full'));
      }
      const waiting = { resolve, timer: null };
      waiting.timer = setTimeout(() => {
        waiting.resolve = null;
        this.queue.shift();
        const { counter, concurrency } = this;
        this.empty = this.queue.length === 0 && counter === concurrency;
        reject(new Error('Semaphore timeout'));
      }, this.timeout);
      this.queue.push(waiting);
      this.empty = false;
    });
  }

  leave() {
    if (this.queue.length === 0) {
      this.counter++;
      this.empty = this.counter === this.concurrency;
      return;
    }
    const { resolve, timer } = this.queue.shift();
    clearTimeout(timer);
    if (resolve) setTimeout(resolve, 0);
    const { counter, concurrency } = this;
    this.empty = this.queue.length === 0 && counter === concurrency;
  }
}

// units.js

const SIZE_UNITS = ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

const bytesToSize = (bytes) => {
  if (bytes === 0) return '0';
  const exp = Math.floor(Math.log(bytes) / Math.log(1000));
  const size = bytes / 1000 ** exp;
  const short = Math.round(size);
  const unit = exp === 0 ? '' : ' ' + SIZE_UNITS[exp - 1];
  return short.toString() + unit;
};

const UNIT_SIZES = {
  yb: 24, // yottabyte
  zb: 21, // zettabyte
  eb: 18, // exabyte
  pb: 15, // petabyte
  tb: 12, // terabyte
  gb: 9, // gigabyte
  mb: 6, // megabyte
  kb: 3, // kilobyte
};

const sizeToBytes = (size) => {
  const length = size.length;
  const unit = size.substring(length - 2, length).toLowerCase();
  const value = parseInt(size, 10);
  const exp = UNIT_SIZES[unit];
  if (!exp) return value;
  return value * 10 ** exp;
};

// browser.js

const UINT32_MAX = 0xffffffff;
const BUF_LEN = 1024;
const BUF_SIZE = BUF_LEN * Uint32Array.BYTES_PER_ELEMENT;

const randomPrefetcher = {
  buf: new Uint8Array(BUF_SIZE),
  view: null,
  pos: 0,
  next() {
    const { buf, view, pos } = this;
    let start = pos;
    if (start === buf.length) {
      start = 0;
      crypto.getRandomValues(buf);
    }
    const rnd = view.getUint32(start, true) / (UINT32_MAX + 1);
    this.pos = start + Uint32Array.BYTES_PER_ELEMENT;
    return rnd;
  },
};

crypto.getRandomValues(randomPrefetcher.buf);
randomPrefetcher.view = new DataView(
  randomPrefetcher.buf.buffer,
  randomPrefetcher.buf.byteOffset,
  randomPrefetcher.buf.byteLength,
);

const cryptoRandom = (min, max) => {
  const rnd = randomPrefetcher.next();
  if (min === undefined) return rnd;
  const [a, b] = max === undefined ? [0, min] : [min, max];
  return a + Math.floor(rnd * (b - a + 1));
};

const random = (min, max) => {
  const rnd = Math.random();
  if (min === undefined) return rnd;
  const [a, b] = max === undefined ? [0, min] : [min, max];
  return a + Math.floor(rnd * (b - a + 1));
};

const generateUUID = () => crypto.randomUUID();

const latin1Decoder = new TextDecoder('latin1');

const generateKey = (possible, length) => {
  if (length < 0) return '';
  const base = possible.length;
  if (base < 1) return '';
  const key = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    const index = cryptoRandom(0, base - 1);
    key[i] = possible.charCodeAt(index);
  }
  return latin1Decoder.decode(key);
};

export {
  Error,
  DomainError,
  isError,
  replace,
  between,
  split,
  isFirstUpper,
  isFirstLower,
  isFirstLetter,
  toLowerCamel,
  toUpperCamel,
  toLower,
  toCamel,
  spinalToCamel,
  snakeToCamel,
  isConstant,
  fileExt,
  trimLines,
  sample,
  shuffle,
  projection,
  toBool,
  timeout,
  delay,
  timeoutify,
  duration,
  nowDate,
  nowDateTimeUTC,
  parseMonth,
  parseDay,
  parseEvery,
  nextEvent,
  makePrivate,
  protect,
  jsonParse,
  isHashObject,
  flatObject,
  unflatObject,
  getSignature,
  namespaceByPath,
  serializeArguments,
  firstKey,
  isInstanceOf,
  Collector,
  collect,
  Emitter,
  parseHost,
  parseParams,
  parseCookies,
  parseRange,
  Pool,
  Semaphore,
  bytesToSize,
  sizeToBytes,
  cryptoRandom,
  random,
  generateUUID,
  generateKey,
};
