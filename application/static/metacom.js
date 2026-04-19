import { Emitter, generateUUID, jsonParse } from './metautil.js';

// chunks-browser.js

const ID_LENGTH_BYTES = 1;

const chunkEncode = (id, payload) => {
  const encoder = new TextEncoder();
  const idBuffer = encoder.encode(id);
  const idLength = idBuffer.length;
  if (idLength > 255) {
    throw new Error(`ID length ${idLength} exceeds maximum of 255 characters`);
  }
  const chunk = new Uint8Array(ID_LENGTH_BYTES + idLength + payload.length);
  chunk[0] = idLength;
  chunk.set(idBuffer, ID_LENGTH_BYTES);
  chunk.set(payload, ID_LENGTH_BYTES + idLength);
  return chunk;
};

const chunkDecode = (chunk) => {
  const idLength = chunk[0];
  const idBuffer = chunk.subarray(ID_LENGTH_BYTES, ID_LENGTH_BYTES + idLength);
  const decoder = new TextDecoder();
  const id = decoder.decode(idBuffer);
  const payload = chunk.subarray(ID_LENGTH_BYTES + idLength);
  return { id, payload };
};

// streams.js

const PUSH_EVENT = Symbol();
const PULL_EVENT = Symbol();
const DEFAULT_HIGH_WATER_MARK = 32;
const MAX_LISTENERS = 10;
const MAX_HIGH_WATER_MARK = 1000;

class MetaReadable extends Emitter {
  queue = [];
  streaming = true;
  status = 'active';
  bytesRead = 0;
  highWaterMark = DEFAULT_HIGH_WATER_MARK;

  constructor(id, name, size, options = {}) {
    super();
    this.id = id;
    this.name = name;
    this.size = size;
    const { highWaterMark } = options;
    if (highWaterMark) this.highWaterMark = highWaterMark;
  }

  async push(data) {
    while (this.queue.length > this.highWaterMark) {
      this.checkStreamLimits();
      await this.waitEvent(PULL_EVENT);
    }
    this.queue.push(data);
    if (this.queue.length === 1) this.emit(PUSH_EVENT);
    return data;
  }

  async finalize(writable) {
    const onError = () => this.terminate();
    writable.once('error', onError);
    for await (const chunk of this) {
      const needDrain = !writable.write(chunk);
      if (needDrain) await writable.waitEvent('drain');
    }
    this.emit('end');
    writable.end();
    await writable.waitEvent('close');
    await this.close();
    writable.removeListener('error', onError);
  }

  pipe(writable) {
    this.finalize(writable).catch((error) => this.emit('error', error));
    return writable;
  }

  async toBlob(type = '') {
    const chunks = [];
    for await (const chunk of this) {
      chunks.push(chunk);
    }
    return new Blob(chunks, { type });
  }

  async close() {
    await this.stop();
    this.status = 'closed';
  }

  async terminate() {
    await this.stop();
    this.status = 'terminated';
  }

  async stop() {
    while (this.bytesRead !== this.size) {
      await this.waitEvent(PULL_EVENT);
    }
    this.streaming = false;
    this.emit(PUSH_EVENT, null);
  }

  async read() {
    if (this.queue.length > 0) return this.pull();
    const finisher = await this.waitEvent(PUSH_EVENT);
    if (finisher === null) return null;
    return this.pull();
  }

  pull() {
    const data = this.queue.shift();
    if (!data) return data;
    this.bytesRead += data.length;
    this.emit(PULL_EVENT);
    return data;
  }

  checkStreamLimits() {
    if (this.listenerCount(PULL_EVENT) >= MAX_LISTENERS) {
      ++this.highWaterMark;
    }
    if (this.highWaterMark > MAX_HIGH_WATER_MARK) {
      throw new Error('Stream overflow occurred');
    }
  }

  waitEvent(event) {
    return new Promise((resolve) => this.once(event, resolve));
  }

  async *[Symbol.asyncIterator]() {
    while (this.streaming) {
      const chunk = await this.read();
      if (!chunk) return;
      yield chunk;
    }
  }
}

class MetaWritable extends Emitter {
  constructor(id, name, size, transport) {
    super();
    this.id = id;
    this.name = name;
    this.size = size;
    this.transport = transport;
    this.init();
  }

  init() {
    const { id, name, size } = this;
    const packet = { type: 'stream', id, name, size };
    this.transport.send(packet);
  }

  write(data) {
    const chunk = chunkEncode(this.id, data);
    this.transport.write(chunk);
    return true;
  }

  end() {
    const packet = { type: 'stream', id: this.id, status: 'end' };
    this.transport.send(packet);
  }

  terminate() {
    const packet = { type: 'stream', id: this.id, status: 'terminate' };
    this.transport.send(packet);
  }
}

// metacom.js

const CALL_TIMEOUT = 7 * 1000;
const RECONNECT_TIMEOUT = 2 * 1000;

const toByteView = async (input) => {
  if (typeof input.arrayBuffer === 'function') {
    const buffer = await input.arrayBuffer();
    return new Uint8Array(buffer);
  }
  return new Uint8Array(input);
};

class MetacomError extends Error {
  constructor({ message, code }) {
    super(message);
    this.code = code;
  }
}

class ClientTransport extends Emitter {
  active = false;

  constructor(url) {
    super();
    this.url = url;
  }

  send(obj) {
    this.write(JSON.stringify(obj));
  }
}

class Metacom extends Emitter {
  static connections = new Set();
  static isOnline = true;

  static online() {
    Metacom.isOnline = true;
    for (const connection of Metacom.connections) {
      connection.#transport.online();
      if (!connection.connected && connection.active) {
        connection.open().catch((error) => connection.emit('error', error));
      }
    }
  }

  static offline() {
    Metacom.isOnline = false;
    for (const connection of Metacom.connections) {
      connection.#transport.offline();
    }
  }

  static initialize() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', Metacom.online);
      window.addEventListener('offline', Metacom.offline);
      return;
    }
    if (typeof self !== 'undefined') {
      self.addEventListener('online', Metacom.online);
      self.addEventListener('offline', Metacom.offline);
    }
  }

  api = {};
  #transport = null;
  #calls = new Map();
  #streams = new Map();
  #callTimeout = CALL_TIMEOUT;
  #reconnectTimeout = RECONNECT_TIMEOUT;
  #reconnectTimer = null;
  #proxyPacket = null;
  #options = {};

  get active() {
    return this.#transport.active;
  }

  constructor(url, transport, options = {}) {
    super();
    const { callTimeout, reconnectTimeout, proxy } = options;
    if (callTimeout) this.#callTimeout = callTimeout;
    if (reconnectTimeout) this.#reconnectTimeout = reconnectTimeout;
    if (proxy) this.#proxyPacket = proxy;
    this.url = url;
    this.#transport = transport;
    this.#options = options;
    this.#bindTransport();
  }

  static async connect(url, options = {}) {
    if (options.worker) {
      const transport = Metacom.transport.event.getInstance(url);
      const metacom = new Metacom(url, transport, options);
      await metacom.open();
      return metacom;
    }
    const isHttp = url.startsWith('http');
    const Transport = isHttp ? Metacom.transport.http : Metacom.transport.ws;
    const transport = new Transport(url);
    const metacom = new Metacom(url, transport, options);
    await metacom.open();
    return metacom;
  }

  #bindTransport() {
    this.#transport.on('open', () => {
      clearTimeout(this.#reconnectTimer);
      this.#reconnectTimer = null;
      this.emit('open');
    });

    this.#transport.on('close', () => {
      this.emit('close');
      this.#scheduleReconnect();
    });

    this.#transport.on('error', (error) => {
      this.emit('error', error);
    });

    this.#transport.on('message', (data) => {
      const escalate = (error) => this.emit('error', error);
      if (typeof data === 'string') this.#handlePacket(data).catch(escalate);
      else this.#handleBinary(data).catch(escalate);
    });
  }

  #scheduleReconnect() {
    if (this.active) return;
    if (!Metacom.connections.has(this)) return;
    if (this.#reconnectTimer) return;
    this.#reconnectTimer = setTimeout(() => {
      this.#reconnectTimer = null;
      this.open().catch((error) => this.emit('error', error));
    }, this.#reconnectTimeout);
  }

  async open() {
    Metacom.connections.add(this);
    await this.#transport.open(this.#options);
  }

  close() {
    clearTimeout(this.#reconnectTimer);
    this.#reconnectTimer = null;
    Metacom.connections.delete(this);
    this.#transport.close();
  }

  write(data) {
    this.#transport.write(data);
  }

  send(data) {
    this.#transport.send(data);
  }

  getStream(id) {
    const stream = this.#streams.get(id);
    if (stream) return stream;
    throw new Error(`Stream ${id} is not initialized`);
  }

  createStream(name, size) {
    const id = generateUUID();
    return new MetaWritable(id, name, size, this);
  }

  createBlobUploader(blob) {
    const { name = 'blob', size } = blob;
    const consumer = this.createStream(name, size);
    const { id } = consumer;
    const upload = async () => {
      for await (const chunk of blob.stream()) {
        consumer.write(chunk);
      }
      consumer.end();
    };
    return { id, upload };
  }

  async #handlePacket(data) {
    if (this.#proxyPacket) return void this.#proxyPacket(data);
    const packet = jsonParse(data);
    if (!packet) throw new Error('Invalid JSON packet');
    const { type, id, name } = packet;
    if (type === 'event') {
      const parts = name.split('/');
      const unit = parts[0];
      const eventName = parts[1];
      const metacomUnit = this.api[unit];
      if (metacomUnit) metacomUnit.emit(eventName, packet.data);
      return;
    }
    if (!id) throw new Error('Packet structure error');
    if (type === 'callback') {
      const promised = this.#calls.get(id);
      if (!promised) throw new Error(`Callback ${id} not found`);
      const resolve = promised[0];
      const reject = promised[1];
      const timeout = promised[2];
      this.#calls.delete(id);
      clearTimeout(timeout);
      if (packet.error) {
        return void reject(new MetacomError(packet.error));
      }
      resolve(packet.result);
      return;
    }
    if (type === 'stream') await this.#handleStream(packet);
  }

  async #handleStream(packet) {
    const { id, name, size, status } = packet;
    const stream = this.#streams.get(id);
    if (status === undefined) {
      if (stream) {
        throw new Error(`Stream ${name} is already initialized`);
      }
      const readableStream = new MetaReadable(id, name, size);
      this.#streams.set(id, readableStream);
      return;
    }
    if (!stream) throw new Error(`Stream ${id} is not initialized`);
    if (status === 'end') {
      await stream.close();
      this.#streams.delete(id);
    } else if (status === 'terminate') {
      await stream.terminate();
      this.#streams.delete(id);
    }
  }

  async #handleBinary(input) {
    const byteView = await toByteView(input);
    const { id, payload } = chunkDecode(byteView);
    const stream = this.#streams.get(id);
    if (!stream) {
      throw new Error(`Stream ${id} is not initialized`);
    }
    await stream.push(payload);
  }

  async load(...units) {
    if (!this.active) throw new Error('Not connected');
    const introspect = this.#scaffold('system')('introspect');
    const introspection = await introspect(units);
    const available = Object.keys(introspection);
    for (const unit of units) {
      if (!available.includes(unit)) continue;
      const methods = new Emitter();
      const instance = introspection[unit];
      const request = this.#scaffold(unit);
      const methodNames = Object.keys(instance);
      for (const methodName of methodNames) {
        methods[methodName] = request(methodName);
      }
      this.api[unit] = methods;
    }
  }

  #scaffold(unit, version) {
    const createMethod = (methodName) => {
      const method = async (args = {}) => {
        const id = generateUUID();
        const ver = version ? `.${version}` : '';
        const target = `${unit}${ver}/${methodName}`;
        const packet = { type: 'call', id, method: target, args };
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            if (!this.#calls.has(id)) return;
            this.#calls.delete(id);
            reject(new Error('Request timeout'));
          }, this.#callTimeout);
          this.#calls.set(id, [resolve, reject, timeout]);
          this.send(packet);
        });
      };
      return method;
    };
    return createMethod;
  }
}

class ClientWsTransport extends ClientTransport {
  #socket = null;
  #opening = null;

  async open() {
    if (this.active) return Promise.resolve();
    if (this.#opening) return this.#opening;
    const opening = new Promise((resolve, reject) => {
      const socket = new WebSocket(this.url);
      this.#socket = socket;
      const onClose = (error) => {
        this.#socket = null;
        if (this.#opening) {
          this.#opening = null;
          this.emit('error', error);
          return void reject(new Error('Connection closed'));
        } else {
          this.active = false;
          this.emit('close', error);
        }
      };
      const onOpen = () => {
        this.active = true;
        this.emit('open');
        this.#opening = null;
        resolve();
      };
      socket.addEventListener('open', onOpen, { once: true });
      socket.addEventListener('close', onClose, { once: true });
      socket.addEventListener('error', onClose, { once: true });
      socket.addEventListener('message', ({ data }) => {
        this.emit('message', data);
      });
    });
    this.#opening = opening;
    return opening;
  }

  close() {
    if (!this.active) return;
    this.#socket.close();
  }

  write(data) {
    if (!this.active) throw new Error('Not connected');
    this.#socket.send(data);
  }
}

class ClientHttpTransport extends ClientTransport {
  async open() {
    if (this.active) return;
    this.active = true;
    this.emit('open');
  }

  close() {
    if (!this.active) return;
    this.active = false;
    this.emit('close');
  }

  write(data) {
    const headers = { 'Content-Type': 'application/json' };
    fetch(this.url, { method: 'POST', headers, body: data })
      .then((res) => res.text())
      .then((packet) => this.emit('message', packet))
      .catch((error) => this.emit('error', error));
  }
}

class ClientEventTransport extends ClientTransport {
  static instance = null;

  #port = null;
  #worker = null;

  static getInstance(url) {
    if (ClientEventTransport.instance) {
      return ClientEventTransport.instance;
    }
    const transport = new ClientEventTransport(url);
    ClientEventTransport.instance = transport;
    return transport;
  }

  async open(options = {}) {
    if (this.active) return;
    const worker = options.worker || this.#worker;
    if (!worker) throw new Error('Service Worker not provided');
    this.#worker = worker;
    const { port1, port2 } = new MessageChannel();
    this.#port = port1;
    port1.addEventListener('message', ({ data }) => {
      if (data === undefined) return;
      this.emit('message', data);
    });
    port1.start();
    this.#worker.postMessage({ type: 'metacom:connect' }, [port2]);
    this.active = true;
    this.emit('open');
  }

  close() {
    this.active = false;
    this.#port.close();
    this.#port = null;
    this.emit('close');
  }

  online() {
    if (this.#worker) this.#worker.postMessage({ type: 'metacom:online' });
  }

  offline() {
    if (this.#worker) this.#worker.postMessage({ type: 'metacom:offline' });
  }

  write(data) {
    if (!this.#port) throw new Error('Not connected');
    this.#port.postMessage(data);
  }
}

class MetacomProxy extends Emitter {
  #ports = new Set();
  #pending = new Map();
  #connection = null;
  #callTimeout = CALL_TIMEOUT;
  #reconnectTimeout = RECONNECT_TIMEOUT;

  constructor(options = {}) {
    super();
    const { callTimeout, reconnectTimeout } = options;
    if (callTimeout) this.#callTimeout = callTimeout;
    if (reconnectTimeout) this.#reconnectTimeout = reconnectTimeout;
    if (typeof self === 'undefined') {
      throw new Error('MetacomProxy must run in ServiceWorker context');
    }
    self.addEventListener('message', (event) => {
      const { type } = event.data;
      if (type?.startsWith('metacom')) this.#handleEvent(event);
    });
  }

  async open() {
    if (this.#connection) {
      if (this.#connection.connected) return;
      await this.#connection.open();
      return;
    }
    const protocol = self.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = `${protocol}//${self.location.host}`;
    const options = {
      callTimeout: this.#callTimeout,
      reconnectTimeout: this.#reconnectTimeout,
      proxy: (data) => this.#proxyPacket(data),
    };
    this.#connection = await Metacom.connect(url, options);
  }

  close() {
    if (!this.#connection) return;
    this.#connection.close();
    this.#connection = null;
  }

  #handleEvent(event) {
    const { type } = event.data;
    if (type === 'metacom:connect') {
      const port = event.ports[0];
      if (!port) throw new Error('MessagePort not provided');
      this.#ports.add(port);
      port.addEventListener('message', (messageEvent) => {
        this.#handleMessage(messageEvent, port);
      });
      port.start();
      return;
    }
    if (type === 'metacom:online') Metacom.online();
    else if (type === 'metacom:offline') Metacom.offline();
    else throw new Error(`Unknown event: ${type}`);
  }

  async #handleMessage(event, port) {
    const { data } = event;
    if (data === undefined) throw new Error('Message data is undefined');
    await this.open();
    if (!this.#connection || !this.#connection.active) {
      throw new Error('Not connected to server');
    }
    const packet = jsonParse(data);
    if (!packet || !packet.id) throw new Error('Invalid JSON packet');
    this.#pending.set(packet.id, port);
    this.#connection.write(data);
  }

  #proxyPacket(data) {
    if (typeof data !== 'string') return void this.#broadcast(data);
    const packet = jsonParse(data);
    if (!packet) return void this.#broadcast(data);
    const { type, id, status } = packet;
    if (type === 'event') return void this.#broadcast(data);
    const port = this.#pending.get(id);
    if (!port) return void this.#broadcast(data);
    port.postMessage(data);
    if (type === 'callback') return void this.#pending.delete(id);
    if (type !== 'stream') return;
    if (status === 'end' || status === 'terminate') this.#pending.delete(id);
  }

  #broadcast(data, excludePort = null) {
    for (const port of this.#ports) {
      if (port === excludePort) continue;
      port.postMessage(data);
    }
  }
}

Metacom.transport = {
  ws: ClientWsTransport,
  http: ClientHttpTransport,
  event: ClientEventTransport,
};

Metacom.initialize();

export {
  chunkEncode,
  chunkDecode,
  MetaReadable,
  MetaWritable,
  Metacom,
  MetacomProxy,
};
