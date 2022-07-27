const warnAboutMemoryLeak = (eventName, count) =>
  console.warn(
    `Possible EventEmitter memory leak detected.
  ${count} listeners added.
  You have to decrease the number of listeners for '${eventName}' event.
  Hint: avoid adding listeners in loops.`,
  );

export default class EventEmitter {
  constructor() {
    this.events = new Map();
    this.maxListenersCount = 10;
  }

  getMaxListeners() {
    return this.maxListenersCount;
  }

  listenerCount(name) {
    const event = this.events.get(name);
    if (event) return event.size;
    return 0;
  }

  on(name, fn) {
    const event = this.events.get(name);
    if (event) {
      event.add(fn);
      const tooManyListeners = event.size > this.maxListenersCount;
      if (tooManyListeners) warnAboutMemoryLeak(name, event.size);
    } else {
      this.events.set(name, new Set([fn]));
    }
  }

  once(name, fn) {
    const dispose = (...args) => {
      this.remove(name, dispose);
      return fn(...args);
    };
    this.on(name, dispose);
  }

  emit(name, ...args) {
    const event = this.events.get(name);
    if (!event) return;
    for (const fn of event.values()) {
      fn(...args);
    }
  }

  remove(name, fn) {
    const event = this.events.get(name);
    if (!event) return;
    if (event.has(fn)) {
      event.delete(fn);
    }
  }

  clear(name) {
    if (name) this.events.delete(name);
    else this.events.clear();
  }
}
