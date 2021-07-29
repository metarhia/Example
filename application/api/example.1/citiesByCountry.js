async ({ countryId }) => {
  const fields = ['cityId', 'name'];
  const where = { countryId };
  const data = await db.pg.select('City', fields, where);
  return { result: 'success', data };
};
