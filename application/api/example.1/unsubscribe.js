async () => {
    const isTimerExists = lib.example.timersStore({ key: 'subscribeTimer' });
    if (isTimerExists) { clearInterval(isTimerExists); }

    lib.example.timersStore({ del: 'subscribeTimer' });
    
    return { unsubscribed: 'resmon' };
};
