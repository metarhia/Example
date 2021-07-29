({
  generateToken() {
    const { characters, secret, length } = config.sessions;
    return metarhia.metautil.generateToken(secret, characters, length);
  },

  saveSession(token, data) {
    db.pg.update('Session', { data: JSON.stringify(data) }, { token });
  },

  startSession(token, data, fields = {}) {
    const record = { token, data: JSON.stringify(data), ...fields };
    db.pg.insert('Session', record);
  },

  async restoreSession(token) {
    const record = await db.pg.row('Session', ['data'], { token });
    if (record && record.data) return record.data;
    return null;
  },

  deleteSession(token) {
    db.pg.delete('Session', { token });
  },

  async registerUser(login, password) {
    return db.pg.insert('Account', { login, password });
  },

  async getUser(login) {
    return db.pg.row('Account', { login });
  },
});
