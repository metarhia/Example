({
  Registry: { realm: 'application', storage: 'append' },
  direction: { type: 'string' }, // 'incoming' or 'outgoing'
  from: { type: 'string' },
  to: { type: 'string' },
  subject: { type: 'string' },
  body: 'string',
  created: { type: 'DateTime', default: () => new Date() },
  status: { type: 'string', default: 'queued' }, // or 'sent', 'failed'
});
