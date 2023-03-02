'use strict';

const runTests = (client, token) => {
  const metatests = require('metatests');
  const fs = require('fs');
  const fsp = fs.promises;
  const { Blob, Buffer } = require('node:buffer');
  const stream = require('stream');



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
    await client.socketCall('example')('exception')();
      test.fail('Shoud never reach here');
      test.end();
  });

  metatests.testAsync('example/getClientInfo', async (test) => {

      const info = await client.socketCall('example')('getClientInfo')();
      test.strictEqual(info?.result?.ip, '127.0.0.1');
      test.strictEqual(info?.result?.token, token);
      test.strictEqual(info?.result?.accountId, '2');
      test.end();

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
      // console.log({setting, getting});
      test.strictEqual(getting, '1');
    } catch (Error) {
      test.errorCompare(Error, new Error('Example exception'));
    } finally {
      test.end();
    }
  });

  metatests.testAsync('example/resources', async (test) => {
    try {
      const resources = await client.socketCall('example')('resources')();
      test.strictEqual(resources?.total, null);
      // console.log({resources});
    } catch (Error) {
      console.log(Error);
    } finally {
      test.end();
    }
  });

  //   metatests.testAsync('example/hook', async (test) => {
  //     let hook;
  //     try {
  //        hook = await client.httpCall('example', 1)('hook')();

  //       console.log(hook)
  //       test.strictEqual(hook?.success, true);
  //     }
  //     catch(e){
  //       console.log(e)
  //     }
  //     finally {
  //     test.end(hook);
  //     }

  // });



  // metatests.testAsync('example/subscribe', async (test) => {
  //   try {
  //     const wait = await client.socketCall('example')('wait')({ delay: 1000 });
  //     // console.log(client.api.chat)
  //     test.strictEqual(wait, 'done');
  //   } catch (Error) {
  //     console.log(Error);
  //   } finally {
  //     test.end();
  //   }
  // });
/*
   metatests.testAsync('example/uploadFile', async (test) => {
      const original = 'uploading/sunset.jpg', uploaded = '../application/tmp/sunset_uploaded.jpg';
      // const buffer = Buffer.from(fs.readFileSync(original));
      // const blob = Uint8Array.from(buffer).buffer;
      const content = await fsp.readFile(original);
      const blob = new Blob([content]);
      // blob.name = 'sunset.jpg';
      // console.log(blob.size)

      // console.log(buffer)
    const uploader = client.createBlobUploader(blob);
    uploader.upload();

      // const readable = fs.createReadStream(original);
      // const writable = client.createStream(original);
      // readable.pipe(writable);
      // // once readable is piped
      // await client.socketCall('example')('uploadFile')('sunset_uploaded.jpg', {stremId: writable.streamId});

      // const fixture = fs.readFileSync(original);
      // const result = fs.readFileSync(uploaded);
      // test.strictSame(result, fixture);
      test.end();
    });
*/

  // metatests.testAsync('example/wait', async (test) => {
  //   try {
  //     const wait = await client.socketCall('example')('wait')({ delay: 1000 });
  //     test.strictEqual(wait, 'done');
  //   } catch (Error) {
  //     console.log(Error);
  //   } finally {
  //     test.end();
  //   }
  // });

};

const connect = async () => {
  const { Metacom } = require('metacom/lib/client');
  const url = 'ws://127.0.0.1:8000/api';
  const client = Metacom.create(url);
  await client.ready();
  const signin = await client.socketCall('auth')('signin')({
    login: 'marcus',
    password: 'marcus',
  });
  const token = signin?.token;
  // await client.load( 'auth',
  // 'console',
  // 'example',
  // 'files',
  // 'test');
  runTests(client, token);

};

connect();
// console.log(JSON.stringify({ a: 1, b: 2 }));
