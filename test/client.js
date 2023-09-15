'use strict';

const { Metacom } = require('metacom/lib/client');

const test = require('node:test');
const assert = require('node:assert/strict');

const { Blob } = require('node:buffer');
const fs = require('node:fs');
const fsp = fs.promises;
const { testHook, apiReady, getUrl } = require('./utils.js');

const LOGIN = 'marcus';
const PASSWORD = 'marcus';
const ACCOUNT_ID = '2';
const TEST_TIMEOUT = 10000;

const runTests = async (wsClient, wsToken, wsApi, url) => {
  const tests = {
    'system/introspect': async () => {
      const units = ['auth', 'console', 'example', 'files', 'test'];
      const introspect = await wsClient.scaffold('system')('introspect')(units);
      assert.strictEqual(introspect?.auth?.restore?.[0], 'token');
    },

    'example/add': async () => {
      const add = await wsApi.example.add({ a: 1, b: 2 });
      assert.strictEqual(add, 3);
    },

    'example/citiesByCountry': async () => {
      const cities = await wsApi.example.citiesByCountry({
        countryId: 1,
      });
      assert.strictEqual(cities?.result, 'success');
      assert.strictEqual(Array.isArray(cities?.data), true);
    },

    'example/customError': async () => {
      try {
        await wsApi.example.customError();
      } catch (customError) {
        assert.strictEqual(customError.message, 'Return custom error');
        assert.strictEqual(customError?.code, 12345);
      }
    },

    'example/customException': async () => {
      try {
        await wsApi.example.customException();
      } catch (customError) {
        assert.strictEqual(customError.message, 'Custom ecxeption');
        assert.strictEqual(customError?.code, 12345);
      }
    },

    'example/error': async () => {
      try {
        await wsApi.example.error();
      } catch (err) {
        assert.strictEqual(err.message, 'Return error');
      }
    },

    'example/exception': async () => {
      try {
        await wsApi.example.exception();
      } catch (err) {
        assert.strictEqual(err.message, 'Internal Server Error');
      }
    },

    'example/getClientInfo': async () => {
      const info = await wsApi.example.getClientInfo();
      assert.strictEqual(info?.result?.token, wsToken);
      assert.strictEqual(info?.result?.accountId, ACCOUNT_ID);
    },

    'example/redisSet + redisGet': async () => {
      const setting = await wsApi.example.redisSet({
        key: 'MetarhiaExampleTest',
        value: 1,
      });
      const getting = await wsApi.example.redisGet({
        key: 'MetarhiaExampleTest',
      });
      assert.strictEqual(setting?.result, 'OK');
      assert.strictEqual(getting?.result, '1');
    },

    'example/resources': async () => {
      const resources = await wsApi.example.resources();
      assert.strictEqual(resources?.total, null);
    },

    hook: async () => {
      const hook = await testHook({
        url,
        path: '/api/hook',
        argsString: 'arg1=2&mem=3',
      });

      assert.strictEqual(hook?.success, true);
    },

    'example/subscribe': async () => {
      const res = await wsApi.example.subscribe({ test: true });
      assert.deepEqual(res, { subscribed: 'resmon' });
      await new Promise((resolve) => {
        wsApi.example.once('resmon', resolve());
      });
    },

    'example/wait': async () => {
      const wait = await wsApi.example.wait({ delay: 1000 });
      assert.strictEqual(wait, 'done');
    },

    'file/upload': async () => {
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
      assert.strictEqual(res?.result, 'Stream initialized');
      // Start uploading stream and wait for its end
      await uploader.upload();
    },

    'example/uploadFile': async () => {
      const file = 'sunset.jpg';
      const path = './test/uploading/' + file;
      const content = await fsp.readFile(path);

      const res = await wsApi.example.uploadFile({
        data: content.toJSON(),
        name: file,
      });
      assert.strictEqual(res?.uploaded, content?.length);
    },
  };

  const prom = [];
  console.log(`Run ${Object.entries(tests).length} tests`);
  for (const [caption, func] of Object.entries(tests)) {
    prom.push(test.test(caption, func));
  }

  await Promise.allSettled(prom);
};

const main = async () => {
  const { url, wsUrl } = await getUrl();

  await apiReady(url);

  const wsClient = Metacom.create(wsUrl + '/api');
  const wsApi = wsClient.api;
  await wsClient.load('auth', 'console', 'example', 'files');
  const res = await wsApi.auth.signin({ login: LOGIN, password: PASSWORD });
  const wsToken = res.token;

  wsClient.on('close', process.exit);
  setTimeout(() => {
    console.info('Stop tests by timeout');
    wsClient.close();
    process.exit(-1);
  }, TEST_TIMEOUT);
  await runTests(wsClient, wsToken, wsApi, url);
  wsClient.close();
};

main();
