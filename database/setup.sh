psql -f ./seeds/001-install.sql -U postgres
PGPASSWORD=marcus psql -d application -f ./seeds/002-structure.sql -U marcus
PGPASSWORD=marcus psql -d application -f ./seeds/003-data.sql -U marcus
