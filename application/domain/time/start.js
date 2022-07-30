async () => {
  if (application.worker.id === 'W1') {
    setTimeout(async () => {
      const time = await bus.worldTime.currentTime({
        area: 'Europe',
        location: 'Kiev',
      });
      console.log(`${time.timezone} - ${time.datetime}`);
    }, 1000);
  }
};
