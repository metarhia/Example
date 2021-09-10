async () => {
  if (application.worker.id === 'W1') {
    setTimeout(async () => {
      const res = await application.invoke({
        method: 'lib.invoke1.method1',
        args: { key: 'value' },
      });
      console.log('Invoke example', res);
    }, 1500);
  }
};
