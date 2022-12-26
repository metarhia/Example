'use strict';
const metatests = require('metatests');
const { Metacom } = require('metacom/lib/client');

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
  if (typeof signin !== 'object' || signin.status !== 'logged')
    return console.log('Not logged');
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
    // console.log(introspect);
    test.strictSame(introspect?.auth?.restore?.[0], 'token');
    test.end();
  });

  metatests.testAsync('example/add', async (test) => {
    const add = await client.socketCall('example')('add')({ a: 1, b: 2 });
    test.strictSame(add, 3);
    test.end();
  });

  // process.exit();
};

connect();
