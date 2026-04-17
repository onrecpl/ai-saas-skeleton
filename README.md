# ai-saas-skeleton

## Cloudflare Pages

Projekt ma konfigurację pod Cloudflare Pages przez `wrangler.toml`.

### Lokalne uruchomienie z Wrangler

```bash
npm install
npm run build
npm run pages:dev
```

### Deploy przez CLI

```bash
npm run pages:deploy -- --project-name ai-saas-skeleton
```

Jeśli projekt Pages nie istnieje jeszcze w Twoim koncie, utwórz go raz:

```bash
wrangler pages project create ai-saas-skeleton
```

### Deploy przez podpięcie repo w Cloudflare

W Cloudflare Pages podczas podpinania tego repo ustaw:

- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `/` (domyślnie)

### Proponowana subdomena

Wybrana: `ai.lemieszko.pl`

Dodaj domenę niestandardową do projektu Pages:

```bash
npx --yes wrangler pages domain add ai.lemieszko.pl --project-name ai-saas-skeleton
```

Alternatywnie możesz dodać ją z panelu Cloudflare: Pages -> Custom domains.
