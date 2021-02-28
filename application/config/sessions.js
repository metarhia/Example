({
  anonymous: true,
  sid: 'token',
  characters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  secret: 'secret',
  length: 64,
  persist: true,
  perIpLimit: 20,
  perUserLimit: 5,
  regenerate: 60 * 60 * 1000,
  expire: 2 * 60 * 60 * 1000,
});
