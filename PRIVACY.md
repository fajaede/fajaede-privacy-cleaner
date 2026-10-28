# Privacybeleid – Fajaede Privacy-Cleaner

_Laatst bijgewerkt: 28 oktober 2026_

Fajaede Privacy-Cleaner verzamelt, bewaart en verstuurt **geen** persoonlijke gegevens.

- **Geen dataverzameling:** de extensie stuurt niets naar Fajaede of naar derden. Er zijn geen analytics, tracking of externe servers.
- **Lokale instellingen:** je instellingen (schema, gekozen gegevenstypes en whitelist) staan in `chrome.storage.sync`. Chrome synchroniseert die alleen met je eigen Google-account, als synchronisatie aanstaat. De datum en het aantal opschoningen staan alleen lokaal (`chrome.storage.local`).
- **Website-analyse:** na een klik op "Analyseer Huidige Website" bekijkt de extensie alleen de domeinnaam en titel van het actieve tabblad, lokaal, met vaste regels. Er wordt niets opgeslagen tenzij je het domein zelf aan de whitelist toevoegt.
- **Opschonen:** de extensie verwijdert alleen de browsergegevens die jij selecteert, via de Chrome `browsingData`-API.

## Permissies
| Permissie | Waarvoor |
|---|---|
| browsingData | Het verwijderen van de geselecteerde browsergegevens |
| storage | Het opslaan van je instellingen |
| alarms | Het automatische schema |
| notifications | Een melding na het opschonen |
| activeTab | Het analyseren van de huidige website na een klik |

## Contact
Vragen of problemen: https://github.com/fajaede/fajaede-privacy-cleaner/issues
