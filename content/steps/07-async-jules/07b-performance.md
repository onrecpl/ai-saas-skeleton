# Jules — sugestie performance

Asynchroniczny agent potrafi zaproponować **profilowanie** i checklistę: bundle size, waterfall zasobów, cache headers, niepotrzebne refetch-e, kosztowne rendery.

## Co jest wartościowe

- Lista **„sprawdź najpierw”** — zamiast ogólnego „zoptymalizuj aplikację”.
- Powiązanie z **metrykami** (np. LCP, TBT), jeśli podasz mu kontekst stacku.

## Uczciwie

Część sugestii będzie **generyczna**. Odrzucasz, gdy nie pasuje do realnego profilu ruchu (SSR vs SPA, edge vs origin).
