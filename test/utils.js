'use strict';

const fs = require('node:fs').promises;
const vm = require('node:vm');
const http = require('node:http');

const RUN_OPTIONS = { timeout: 5000, displayErrors: false };
const INTERVAL = 500;

const load = async (filePath, sandbox) => {
  const src = await fs.readFile(filePath, 'utf8');
  const code = `'use strict';\n${src}`;
  const script = new vm.Script(code);
  const context = vm.createContext(Object.freeze({ ...sandbox }));
  const exports = script.runInContext(context, RUN_OPTIONS);
  return exports;
};

const delay = async (ms) => new Promise((res) => setTimeout(res, ms));

const testHook = async ({ url, path, argsString }) => {
  return new Promise((resolve, reject) => {
    http.get(url + path + '?' + argsString, { method: 'POST' }, (res) => {
      const { statusCode } = res;
      const contentType = res.headers['content-type'];
      let error;
      // Any 2xx status code signals a successful response but
      // here we're only checking for 200.
      if (statusCode !== 200) {
        error = new Error(`Request Failed.\n Status Code: ${statusCode}`);
      } else if (!/^application\/json/.test(contentType)) {
        error = new Error(
          'Invalid content-type.\n' +
            `Expected application/json but received ${contentType}`,
        );
      }
      if (error) {
        // Consume response data to free up memory
        res.resume();
        reject(error);
      }

      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', (chunk) => {
        rawData += chunk;
      });
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(rawData);
          resolve(parsedData);
        } catch (err) {
          reject(err);
        }
      });
    });
  });
};

const apiReady = async ({ url, timeout }) => {
  await delay(timeout);
  await new Promise((resolve) => {
    const checker = setInterval(async () => {
      testHook({
        url,
        path: '/api/hook',
        argsString: 'arg1=2&mem=3',
      })
        .then(() => {
          clearInterval(checker);
          resolve();
        })
        .catch((err) => {
          console.log(err); // not for landing
        });
    }, INTERVAL);
  });
};

const loadConfig = async (configName) => {
  const sandbox = { Map: class PseudoMap {} };
  return load(`./application/config/${configName}.js`, sandbox);
};

const getUrl = async () => {
  const { protocol, ports, host } = await loadConfig('server');
  return {
    url: `${protocol}://${host}:${ports[0]}`,
    wsUrl: `${protocol === 'http' ? 'ws' : 'wss'}://${host}:${ports[0]}`,
  };
};

module.exports = {
  loadConfig,
  getUrl,
  testHook,
  apiReady,
};
