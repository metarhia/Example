async () => {
    const isTimerExists = lib.example.storage.set({ key: 'subscribeTimer' });
    if (isTimerExists) { clearInterval(isTimerExists); }
    lib.example.storage.set({ del: 'subscribeTimer' });
    return { unsubscribed: 'resmon' };
};
