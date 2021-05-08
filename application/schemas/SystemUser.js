({
  login: { type: 'string', unique: true },
  password: { type: 'string', length: { min: 7 } },
});
