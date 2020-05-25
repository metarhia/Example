({
  // Sessions configuration
  anonymous: true, // Allow anonymous sessions
  sid: 'token', // Session tonek name
  characters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  secret: 'secret', // Session secret
  length: 64, // SID length in bytes
  persist: true, // Store sessions in persistent database
  perIpLimit: 20,
  perUserLimit: 5,
  regenerate: 1 * 60 * 60 * 1000,
  expire: 2 * 60 * 60 * 1000,
  // domain: 'name.com' // domain for cookie
});
