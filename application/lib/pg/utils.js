({
  where(conditions, firstArgIndex = 1) {
    const clause = [];
    const args = [];
    let i = firstArgIndex;
    const keys = Object.keys(conditions);
    for (const key of keys) {
      let operator = '=';
      let value = conditions[key];
      if (typeof value === 'string') {
        for (const op of lib.pg.constants.OPERATORS) {
          const len = op.length;
          if (value.startsWith(op)) {
            operator = op;
            value = value.substring(len);
          }
        }
        if (value.includes('*') || value.includes('?')) {
          operator = 'LIKE';
          value = value.replace(/\*/g, '%').replace(/\?/g, '_');
        }
      }
      clause.push(`${key} ${operator} $${i++}`);
      args.push(value);
    }
    return { clause: clause.join(' AND '), args };
  },

  updates(delta, firstArgIndex = 1) {
    const clause = [];
    const args = [];
    let i = firstArgIndex;
    const keys = Object.keys(delta);
    for (const key of keys) {
      const value = delta[key].toString();
      clause.push(`${key} = $${i++}`);
      args.push(value);
    }
    return { clause: clause.join(', '), args };
  }
});
