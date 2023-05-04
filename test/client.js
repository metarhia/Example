'use strict';

const http = require('node:http');
const metatests = require('metatests');
const fs = require('node:fs');
const fsp = fs.promises;
const { Blob } = require('node:buffer');

const HOST = '127.0.0.1';
const PORT = 8000;
const TEST_TIMEOUT = 10000;
const START_TIMEOUT = 1000;

const runTests = async (
  wsClient,
  wsToken,
  wsApi,
  httpClient,
  // httpToken,
  // httpApi,
) => {
  const tests = {
    'system/introspect': async (test) => {
      const introspect = await wsClient.scaffold('system')('introspect')([
        'auth',
        'console',
        'example',
        'files',
        'test',
      ]);
      test.strictSame(introspect?.auth?.restore?.[0], 'token');
      test.end();
    },

    'example/add': async (test) => {
      const add = await wsApi.example.add({ a: 1, b: 2 });
      test.strictSame(add, 3);
      test.end();
    },

    'example/citiesByCountry': async (test) => {
      const cities = await wsApi.example.citiesByCountry({
        countryId: 1,
      });
      test.strictEqual(cities?.result, 'success');
      test.strictEqual(Array.isArray(cities?.data), true);
      test.end();
    },

    'example/customError': async (test) => {
      try {
        await wsApi.example.customError();
      } catch (customError) {
        test.errorCompare(customError, new Error('Return custom error', 12345));
        test.strictEqual(customError?.code, 12345);
      } finally {
        test.end();
      }
    },

    'example/customException': async (test) => {
      try {
        await wsApi.example.customException();
      } catch (customError) {
        test.errorCompare(customError, new Error('Custom ecxeption', 12345));
        test.strictEqual(customError?.code, 12345);
      } finally {
        test.end();
      }
    },

    'example/error': async (test) => {
      try {
        await wsApi.example.error();
      } catch (err) {
        test.errorCompare(err, new Error('Return error'));
      } finally {
        test.end();
      }
    },

    'example/exception': async (test) => {
      try {
        await wsApi.example.exception();
      } catch (err) {
        test.errorCompare(err, new Error('Example exception'));
      } finally {
        test.end();
      }
    },

    'example/getClientInfo': async (test) => {
      try {
        const info = await wsApi.example.getClientInfo();
        test.strictEqual(info?.result?.ip, '127.0.0.1');
        test.strictEqual(info?.result?.token, wsToken);
        test.strictEqual(info?.result?.accountId, '2');
      } catch (err) {
        console.log(err);
      } finally {
        test.end();
      }
    },

    'example/redisSet + redisGet': async (test) => {
      try {
        const setting = await wsApi.example.redisSet({
          key: 'MetarhiaExampleTest',
          value: 1,
        });
        const getting = await wsApi.example.redisGet({
          key: 'MetarhiaExampleTest',
        });
        test.strictEqual(setting?.result, 'OK');
        test.strictEqual(getting?.result, '1');
      } catch (err) {
        test.errorCompare(err, new Error('Example exception'));
      } finally {
        test.end();
      }
    },

    'example/resources': async (test) => {
      try {
        const resources = await wsApi.example.resources();
        test.strictEqual(resources?.total, null);
        // console.log({resources});
      } catch (err) {
        console.log(err);
      } finally {
        test.end();
      }
    },

    hook: async (test) => {
      let hook;
      try {
        hook = await testHook({
          url: httpClient.url,
          path: '/hook',
          argsString: 'arg1=2&mem=3',
        });

        test.strictEqual(hook?.success, true);
      } catch (err) {
        console.log(err);
      } finally {
        test.end();
      }
    },

    'example/subscribe': async (test) => {
      try {
        const wait = await wsApi.example.wait({ delay: 1000 });
        // console.log(client.api.chat)
        test.strictEqual(wait, 'done');
      } catch (err) {
        console.log(err);
      } finally {
        test.end();
      }
    },

    'example/wait': async (test) => {
      try {
        const wait = await wsApi.example.wait({ delay: 1000 });
        test.strictEqual(wait, 'done');
      } catch (err) {
        console.log(err);
      } finally {
        test.end();
      }
    },

    'file/upload': async (test) => {
      const file = 'sunset.jpg';
      const path = './test/uploading/' + file;
      const content = await fsp.readFile(path);
      const blob = new Blob([content]);
      blob.name = file;
      // createBlobUploader creates streamId and inits file reader for convenience
      const uploader = wsClient.createBlobUploader(blob);
      // Prepare backend file consumer
      const res = await wsApi.files.upload({
        streamId: uploader.streamId,
        name: file,
      });
      test.strictEqual(res?.result, 'Stream initialized');
      // Start uploading stream and wait for its end
      await uploader.upload();
      test.end();
    },

    'example/uploadFile': async (test) => {
      const file = 'sunset.jpg';
      const path = './test/uploading/' + file;
      const content = await fsp.readFile(path);

      const res = await wsApi.example.uploadFile({
        data: content.toJSON(),
        name: file,
      });
      test.strictEqual(res?.uploaded, content?.length);
      test.end();
    },
  };

  const results = [];
  console.log(`Run ${Object.entries(tests).length} tests`);
  for (const [caption, func] of Object.entries(tests)) {
    // console.log({ caption, func });
    results.push(metatests.testAsync(caption, func));
  }

  await new Promise((resolve) => {
    const timer = setInterval(() => {
      for (const res of results) {
        if (!res.done) break;
      }
      clearInterval(timer);
      setTimeout(resolve, 2500);
    }, 1000);
  });
};

function testHook({ url, path, argsString }) {
  return new Promise((resolve, reject) => {
    http.get(url + path + '?' + argsString, (res) => {
      // console.log({ res });
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
        console.error(error.message);
        // Consume response data to free up memory
        res.resume();
        reject();
      }

      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', (chunk) => {
        rawData += chunk;
      });
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(rawData);
          // console.log(parsedData);
          resolve(parsedData);
        } catch (e) {
          console.error(e.message);
        }
      });
    });
  });
}

const getHttpUrl = async () => {
  const request = {
    host: HOST,
    port: PORT,
    agent: false,
    method: 'GET',
    path: '/',
  };

  return new Promise((resolve, reject) => {
    const req = http.request(request);
    req.on('response', (res) => {
      resolve(res.headers.location);
    });

    req.on('error', (err) => {
      reject(err);
    });
    req.end();
  });
};

const connect = async () => {
  const { Metacom } = require('metacom/lib/client');

  const httpUrl = (await getHttpUrl()) + 'api';
  const wsUrl = `ws${httpUrl.substring(4)}`;
  // const wsUrl = 'ws://127.0.0.1:8000/api';

  const wsClient = Metacom.create(wsUrl);
  const wsApi = wsClient.api;
  await wsClient.load('auth', 'console', 'example', 'files');
  const res = await wsApi.auth.signin({ login: 'marcus', password: 'marcus' });
  const wsToken = res.token;

  const httpClient = Metacom.create(httpUrl);
  const httpApi = httpClient.api;
  await httpClient.load('auth', 'console', 'example', 'files');
  const httpSignin = await httpApi.auth.signin({
    login: 'marcus',
    password: 'marcus',
  });
  const httpToken = httpSignin?.token;

  wsClient.on('close', process.exit);
  setTimeout(() => {
    console.info('Stop tests by timeout');
    wsClient.close();
  }, TEST_TIMEOUT);
  await runTests(wsClient, wsToken, wsApi, httpClient, httpToken, httpApi);
  wsClient.close();
};

setTimeout(async () => {
  await connect();
}, START_TIMEOUT);
