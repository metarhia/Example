(key) =>
  new Promise((resolve, reject) => {
    db.redis.client.get(key, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
