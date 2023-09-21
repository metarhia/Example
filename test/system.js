'use strict';

const http = require('node:http');
const assert = require('node:assert').strict;
const { apiReady, loadConfig } = require('./utils');

const HOST = '127.0.0.1';
const PORT = 8000;
const TEST_TIMEOUT = 10000;

let callId = 0;

console.log('System test started');

const stop = async () => {
  console.log('System test finished');
  process.exit(0);
};
const interrupt = async (reason) => {
  console.log(`System test interrupted by ${reason}`);
  process.exit(-1);
};
setTimeout(() => interrupt('timeout'), TEST_TIMEOUT);

const tasks = [
  { get: '/', status: 302 },
  { get: '/console.js' },
  {
    post: '/api',
    method: 'signIn',
    args: { login: 'marcus', password: 'marcus' },
  },
];

const getRequest = (task) => {
  const request = {
    host: HOST,
    port: PORT,
    agent: false,
  };
  if (task.get) {
    request.method = 'GET';
    request.path = task.get;
  } else if (task.post) {
    request.method = 'POST';
    request.path = task.post;
  }
  if (task.args) {
    const packet = { call: ++callId, [task.method]: task.args };
    task.data = JSON.stringify(packet);
    request.headers = {
      'Content-Type': 'application/json',
      'Content-Length': task.data.length,
    };
  }
  return request;
};

const requestProm = async (request, task) =>
  new Promise((resolve, reject) => {
    const req = http.request(request);
    req.on('response', (res) => {
      const expectedStatus = task.status || 200;
      setTimeout(() => {
        assert.equal(res.statusCode, expectedStatus);
      }, TEST_TIMEOUT);
      resolve();
    });
    req.on('error', (err) => {
      console.log(err.stack);
      reject();
    });
    if (task.data) req.write(task.data);
    req.end();
  });

const main = async () => {
  const { ports } = await loadConfig('server');
  await apiReady(`http://${HOST}:${ports[0]}`);

  let error = false;
  tasks.forEach(async (task) => {
    const name = task.get || task.post;
    console.log('HTTP request ' + name);
    const request = getRequest(task);
    try {
      await requestProm(request, task);
    } catch (err) {
      error = true;
    }
  });
  if (error) await interrupt('error');
  await stop();
};

main();
