async () => {
  if (!config.examples.bus) return;
  if (application.worker.id !== 'W1') return;
  try {
    const time = await bus.worldTime.currentTime({
      area: 'Europe',
      location: 'Rome',
    });
    console.log(`${time.timezone} - ${time.datetime}`);
  } catch {
    console.log('Can not access time server');
  }
};
