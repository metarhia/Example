async ({ countryId }) => {
  const fields = ['cityId', 'name'];
  const where = { countryId };
  const data = await domain.db.select('City', fields, where);
  return { result: 'success', data };
};
