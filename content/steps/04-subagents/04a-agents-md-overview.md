# Jak działa system agentów w onTatami

Ten model pracy jest opisany w `AGENTS.md` i opiera się na zasadzie:
**główny wątek = manager**, a wykonanie idzie przez wyspecjalizowanych agentów.

## Co jest kluczowe

- Manager najpierw planuje i deleguje, nie robi wszystkiego sam.
- Praca idzie iteracyjnie: architektura -> implementacja -> testy -> review.
- Każdy agent ma jasny zakres i granice odpowiedzialności.
- Trzymamy granice warstw (`apps/web`, `apps/api`, DB, realtime).
- Każde zadanie domykamy testami i synchronizacją dokumentów (`PLAN.md`, `RECENT_CHANGES.md`, `ai/CONTEXT.md`).

## Domyślny przepływ

1. `architect`
2. specjalista domenowy (`frontend-specialist` / `api-specialist` / `database-specialist` / `engineer`)
3. `test-specialist`
4. `reviewer`
