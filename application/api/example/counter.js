async () => {
  const { session = { counter: 0 } } = context;
  session.counter++;
  return { result: session.counter };
};
