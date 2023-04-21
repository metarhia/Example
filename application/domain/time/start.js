async () => {
  if (application.worker.id === 'W1') {
    setTimeout(() => {
      bus.worldTime
        .currentTime({
          area: 'Europe',
          location: 'Kiev',
        })
        .then((time) => {
          console.log(`${time.timezone} - ${time.datetime}`);
        })
        .catch(() => {
          console.log('Can not access time server');
        });
    }, 1000);
  }
};
