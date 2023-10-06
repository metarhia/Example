async ({ command, args }) => {
  const cmd = {
    init: async ({ map }) => {
      await metarhia.metautil.delay(100);
      Object.setPrototypeOf(map, npm.sharedmap.prototype);
      lib.sharedMap.storage = map;
      return { status: 'saved' };
    },
    get: async () => {
      if (!lib.sharedMap.storage) throw new Error('ShardMap not initialized');
      return { map: lib.sharedMap.storage };
    },
  };
  console.debug('lib.sharedMap.sync');
  return cmd[command](args);
};
