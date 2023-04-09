import EventEmitter from './events.js';

const STREAM_ID_LENGTH = 4;

const createIdBuffer = (id) => {
  const buffer = new ArrayBuffer(STREAM_ID_LENGTH);
  const view = new DataView(buffer);
  view.setInt32(0, id);
  return buffer;
};

const getStreamId = (buffer) => {
  const view = new DataView(buffer);
  return view.getInt32(0);
};

class Chunk {
  static encode(id, payload) {
    const idView = new Uint8Array(createIdBuffer(id));
    const chunkView = new Uint8Array(STREAM_ID_LENGTH + payload.length);
    chunkView.set(idView);
    chunkView.set(payload, STREAM_ID_LENGTH);
    return chunkView;
  }

  static decode(chunkView) {
    const id = getStreamId(chunkView.buffer);
    const payload = chunkView.subarray(STREAM_ID_LENGTH);
    return { id, payload };
  }
}

const PUSH_EVENT = Symbol();
const PULL_EVENT = Symbol();
const DEFAULT_HIGH_WATER_MARK = 32;
const MAX_HIGH_WATER_MARK = 1000;

class MetaReadable extends EventEmitter {
  constructor(initData, options = {}) {
    super();
    this.id = initData.id;
    this.name = initData.name;
    this.size = initData.size;
    this.highWaterMark = options.highWaterMark || DEFAULT_HIGH_WATER_MARK;
    this.queue = [];
    this.streaming = true;
    this.status = null;
    this.bytesRead = 0;
    this.maxListenersCount = this.getMaxListeners() - 1;
  }

  async push(data) {
    if (this.queue.length > this.highWaterMark) {
      this.checkStreamLimits();
      await this.waitEvent(PULL_EVENT);
      return this.push(data);
    }
    this.queue.push(data);
    if (this.queue.length === 1) this.emit(PUSH_EVENT);
    return data;
  }

  async finalize(writable) {
    const waitWritableEvent = this.waitEvent.bind(writable);
    writable.once('error', () => this.terminate());
    for await (const chunk of this) {
      const needDrain = !writable.write(chunk);
      if (needDrain) await waitWritableEvent('drain');
    }
    this.emit('end');
    writable.end();
    await waitWritableEvent('close');
    await this.close();
  }

  pipe(writable) {
    void this.finalize(writable);
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
    this.bytesRead += data.length;
    this.emit(PULL_EVENT);
    return data;
  }

  // increase queue if source is much faster than reader
  // implement remote backpressure to resolve
  checkStreamLimits() {
    if (this.listenerCount(PULL_EVENT) >= this.maxListenersCount) {
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
      if (chunk) yield chunk;
      else return;
    }
  }
}

class MetaWritable extends EventEmitter {
  constructor(transport, initData) {
    super();
    this.transport = transport;
    this.id = initData.id;
    this.name = initData.name;
    this.size = initData.size;
    this.init();
  }

  init() {
    const packet = {
      type: 'stream',
      id: this.id,
      name: this.name,
      size: this.size,
    };
    this.transport.send(JSON.stringify(packet));
  }

  write(data) {
    const chunk = Chunk.encode(this.id, data);
    this.transport.send(chunk);
    return true;
  }

  end() {
    const packet = { type: 'stream', id: this.id, status: 'end' };
    this.transport.send(JSON.stringify(packet));
  }

  terminate() {
    const packet = { type: 'stream', id: this.id, status: 'terminate' };
    this.transport.send(JSON.stringify(packet));
  }
}

export { Chunk, MetaReadable, MetaWritable };
