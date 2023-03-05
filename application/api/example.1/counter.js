async () => {
  if (!context.session.counter) context.session.counter = 1;
  else context.session.counter++;
  return { result: context.session.counter };
};
