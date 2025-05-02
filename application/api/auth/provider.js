({
  generateToken() {
    const { characters, secret, length } = config.sessions;
    return metarhia.metautil.generateToken(secret, characters, length);
  },

  async saveSession(token, data) {
    console.log({ saveSession: { token, data } });
    try {
      await db.pg.update('Session', { data: JSON.stringify(data) }, { token });
    } catch (error) {
      console.error(error);
    }
  },

  async createSession(token, data, fields = {}) {
    const record = { token, data: JSON.stringify(data), ...fields };
    console.log({ createSession: record });
    return db.pg.insert('Session', record);
  },

  async readSession(token) {
    const record = await db.pg.row('Session', ['data'], { token });
    console.log({ readSession: { token, record } });
    if (record && record.data) return record.data;
    return null;
  },

  async deleteSession(token) {
    return db.pg.delete('Session', { token });
  },

  async registerUser(login, email, hash, fullName, avatar = '') {
    const DEFAULT_ROLE = 4;
    try {
      // First, try to create the Account
      const res = await db.pg.insert('Account', { login, password: hash }, [
        'accountId',
      ]);

      try {
        // Then create related records in parallel
        await Promise.all([
          db.pg.insert('AccountRole', {
            accountId: res.accountId,
            roleId: DEFAULT_ROLE,
          }),
          db.pg.insert('AccountData', {
            accountId: res.accountId,
            fullName,
            email,
            avatar,
          }),
        ]);
        return res;
      } catch (error) {
        // If related records fail to insert, clean up by deleting the Account
        await db.pg.delete('Account', { accountId: res.accountId });
        console.error('Failed to create related records:', error);
        throw new Error('Failed to complete registration');
      }
    } catch (error) {
      console.error('Failed to create account:', error);
      if (error.code === '23505') {
        // PostgreSQL unique violation error code
        throw new Error('Username already exists');
      }
      throw new Error('Registration failed');
    }
  },

  async getUser(login) {
    return db.pg.row('Account', { login });
  },
});
