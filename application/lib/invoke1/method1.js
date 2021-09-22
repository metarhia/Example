async (args) => {
  console.debug('lib.invoke1.method1', args);
  await metarhia.metautil.delay(2000);
  return { hello: 'world' };
};
