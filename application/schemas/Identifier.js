({
  Registry: { scope: 'global' },

  category: 'Category',
  storage: { enum: ['master', 'cache', 'backup', 'replica'], index: true },
  status: { enum: ['prealloc', 'init', 'actual', 'historical'], index: true },
  creation: 'datetime',
  change: 'datetime',
  lock: { type: 'boolean', default: false },
  version: { type: 'number', default: 0 },
  hashsum: 'string',
});
