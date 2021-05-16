({
  Relation: {},

  role: 'Role',
  identifier: 'Identifier',
  action: 'string',
  kind: { enum: ['read', 'insert', 'update', 'delete', 'audit', 'custom'] },

  //naturalKey: { unique: ['role', 'category', 'catalog'] },
});
