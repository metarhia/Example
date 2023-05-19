'use strict';

const { Metacom } = require('metacom/lib/client');
const metatests = require('metatests');

const { Blob } = require('node:buffer');
const fs = require('node:fs');
const fsp = fs.promises;
const { testHook, apiReady, getUrl } = require('./utils');

const HOST = '127.0.0.1';
const LOGIN = 'marcus';
const PASSWORD = 'marcus';
const ACCOUNT_ID = '2';
const TEST_TIMEOUT = 10000;
const START_TIMEOUT = 1000;

const runTests = async (wsClient, wsToken, wsApi, url) => {
  const tests = {
    'system/introspect': async (test) => {
      const units = ['auth', 'console', 'example', 'files', 'test'];
      const introspect = await wsClient.scaffold('system')('introspect')(units);
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
      const info = await wsApi.example.getClientInfo();
      test.strictEqual(info?.result?.ip, HOST);
      test.strictEqual(info?.result?.token, wsToken);
      test.strictEqual(info?.result?.accountId, ACCOUNT_ID);
      test.end();
    },

    'example/redisSet + redisGet': async (test) => {
      const setting = await wsApi.example.redisSet({
        key: 'MetarhiaExampleTest',
        value: 1,
      });
      const getting = await wsApi.example.redisGet({
        key: 'MetarhiaExampleTest',
      });
      test.strictEqual(setting?.result, 'OK');
      test.strictEqual(getting?.result, '1');

      test.end();
    },

    'example/resources': async (test) => {
      const resources = await wsApi.example.resources();
      test.strictEqual(resources?.total, null);
      test.end();
    },

    hook: async (test) => {
      const hook = await testHook({
        url,
        path: '/api/hook',
        argsString: 'arg1=2&mem=3',
      });

      test.strictEqual(hook?.success, true);
      test.end();
    },

    'example/subscribe': async (test) => {
      const wait = await wsApi.example.wait({ delay: 1000 });
      test.strictEqual(wait, 'done');
      test.end();
    },

    'example/wait': async (test) => {
      const wait = await wsApi.example.wait({ delay: 1000 });
      test.strictEqual(wait, 'done');
      test.end();
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
        streamId: uploader.id,
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
    results.push(metatests.testAsync(caption, func));
  }

  await new Promise((resolve) => {
    const timer = setInterval(() => {
      let done = true;
      for (const res of results) {
        if (!res.done) {
          done = false;
          break;
        }
      }
      if (done) {
        clearInterval(timer);
        resolve();
      }
    }, 1000);
  });
};

const main = async () => {
  const { url, wsUrl } = await getUrl();

  await apiReady({
    url,
    timeout: START_TIMEOUT,
  });

  const wsClient = Metacom.create(wsUrl + '/api');
  const wsApi = wsClient.api;
  await wsClient.load('auth', 'console', 'example', 'files');
  const res = await wsApi.auth.signin({ login: LOGIN, password: PASSWORD });
  const wsToken = res.token;

  // const httpClient = Metacom.create(url + '/api');
  // const httpApi = httpClient.api;
  // await httpClient.load('auth', 'console', 'example', 'files');
  // const httpSignin = await httpApi.auth.signin({
  //   login: LOGIN,
  //   password: PASSWORD,
  // });
  // const httpToken = httpSignin?.token;

  wsClient.on('close', process.exit);
  setTimeout(() => {
    console.info('Stop tests by timeout');
    wsClient.close();
    process.exit(-1);
  }, TEST_TIMEOUT);
  await runTests(wsClient, wsToken, wsApi, url);
  wsClient.close();
};

require('impress');

main();
