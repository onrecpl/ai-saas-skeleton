# Dependabot + Socket (security)

- **Dependabot** — rutynowe PR-y z aktualizacjami zależności; mniejsza powierzchnia „zapomnianych” CVE.
- **Socket** — analiza ryzyk w package ecosystem (np. podejrzane skrypty post-install, supply-chain surprises).

## Co jeszcze robi `security.yml`

- Odpala się na: **PR**, **push do `main`**, **schedule** (co tydzień), oraz ręcznie (`workflow_dispatch`).
- **Gitleaks**: skan sekretów w working tree (`--no-git`, redakcja wrażliwych fragmentów).
- **Trivy**:
  - na PR: szybki skan `apps/` pod **misconfig** (HIGH/CRITICAL),
  - poza PR: pełny skan repo (`vuln + misconfig + secret`).
- **Dependencies (`npm audit`)** dla `apps/web` i `apps/api`:
  - na PR pomijane (żeby nie dublować sygnału z Socket),
  - na `main/schedule`: `npm audit --audit-level=high`.
- **OSSF Scorecard** na harmonogramie/manualu (publikacja SARIF do security tab) — w praktyce to lekki, automatyczny zamiennik pod „enterprise audit mindset” (np. SOCA), bo pełnego audytu solowo raczej nie dowieziemy.

## Czemu to ważne w fabryce

Ty nie skanujesz każdego `node_modules` ręcznie. **Automatyzujesz ostrzeżenia**, a potem **decyzje** podejmujesz świadomie.
