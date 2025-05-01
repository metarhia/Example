({
  access: 'public',
  method: async () => {
    const { send } = api.lib.smtpMailer;

    const res = await send({
      host: 'smtp.soopeer.com',
      port: 587,
      from: 'robot@soopeer.com',
      to: 'lp0404@gmail.com',
      subject: 'Test from Metarhia',
      body: 'Test message',
      user: 'smtpuser',
      pass: 'smtppass',
    });

    return res;
  },
});
