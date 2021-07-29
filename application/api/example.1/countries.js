async () => {
  const fields = ['countryId', 'name'];
  const data = await db.pg.select('Country', fields);
  return { result: 'success', data };
};
