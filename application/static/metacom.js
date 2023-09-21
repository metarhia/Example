import EventEmitter from './events.js';
import { chunkDecode, MetaReadable, MetaWritable } from './streams.js';

const CALL_TIMEOUT = 7 * 1000;
const PING_INTERVAL = 60 * 1000;
const RECONNECT_TIMEOUT = 2 * 1000;

const connections = new Set();

window.addEventListener('online', () => {
  for (const connection of connections) {
    if (!connection.connected) connection.open();
  }
});

class MetacomError extends Error {
  constructor({ message, code }) {
    super(message);
    this.code = code;
  }
}

class MetacomUnit extends EventEmitter {
  emit(...args) {
    super.emit('*', ...args);
    super.emit(...args);
  }
}

class Metacom extends EventEmitter {
  constructor(url, options = {}) {
    super();
    this.url = url;
    this.socket = null;
    this.api = {};
    this.callId = 0;
    this.calls = new Map();
    this.streams = new Map();
    this.streamId = 0;
    this.active = false;
    this.connected = false;
    this.opening = null;
    this.lastActivity = Date.now();
    this.callTimeout = options.callTimeout || CALL_TIMEOUT;
    this.pingInterval = options.pingInterval || PING_INTERVAL;
    this.reconnectTimeout = options.reconnectTimeout || RECONNECT_TIMEOUT;
    this.ping = null;
    this.open();
  }

  static create(url, options) {
    const { transport } = Metacom;
    const Transport = url.startsWith('ws') ? transport.ws : transport.http;
    return new Transport(url, options);
  }

  getStream(id) {
    const stream = this.streams.get(id);
    if (stream) return stream;
    throw new Error(`Stream ${id} is not initialized`);
  }

  createStream(name, size) {
    const id = ++this.streamId;
    const initData = { type: 'stream', id, name, size };
    const transport = this;
    return new MetaWritable(transport, initData);
  }

  createBlobUploader(blob) {
    const name = blob.name || 'blob';
    const size = blob.size;
    const consumer = this.createStream(name, size);
    return {
      id: consumer.id,
      upload: async () => {
        const reader = blob.stream().getReader();
        let chunk;
        while (!(chunk = await reader.read()).done) {
          consumer.write(chunk.value);
        }
        consumer.end();
      },
    };
  }

  async message(data) {
    if (data === '{}') return;
    this.lastActivity = Date.now();
    let packet;
    try {
      packet = JSON.parse(data);
    } catch {
      return;
    }
    const { type, id, name } = packet;
    if (type === 'event') {
      const [unit, eventName] = name.split('/');
      const metacomUnit = this.api[unit];
      if (metacomUnit) metacomUnit.emit(eventName, packet.data);
      return;
    }
    if (!id) {
      console.error(new Error('Packet structure error'));
      return;
    }
    if (type === 'callback') {
      const promised = this.calls.get(id);
      if (!promised) return;
      const [resolve, reject, timeout] = promised;
      this.calls.delete(id);
      clearTimeout(timeout);
      if (packet.error) {
        return void reject(new MetacomError(packet.error));
      }
      resolve(packet.result);
    } else if (type === 'stream') {
      const { name, size, status } = packet;
      const stream = this.streams.get(id);
      if (name && typeof name === 'string' && Number.isSafeInteger(size)) {
        if (stream) {
          console.error(new Error(`Stream ${name} is already initialized`));
        } else {
          const streamData = { id, name, size };
          const stream = new MetaReadable(streamData);
          this.streams.set(id, stream);
        }
      } else if (!stream) {
        console.error(new Error(`Stream ${id} is not initialized`));
      } else if (status === 'end') {
        await stream.close();
        this.streams.delete(id);
      } else if (status === 'terminate') {
        await stream.terminate();
        this.streams.delete(id);
      } else {
        console.error(new Error('Stream packet structure error'));
      }
    }
  }

  async binary(blob) {
    const buffer = await blob.arrayBuffer();
    const byteView = new Uint8Array(buffer);
    const { id, payload } = chunkDecode(byteView);
    const stream = this.streams.get(id);
    if (stream) await stream.push(payload);
    else console.warn(`Stream ${id} is not initialized`);
  }

  async load(...units) {
    const introspect = this.scaffold('system')('introspect');
    const introspection = await introspect(units);
    const available = Object.keys(introspection);
    for (const unit of units) {
      if (!available.includes(unit)) continue;
      const methods = new MetacomUnit();
      const instance = introspection[unit];
      const request = this.scaffold(unit);
      const methodNames = Object.keys(instance);
      for (const methodName of methodNames) {
        methods[methodName] = request(methodName);
      }
      this.api[unit] = methods;
    }
  }

  scaffold(unit, ver) {
    return (method) =>
      async (args = {}) => {
        const id = ++this.callId;
        const unitName = unit + (ver ? '.' + ver : '');
        const target = unitName + '/' + method;
        if (this.opening) await this.opening;
        if (!this.connected) await this.open();
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            if (this.calls.has(id)) {
              this.calls.delete(id);
              reject(new Error('Request timeout'));
            }
          }, this.callTimeout);
          this.calls.set(id, [resolve, reject, timeout]);
          const packet = { type: 'call', id, method: target, args };
          this.send(JSON.stringify(packet));
        });
      };
  }
}

class WebsocketTransport extends Metacom {
  async open() {
    if (this.opening) return this.opening;
    if (this.connected) return Promise.resolve();
    const socket = new WebSocket(this.url);
    this.active = true;
    this.socket = socket;
    connections.add(this);

    socket.addEventListener('message', ({ data }) => {
      if (typeof data === 'string') this.message(data);
      else this.binary(data);
    });

    socket.addEventListener('close', () => {
      this.opening = null;
      this.connected = false;
      this.emit('close');
      setTimeout(() => {
        if (this.active) this.open();
      }, this.reconnectTimeout);
    });

    socket.addEventListener('error', (err) => {
      this.emit('error', err);
      socket.close();
    });

    this.ping = setInterval(() => {
      if (this.active) {
        const interval = Date.now() - this.lastActivity;
        if (interval > this.pingInterval) this.send('{}');
      }
    }, this.pingInterval);

    this.opening = new Promise((resolve) => {
      socket.addEventListener('open', () => {
        this.opening = null;
        this.connected = true;
        this.emit('open');
        resolve();
      });
    });
    return this.opening;
  }

  close() {
    this.active = false;
    connections.delete(this);
    clearInterval(this.ping);
    if (!this.socket) return;
    this.socket.close();
    this.socket = null;
  }

  send(data) {
    if (!this.connected) return;
    this.lastActivity = Date.now();
    this.socket.send(data);
  }
}

class HttpTransport extends Metacom {
  async open() {
    this.active = true;
    this.connected = true;
    this.emit('open');
  }

  close() {
    this.active = false;
    this.connected = false;
  }

  send(data) {
    this.lastActivity = Date.now();
    fetch(this.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: data,
    }).then((res) =>
      res.text().then((packet) => {
        this.message(packet);
      }),
    );
  }
}

Metacom.transport = {
  ws: WebsocketTransport,
  http: HttpTransport,
};

export { Metacom, MetacomUnit };
