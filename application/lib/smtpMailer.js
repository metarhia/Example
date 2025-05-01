async function send({ host, port, from, to, subject, body, user, pass }) {
  return new Promise((resolve, reject) => {
    let socket = node.net.connect(port, host);
    let buffer = '';

    const sendLine = (line) => socket.write(line + '\r\n');

    const wait = (expected) =>
      new Promise((res, rej) => {
        const onData = (data) => {
          buffer += data.toString();
          if (buffer.endsWith('\r\n')) {
            if (buffer.startsWith(expected)) {
              socket.removeListener('data', onData);
              buffer = '';
              res();
            } else {
              rej(new Error(`Unexpected: ${buffer}`));
            }
          }
        };
        socket.on('data', onData);
      });

    const upgrade = () =>
      new Promise((res, rej) => {
        socket.removeAllListeners('data');
        socket = node.tls.connect({ socket, servername: host }, res);
        socket.on('error', rej);
      });

    socket.on('connect', async () => {
      try {
        await wait('220');
        sendLine('EHLO localhost');
        await wait('250');
        sendLine('STARTTLS');
        await wait('220');
        await upgrade();
        sendLine('EHLO localhost');
        await wait('250');
        sendLine('AUTH LOGIN');
        await wait('334');
        sendLine(Buffer.from(user).toString('base64'));
        await wait('334');
        sendLine(Buffer.from(pass).toString('base64'));
        await wait('235');
        sendLine(`MAIL FROM:<${from}>`);
        await wait('250');
        sendLine(`RCPT TO:<${to}>`);
        await wait('250');
        sendLine('DATA');
        await wait('354');
        sendLine(`Subject: ${subject}`);
        sendLine(`To: ${to}`);
        sendLine(`From: ${from}`);
        sendLine('');
        sendLine(body);
        sendLine('.');
        await wait('250');
        sendLine('QUIT');
        socket.end();
        resolve();
      } catch (err) {
        socket.destroy();
        reject(err);
      }
    });

    socket.on('error', reject);
  });
}
