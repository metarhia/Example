'use strict';

const runTests = (wsClient, wsToken, httpClient, httpToken) => {
  const metatests = require('metatests');
  const fs = require('fs');
  const fsp = fs.promises;
  const { Blob, Buffer } = require('node:buffer');
  const stream = require('stream');



  metatests.testAsync('system/introspect', async (test) => {
    const introspect = await wsClient.scaffold('system')('introspect')([
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
    const add = await wsClient.scaffold('example')('add')({ a: 1, b: 2 });
    test.strictSame(add, 3);
    test.end();
  });

  metatests.testAsync('example/citiesByCountry', async (test) => {
    const cities = await wsClient.scaffold('example')('citiesByCountry')({
      countryId: 1,
    });
    test.strictEqual(cities?.result, 'success');
    test.strictEqual(Array.isArray(cities?.data), true);
    test.end();
  });

  metatests.testAsync('example/customError', async (test) => {
    try {
      await wsClient.scaffold('example')('customError')();
    } catch (customError) {
      test.errorCompare(customError, new Error('Return custom error', 12345));
      test.strictEqual(customError?.code, 12345);
    } finally {
      test.end();
    }
  });

  metatests.testAsync('example/customException', async (test) => {
    try {
      await wsClient.scaffold('example')('customException')();
    } catch (customError) {
      test.errorCompare(customError, new Error('Custom ecxeption', 12345));
      test.strictEqual(customError?.code, 12345);
    } finally {
      test.end();
    }
  });

  metatests.testAsync('example/error', async (test) => {
    try {
      await wsClient.scaffold('example')('error')();
    } catch (Error) {
      test.errorCompare(Error, new Error('Return error'));
    } finally {
      test.end();
    }
  });

  metatests.testAsync('example/exception', async (test) => {

    try {
      await wsClient.scaffold('example')('exception')();
    }
    catch(Error){
      test.errorCompare(Error, new Error('Example exception'));
    }
    finally {
      test.end();
    }
      // test.fail('Shoud never reach here');
      // test.end();
  });

  metatests.testAsync('example/getClientInfo', async (test) => {

      const info = await wsClient.scaffold('example')('getClientInfo')();

      // console.log('info', info)
      test.strictEqual(info?.result?.ip, '127.0.0.1');
      test.strictEqual(info?.result?.token, wsToken);
      test.strictEqual(info?.result?.accountId, '2');
      test.end();

  });

  metatests.testAsync('example/redisSet + redisGet', async (test) => {
    try {
      const setting = await wsClient.scaffold('example')('redisSet')({
        key: 'MetarhiaExampleTest',
        value: 1,
      });
      const getting = await wsClient.scaffold('example')('redisGet')({
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

  // metatests.testAsync('example/resources', async (test) => {
  //   try {
  //     const resources = await wsClient.scaffold('example')('resources')();
  //     test.strictEqual(resources?.total, null);
  //     // console.log({resources});
  //   } catch (Error) {
  //     console.log(Error);
  //   } finally {
  //     test.end();
  //   }
  // });

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
  //     const wait = await wsClient.scaffold('example')('wait')({ delay: 1000 });
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
      // await wsClient.scaffold('example')('uploadFile')('sunset_uploaded.jpg', {stremId: writable.streamId});

      // const fixture = fs.readFileSync(original);
      // const result = fs.readFileSync(uploaded);
      // test.strictSame(result, fixture);
      test.end();
    });
*/

  // metatests.testAsync('example/wait', async (test) => {
  //   try {
  //     const wait = await wsClient.scaffold('example')('wait')({ delay: 1000 });
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

  const wsUrl = 'ws://127.0.0.1:8000/api';
  const wsClient = Metacom.create(wsUrl);
  await wsClient.open();
  const wsSignin = await wsClient.scaffold('auth')('signin')({
    login: 'marcus',
    password: 'marcus',
  });

  const wsToken = wsSignin?.token;
  // const wsClient = null, wsToken = null;

  const httpUrl = 'http://127.0.0.1:8000/api';
  const httpClient = Metacom.create(httpUrl);
  await httpClient.open();
  const httpSignin = await httpClient.scaffold('auth')('signin')({
    login: 'marcus',
    password: 'marcus',
  });
  const httpToken = httpSignin?.token;
  //  const httpClient = null, httpToken = null;


  // await client.load( 'auth',
  // 'console',
  // 'example',
  // 'files',
  // 'test');



  runTests(wsClient, wsToken, httpClient, httpToken);

};

connect();
// console.log(JSON.stringify({ a: 1, b: 2 }));
