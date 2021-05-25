({
  generateToken() {
    const { characters, secret, length } = config.sessions;
    return metarhia.metautil.generateToken(secret, characters, length);
  },

  saveSession(token, data) {
    domain.db.update('Session', { data: JSON.stringify(data) }, { token });
  },

  startSession(token, data, fields = {}) {
    const record = { token, data: JSON.stringify(data), ...fields };
    domain.db.insert('Session', record);
  },

  async restoreSession(token) {
    const record = await domain.db.row('Session', ['data'], { token });
    if (record && record.data) return record.data;
    return null;
  },

  deleteSession(token) {
    domain.db.delete('Session', { token });
  },

  async registerUser(login, password) {
    return domain.db.insert('Account', { login, password });
  },

  async getUser(login) {
    return domain.db.row('Account', { login });
  },
});
