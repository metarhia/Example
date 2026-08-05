async ({ delay }) => {
  await new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
  return 'done';
};
