psql -f install.sql -U postgres
PGPASSWORD=marcus psql -d application -f structure.sql -U marcus
PGPASSWORD=marcus psql -d application -f data.sql -U marcus
