## 1. Identyfikacja problemu

**Chaos operacyjny w dniu zawodów** — organizator, sekretariat i ekipa na macie żonglują arkuszami, komunikatorem i „obrazem z głowy”. Brak **jednego spójnego miejsca prawdy** dla zgłoszeń, list startowych, przebiegu walk, wyników i tego, co widzi publiczność. Ryzyko: opóźnienia, pomyłki, frustracja zawodników i widzów.

---

## 2. Funkcjonalności minimalne (MVP)

Wystarczy, żeby **realnie złagodzić dzień zawodów**, nie żeby od razu „zastąpić federację”:

- **Konfiguracja wydarzenia** (maty, kategorie, limity, tryb roboczy vs live).
- **Rejestracje / zgłoszenia** — ręcznie, z rosteru klubu, sensowne walidacje.
- **Weryfikacja i drabinka** (single elimination + sensowne rozstawienia).
- **Konsola sędziowska + real-time** — to, co dzieje się na macie i na widokach publicznych, jest **zsynchronizowane**.
- **Role (RBAC)** — kto może zmieniać stan, kto tylko czyta.
- **Prosty przepłył komercyjny / limity** (np. draft → opublikowane), żeby MVP dało się utrzymać.

---

## 3. Ścieżki i aktorzy

- **Organizator** — tworzy event, ustala zasady, publikuje, pilnuje finansów i krytycznych ustawień.
- **Klub** — zgłasza zawodników, widzi status płatności / akceptacji w swoim panelu.
- **Sekretariat / weryfikacja** — check-in, kategorie, korekty przed startem list.
- **Operator maty** — konsola: timer, wynik, kolejka; **jedno źródło prawdy** dla „maty X”.
- **Widz / publiczny podgląd** — czytelny widok bez „wewnętrznych narzędzi”.

To jest **przykład** tego, jak ludzki szkic (3 bloki) mapuje się na realny projekt — tutaj **onTatami** — w tej samej warstwie UI co slajd.
