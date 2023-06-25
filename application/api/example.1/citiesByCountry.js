async ({ countryId }) => {
  const { ExampleError } = api.example.error;
  if (!countryId) return ExampleError.MISSING_COUNTRY_ID();
  const fields = ['cityId', 'name'];
  const where = { countryId };
  const data = await db.pg.select('City', fields, where);
  return { result: 'success', data };
};
