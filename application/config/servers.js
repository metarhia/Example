({
  http: {
    secure: false,
    address: '*',
    ports: [80],
    concurrency: 1000,
    nagle: true, // Nagle algorithm
    api: true, // Allow API access
    static: true, // Serve static
    allowOrigin: '*', // Access-Control-Allow-Origin (default: not set)
    host: '127.0.0.1', // '*.metarhia.com'
    queueSize: 2000,
    queueTimeout: 3000,
    timeout: 5000,
    slowTime: 10000,
  },

  https: {
    secure: true,
    address: '*',
    ports: [81, 82, 83],
    concurrency: 1000,
    nagle: true,
    api: true,
    static: true,
    queueSize: 2000,
    queueTimeout: 3000,
    timeout: 5000,
    slowTime: 10000,
  },
});
