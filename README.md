# Biletomaniacy - server

## Wymagania

* PostgreSQL 14.5
* Node.js 19.0

## Uruchomienie

1. Przekopiować `env.json.template` do `env.json` i ustawić klucz na losowo wygenerowany ciąg znaków.
2. Utworzyć bazę danych z `model.sql` (lub z `model.dbm` za pomocą pgModelera).
2. `npm run build`
2. `npm run start`
