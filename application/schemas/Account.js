({
  Registry: {},

  login: { type: 'string', unique: true },
  password: 'string',
  blocked: { type: 'boolean', default: false },
  unit: 'Unit',
  roles: { many: 'Role' },

  fullName: {
    given: { type: 'string', required: false },
    middle: { type: 'string', required: false },
    surname: { type: 'string', required: false },
  },

  birth: {
    date: { type: 'string', required: false },
    place: { type: 'string', required: false },
  },
});
