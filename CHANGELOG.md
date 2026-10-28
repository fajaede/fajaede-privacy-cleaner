# Changelog

## 1.1.0

### Opgelost
- Toestemming (`browsingData`) wordt nu gevraagd vanuit de popup. Daardoor werken "Nu Opschonen" en automatisch opschonen.
- De whitelist bewaart nu echt de cookies en site-opslag van whitelist-sites (via `excludeOrigins`).
- "Nu Opschonen" toont het echte resultaat in plaats van altijd "voltooid".
- Het vinkje "Slimme Features" doet nu iets: het verbergt de tips en zet de analyseknop uit.
- De tips gebruiken echte gegevens in plaats van willekeurige getallen.
- "Bij browser sluiten" schoont nu op bij de volgende start.

### Nieuw
- Schema's: elk uur, elke 6 uur, elke week.
- Tijdsperiode: afgelopen uur, 24 uur, week of alles.
- Gegevenstypes: downloadgeschiedenis, formuliergegevens, lokale site-opslag (localStorage en IndexedDB).
- Datum van de laatste opschoning en een teller in de popup.
- Bevestiging voordat wachtwoorden verwijderd worden.
- Whitelist-invoer wordt opgeschoond (`https://www.bank.nl/login` wordt `bank.nl`).
- Melding na een update.

### Permissies
- Weg: toegang tot alle websites (`host_permissions`) en `tabs`.
- Erbij: `activeTab`. Die geeft geen installatiemelding.

## 1.0
- Eerste release.
