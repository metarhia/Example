'use strict';

const http = require('node:http');
const metavm = require('metavm');

const INTERVAL = 500;

const load = async (filePath) => {
  const { exports } = await metavm.readScript(filePath);
  return exports;
};

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

const apiReady = async (url) => {
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
  return load(`./application/config/${configName}.js`);
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
