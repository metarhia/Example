({
  generateToken() {
    const { characters, secret, length } = config.sessions;
    return metarhia.metautil.generateToken(secret, characters, length);
  },

  async saveSession(token, data) {
    console.log({ saveSession: { token, data } });
    const payload = { data: JSON.stringify(data) };
    try {
      await db.pg.update('Session', payload, { token });
    } catch (error) {
      console.error(error);
    }
  },

  async createSession(token, data, fields = {}) {
    const record = {
      token,
      data: JSON.stringify(data),
      ...fields,
    };
    console.log({ createSession: record });
    return db.pg.insert('Session', record);
  },

  async readSession(token) {
    const record = await db.pg.row('Session', ['data'], { token });
    console.log({ readSession: { token, record } });
    if (record?.data) return record.data;
    return null;
  },

  async deleteSession(token) {
    return db.pg.delete('Session', { token });
  },

  async registerUser(login, password) {
    return db.pg.insert('Account', { login, password });
  },

  async getUser(login) {
    return db.pg.row('Account', { login });
  },
});
