# griller.dk 🌭

> **Hvornår griller Martin og Jesper igen?**

En lille, kærligt ment "driftsstatus"-side for to legender og en grill — halvt
downdetector, halvt sommer-hype-tracker. Lavet med AI som et hurtigt eksperiment,
inspireret af [Martin Thorborg & Jesper Buchs grill-opslag på LinkedIn][post].

Det hele er **én selvstændig `index.html`** — ingen build, ingen CDN, ingen
netværkskald, billedet er inline. Åbn filen i en browser, eller host den hvor som
helst (fx GitHub Pages).

## Genbrug den næste gang I griller

Siden er evergreen — flip status, sæt en ny dato, ingen backend nødvendig:

| Vil du… | Gør sådan |
| --- | --- |
| Sætte **næste grill** | `?next=2026-08-15T17:30` (browser-lokal tid) |
| Tvinge status **grøn** ("DE GRILLER NU") | `?live=1` |
| Tvinge status **rød** ("Ikke lige nu") | `?idle=1` |
| Skifte kridtteksten på fotoet | `?label=VI%20GRILLER` |

Eksempel: `index.html?next=2026-08-15T18:00&live=1`

Vil du ændre standardværdierne permanent, så rediger `CONFIG`-blokken øverst i
`<script>` i `index.html` (`nextGrill`, `forceStatus`, `photoLabel`).

## Disclaimer

Uofficiel, kærligt ment fanside og et lille grin. Ikke tilknyttet, sponsoreret af
eller godkendt af Martin Thorborg, Jesper Buch eller nogen andre. Ingen pølser kom
til skade. 🌭

[post]: https://www.linkedin.com/feed/update/urn:li:activity:7482080470562746368/
