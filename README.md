# griller.dk 🌭

> **Hvornår griller Martin og Jesper igen?**

En lille, kærligt ment "driftsstatus"-side for to legender og en grill — halvt
downdetector, halvt sommer-hype-tracker. Lavet med AI som et hurtigt eksperiment,
inspireret af [Martin Thorborg & Jesper Buchs grill-opslag på LinkedIn][post].

Oprindeligt én selvstændig `index.html`; nu pakket ind i en lille **Next.js**-app,
så "Få besked"-formularen faktisk gemmer tilmeldinger og siden får simpel,
privatlivsvenlig besøgsstatistik. Selve chalkboard-markuppen er bevaret 1:1.

## Kør lokalt

```bash
npm install
npm run dev        # http://localhost:3000
```

Andre scripts: `npm run build` (standalone-produktionsbuild), `npm run start`,
`npm run lint`, `npm run typecheck`.

## Genbrug den næste gang I griller

Siden er evergreen — flip status, sæt en ny dato, ingen redigering nødvendig:

| Vil du… | Gør sådan |
| --- | --- |
| Sætte **næste grill** | `?next=2026-08-15T17:30` (browser-lokal tid) |
| Tvinge status **grøn** ("DE GRILLER NU") | `?live=1` |
| Tvinge status **rød** ("Ikke lige nu") | `?idle=1` |
| Skifte kridtteksten på fotoet | `?label=VI%20GRILLER` |

Eksempel: `/?next=2026-08-15T18:00&live=1`

Standardværdierne (`nextGrill`, `forceStatus`, `photoLabel`) ligger i `CONFIG`
øverst i `src/app/GrillClient.tsx`.

## Tilmeldinger & statistik

Alt lander på **agentics.dk** — der er ingen tredjeparts-tracker og ingen
cross-domain cookies. Browseren taler kun med griller.dk's egne routes:

- `POST /api/subscribe` — "Få besked"-tilmelding. Gemmes altid (brugerens eget
  ønske), både i den lokale backup og på agentics.dk-listen `griller`.
- `POST /api/track` — anonymt besøgstal. Kun efter samtykke (banner nederst);
  browseren får et lokalt `griller-vid` (ikke en server-cookie).

Begge routes videresender **server-til-server** til agentics.dk med en delt
bearer-nøgle, så klienten aldrig kender til agentics.dk. Er nøglen ikke sat,
no-op'er videresendelsen og data gemmes stadig lokalt i `USER_DATA_DIR`.

### Miljøvariabler

| Variabel | Standard | Beskrivelse |
| --- | --- | --- |
| `AGENTICS_INGEST_KEY` | (tom) | Delt bearer-nøgle mod agentics.dk. Tom ⇒ ingen videresendelse (kun lokal backup). |
| `AGENTICS_BASE_URL` | `https://agentics.dk` | agentics.dk base-URL. |
| `AGENTICS_SITE` | `griller.dk` | Site-tag på alle events/tilmeldinger. |
| `AGENTICS_LIST` | `griller` | Navnet på tilmeldingslisten på agentics.dk. |
| `USER_DATA_DIR` | `/app/data` | Lokal backup (JSONL) — Coolify-volume. |
| `NEXT_PUBLIC_SITE_URL` | `https://griller.dk` | Base-URL til metadata/OpenGraph. |

## Deploy (Coolify)

Repoet har en `Dockerfile` (multi-stage, Next.js standalone). Coolify bygger og
deployer automatisk ved næste commit. Persistent volume mountes på `/app/data`
til den lokale backup.

## Disclaimer

Uofficiel, kærligt ment fanside og et lille grin. Ikke tilknyttet, sponsoreret af
eller godkendt af Martin Thorborg, Jesper Buch eller nogen andre. Ingen pølser kom
til skade. 🌭 Lavet af Ember — feedback? `ember@agent.agentics.dk`.

[post]: https://www.linkedin.com/feed/update/urn:li:activity:7482080470562746368/
