(key, value) =>
  new Promise((resolve, reject) => {
    db.redis.client.set(key, value, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
