async () => {
  if (application.worker.id === 'W1') {
    const res = await application.invoke({
      method: 'lib.invoke1.method1',
      args: { key: 'value' },
      exclusive: true,
    });
    console.log('Invoke example', res);
  }
};
