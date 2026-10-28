📁 FAJAEDE PRIVACY-CLEANER  (versie 1.1.0)
==========================================

🔒 Fajaede Smart Browser Cleaner - Automatische en slimme browser opschoning

🌟 FAJAEDE UNIEKE FEATURES:
- Fajaede Rule-based Intelligence voor slimme whitelist suggesties
- Fajaede automatische website analyse
- Fajaede slimme cleanup tips en advies, gebaseerd op je echte gebruik
- Fajaede professionele branding en design
- Volledig lokaal - geen data naar externe servers

🌟 FUNCTIES:
- Automatisch opschonen op schema: elk uur, elke 6 uur, elke 24 uur, elke week,
  bij browser start of bij de volgende start na het sluiten
- Kies de tijdsperiode: afgelopen uur, 24 uur, week of alles
- Kies welke gegevens: cache, cookies, browsegeschiedenis, downloadgeschiedenis,
  formuliergegevens, lokale site-opslag en opgeslagen wachtwoorden
- Fajaede slimme whitelist: cookies en site-opslag van belangrijke websites blijven bewaard
- Overzicht van de laatste opschoning en het totaal aantal opschoningen
- Lichtgewicht en privacy-vriendelijk

🚀 INSTALLATIE:

📥 Gebruikers: zoek "Fajaede Privacy-Cleaner" in de Chrome Web Store
   en klik "Toevoegen aan Chrome".

🔧 Developers: source code op GitHub
   https://github.com/fajaede/fajaede-privacy-cleaner
1. Download of clone de repository naar een map "fajaede-privacy-cleaner"
2. Open Chrome en ga naar: chrome://extensions/
3. Zet "Developer mode" aan (rechtsboven)
4. Klik "Load unpacked" en selecteer de map
5. Fajaede extensie is geïnstalleerd!

⚙️ GEBRUIK:
1. Klik op het Fajaede icoon in Chrome
   (niet zichtbaar? Klik op het puzzelstukje 🧩 en zet een speld bij Fajaede)
2. Kies een schema, een tijdsperiode en de gegevens die je wilt verwijderen
3. Vul de whitelist aan, of gebruik "Fajaede Analyseer Huidige Website" voor slimme suggesties
4. Klik "Opslaan - Fajaede Instellingen"
5. Gebruik "Fajaede Nu Opschonen" voor directe cleanup

🔐 TOESTEMMING GEVEN (eenmalig):
- Klik in de popup op "Fajaede Nu Opschonen" of sla een schema op (niet "Uit")
- Chrome vraagt: "Browsegegevens wissen" → klik "Toestaan"
- Daarna werken opschonen en het automatische schema zonder nieuwe vraag
- Per ongeluk geweigerd? Klik nogmaals op "Nu Opschonen", Chrome vraagt het opnieuw

🆕 WAT IS NIEUW IN 1.1.0:
- Whitelist werkt nu echt: cookies en site-opslag van whitelist-sites blijven bewaard
- Toestemming wordt netjes gevraagd bij "Nu Opschonen" of bij het opslaan van een schema
- Nieuwe schema's: elk uur, elke 6 uur, elke week
- Nieuwe tijdsperiode: afgelopen uur / 24 uur / week / alles
- Nieuwe gegevenstypes: downloadgeschiedenis, formuliergegevens, lokale site-opslag
- "Laatste opschoning" en teller in de popup
- Tips gebaseerd op echte gegevens (geen schattingen meer)
- Bevestiging voordat wachtwoorden verwijderd worden
- "Bij browser sluiten" schoont op bij de volgende start (Chrome staat opschonen tijdens afsluiten niet toe)
- Minder permissies: geen toegang tot alle websites meer nodig
- Je bestaande instellingen blijven bij de update gewoon bewaard
Zie CHANGELOG.md voor alle details.

🔧 BESTANDEN:
- manifest.json          → Fajaede extensie configuratie
- fajaede-popup.html     → Fajaede professionele interface
- popup.js               → Fajaede interface functionaliteit
- fajaede-background.js  → Fajaede automatische cleanup logica
- icons/                 → Fajaede iconen (16, 48, 128 px)
- build-zip.ps1          → Maakt de zip voor de Chrome Web Store
- CHANGELOG.md           → Overzicht van alle versies
- PRIVACY.md             → Fajaede privacybeleid
- MITlicense / LICENSE   → MIT licentie

📦 NIEUWE VERSIE PUBLICEREN (developers):
1. Verhoog "version" in manifest.json en package.json
2. Voer uit: powershell -ExecutionPolicy Bypass -File build-zip.ps1
3. Chrome Web Store Developer Dashboard → Package → "Upload new package"
4. Werk het Privacy-tabblad bij als de permissies veranderd zijn
5. Klik "Submit for review"

🛡️ PERMISSIES:
- browsingData → Voor Fajaede opschonen gegevens (gevraagd bij eerste gebruik)
- storage → Voor opslaan Fajaede instellingen
- alarms → Voor Fajaede automatische schema's
- notifications → Voor Fajaede bevestigingsmeldingen
- activeTab → Voor Fajaede website analyse (alleen het actieve tabblad, alleen na klik)

📝 FAJAEDE OPMERKINGEN:
- Whitelist: één domein per regel, bijv. "bank.nl"
  (http://, https://, www. en paden worden automatisch weggehaald)
- Opgeslagen wachtwoorden verwijderen kan niet ongedaan worden gemaakt
- Geen AI - Fajaede gebruikt slimme rule-based logic
- Geen internetverbinding nodig voor werking
- Volledig lokaal en privacy-vriendelijk - zie PRIVACY.md

🎨 FAJAEDE DESIGN:
- Professioneel gradient design
- Fajaede branding doorheen de hele applicatie
- Gebruikersvriendelijke interface
- Responsive en modern design

🌐 ONDERSTEUNDE BROWSERS (Chromium):
- ✅ Google Chrome 88+
- ✅ Microsoft Edge 88+
- ✅ Opera 75+
- ✅ Brave 1.3+
- ✅ Vivaldi 3.0+

📄 LICENTIE: MIT - zie LICENSE
🐞 Problemen of ideeën: https://github.com/fajaede/fajaede-privacy-cleaner/issues

Veel plezier met Fajaede Privacy-Cleaner! 🔒
