#!/bin/bash

set -e

if [[ $DB == 'mariadb' ]]; then
    mysql -u root -ptravis -e 'create database test_frappe'
    mysql -u root -ptravis -e "USE mysql; CREATE USER 'test_frappe'@'localhost' IDENTIFIED BY 'test_frappe'; FLUSH PRIVILEGES; "
    mysql -u root -ptravis -e "USE mysql; GRANT ALL PRIVILEGES ON \`test_frappe\`.* TO 'test_frappe'@'localhost';"
    bench --site test_site reinstall --yes
    bench --site test_site setup-help
    bench setup-global-help --root_password travis
    bench --site test_site scheduler disable
    bench --site test_site run-tests --coverage
elif [[ $DB == 'postgres' ]]; then
    psql -c "CREATE DATABASE test_frappe;" -U postgres
    psql -c "CREATE USER test_frappe WITH PASSWORD 'test_frappe';" -U postgres
    bench --site test_site_postgres reinstall --yes
    bench --site test_site_postgres setup-help
    bench setup-global-help --db_type=postgres --root_password travis
    bench --site test_site_postgres scheduler disable
    bench --site test_site_postgres run-tests --coverage
fi
