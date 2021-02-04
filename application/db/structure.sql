CREATE TABLE "SystemUser" (
  "systemUserId" bigint generated always as identity,
  "login" varchar NOT NULL,
  "password" varchar NOT NULL,
  "fullName" varchar NULL
);

ALTER TABLE "SystemUser" ADD CONSTRAINT "pkSystemUser" PRIMARY KEY ("systemUserId");

CREATE TABLE "SystemGroup" (
  "systemGroupId" bigint generated always as identity,
  "name" varchar NOT NULL
);

ALTER TABLE "SystemGroup" ADD CONSTRAINT "pkSystemGroup" PRIMARY KEY ("systemGroupId");

CREATE TABLE "SystemGroupSystemUser" (
  "systemGroupId" bigint NOT NULL,
  "systemUserId" bigint NOT NULL
);

ALTER TABLE "SystemGroupSystemUser" ADD CONSTRAINT "pkSystemGroupSystemUser" PRIMARY KEY ("systemGroupId", "systemUserId");
ALTER TABLE "SystemGroupSystemUser" ADD CONSTRAINT "fkSystemGroupSystemUserSystemGroup" FOREIGN KEY ("systemGroupId") REFERENCES "SystemGroup" ("systemGroupId");
ALTER TABLE "SystemGroupSystemUser" ADD CONSTRAINT "fkSystemGroupSystemUserSystemUser" FOREIGN KEY ("systemUserId") REFERENCES "SystemUser" ("systemUserId");

CREATE TABLE "SystemSession" (
  "systemSessionId" bigint generated always as identity,
  "systemUserId" bigint NOT NULL,
  "token" varchar NOT NULL,
  "ip" varchar NOT NULL,
  "data" jsonb NOT NULL
);

ALTER TABLE "SystemSession" ADD CONSTRAINT "pkSystemSession" PRIMARY KEY ("systemSessionId");
ALTER TABLE "SystemSession" ADD CONSTRAINT "fkSystemSessionUser" FOREIGN KEY ("systemUserId") REFERENCES "SystemUser" ("systemUserId");

CREATE TABLE "Country" (
  "countryId" bigint generated always as identity,
  "name" varchar NOT NULL
);

ALTER TABLE "Country" ADD CONSTRAINT "pkCountry" PRIMARY KEY ("countryId");

CREATE UNIQUE INDEX "akCountry" ON "Country" ("name");

CREATE TABLE "City" (
  "cityId" bigint generated always as identity,
  "name" varchar NOT NULL,
  "countryId" bigint NOT NULL
);

ALTER TABLE "City" ADD CONSTRAINT "pkCity" PRIMARY KEY ("cityId");

CREATE UNIQUE INDEX "akCity" ON "City" ("name");

ALTER TABLE "City" ADD CONSTRAINT "fkCityCountryId" FOREIGN KEY ("countryId") REFERENCES "Country" ("countryId") ON DELETE CASCADE;
