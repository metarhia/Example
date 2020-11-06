async () => {
  const fields = ['Id', 'Name'];
  const data = await domain.db.select('Country', fields);
  return { result: 'success', data };
};
