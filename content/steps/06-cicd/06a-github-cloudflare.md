# GitHub + Cloudflare

- **Repo** na GitHubie jako source of truth.
- **Cloudflare Pages** (frontend) i/lub **Workers** (API) podpięte pod pipeline z GitHub Actions lub natywne integracje CF.
- **Preview deployments** z PR — szybka pętla feedbacku („czy to w ogóle działa na edge?”).

## Dla solo-deva

To jest Twój **„release train”**: jeśli main jest zielony i artefakt się buduje, masz psychologiczne pozwolenie na merge.
