(key, value) =>
  new Promise((resolve, reject) => {
    lib.redis.client.set(key, value, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
