(key) =>
  new Promise((resolve, reject) => {
    lib.redis.client.get(key, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
