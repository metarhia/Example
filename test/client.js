'use strict';

const metatests = require('metatests');
const { Metacom } = require('metacom/lib/client');

let token = '';

const connect = async () => {
  const url = 'ws://127.0.0.1:8000/api';
  let client;
  try {
    client = Metacom.create(url);
  } catch (e) {
    console.log(e);
  }

  if (!client) return console.log('No client');
  await client.ready();
  const signin = await client.socketCall('auth')('signin')({
    login: 'marcus',
    password: 'marcus',
  });
  if (typeof signin !== 'object' || signin?.status !== 'logged')
    return console.log('Not logged');
  token = signin?.token;
  runTests(client);
};

const runTests = (client) => {
  metatests.testAsync('system/introspect', async (test) => {
    const introspect = await client.socketCall('system')('introspect')([
      'auth',
      'console',
      'example',
      'files',
      'test',
    ]);
    test.strictSame(introspect?.auth?.restore?.[0], 'token');
    test.end();
  });

  metatests.testAsync('example/add', async (test) => {
    const add = await client.socketCall('example')('add')({ a: 1, b: 2 });
    test.strictSame(add, 3);
    test.end();
  });

  metatests.testAsync('example/citiesByCountry', async (test) => {
    const cities = await client.socketCall('example')('citiesByCountry')({
      countryId: 1,
    });
    test.strictEqual(cities?.result, 'success');
    test.strictEqual(Array.isArray(cities?.data), true);
    test.end();
  });

  metatests.testAsync('example/customError', async (test) => {
    try {
      await client.socketCall('example')('customError')();
    } catch (customError) {
      test.errorCompare(customError, new Error('Return custom error', 12345));
      test.strictEqual(customError?.code, 12345);
    } finally {
      test.end();
    }
  });

  metatests.testAsync('example/customException', async (test) => {
    try {
      await client.socketCall('example')('customException')();
    } catch (customError) {
      test.errorCompare(customError, new Error('Custom ecxeption', 12345));
      test.strictEqual(customError?.code, 12345);
    } finally {
      test.end();
    }
  });

  metatests.testAsync('example/error', async (test) => {
    try {
      await client.socketCall('example')('error')();
    } catch (Error) {
      test.errorCompare(Error, new Error('Return error'));
    } finally {
      test.end();
    }
  });

  metatests.testAsync('example/exception', async (test) => {
    try {
      await client.socketCall('example')('exception')();
    } catch (Error) {
      test.errorCompare(Error, new Error('Example exception'));
    } finally {
      test.end();
    }
  });

  metatests.testAsync('example/getClientInfo', async (test) => {
    try {
      const info = await client.socketCall('example')('getClientInfo')();
      test.strictEqual(info?.result?.ip, '127.0.0.1');
      test.strictEqual(info?.result?.token, token);
      test.strictEqual(info?.result?.accountId, '2');
    } catch (Error) {
      console.log(Error);
    } finally {
      test.end();
    }
  });

  metatests.testAsync('example/redisSet + redisGet', async (test) => {
    try {
      const setting = await client.socketCall('example')('redisSet')({
        key: 'MetarhiaExampleTest',
        value: 1,
      });
      const getting = await client.socketCall('example')('redisGet')({
        key: 'MetarhiaExampleTest',
      });
      console.log('setting', setting);
      console.log('getting', getting);
    } catch (Error) {
      test.errorCompare(Error, new Error('Example exception'));
    } finally {
      test.end();
    }
  });

  metatests.testAsync('example/resources', async (test) => {
    try {
      const resources = await client.socketCall('example')('resources')();
      console.log(resources);
    } catch (Error) {
      console.log(Error);
    } finally {
      test.end();
    }
  });

  metatests.testAsync('example/wait', async (test) => {
    try {
      const wait = await client.socketCall('example')('wait')({ delay: 1000 });
      test.strictEqual(wait, 'done');
    } catch (Error) {
      console.log(Error);
    } finally {
      test.end();
    }
  });
};

connect();
