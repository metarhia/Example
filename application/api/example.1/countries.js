async () => {
  const fields = ['countryId', 'name'];
  const data = await domain.db.select('Country', fields);
  return { result: 'success', data };
};
