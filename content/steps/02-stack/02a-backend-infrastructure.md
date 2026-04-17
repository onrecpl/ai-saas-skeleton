---
title: Infrastruktura — Cloudflare (propozycja)
---

# Dlaczego Cloudflare na start

**Propozycja:** całość "edge'owa" na **Cloudflare** — od hostingu po magazyn plików. **Największa zaleta:** **hostujesz dużą część stacku w modelu darmowym lub bardzo tanim**, a na MVP dostajesz **podstawowe observability**, które zwykle **wystarczają**.

## Rdzeń platformy

<div class="cf-infra-grid" aria-label="Komponenty infrastruktury Cloudflare">
  <article class="cf-infra-card">
    <div class="cf-infra-card__icon" aria-hidden="true">
      <svg class="cf-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
    </div>
    <div class="cf-infra-card__body">
      <h3 class="cf-infra-card__title">Cloudflare Workers</h3>
      <p class="cf-infra-card__text"><strong>Runtime</strong> — serverless na edge, bez serwerów do pilnowania.</p>
    </div>
  </article>
  <article class="cf-infra-card">
    <div class="cf-infra-card__icon" aria-hidden="true">
      <svg class="cf-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v6c0 1.7 4 3 9 3s9-1.3 9-3V5"/><path d="M3 11v6c0 1.7 4 3 9 3s9-1.3 9-3v-6"/></svg>
    </div>
    <div class="cf-infra-card__body">
      <h3 class="cf-infra-card__title">D1</h3>
      <p class="cf-infra-card__text"><strong>Baza główna</strong> — SQLite zarządzany, migracje, spięcie z Workerami. W razie potrzeby ścieżka na **Postgres** (np. Supabase, Cloud SQL) przez migrację / <strong>Hyperdrive</strong> — bez rewrite'u całej aplikacji "od zera".</p>
    </div>
  </article>
  <article class="cf-infra-card">
    <div class="cf-infra-card__icon" aria-hidden="true">
      <svg class="cf-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.27 6.96L12 12.01l8.73-5.05"/><path d="M12 22.08V12"/></svg>
    </div>
    <div class="cf-infra-card__body">
      <h3 class="cf-infra-card__title">R2</h3>
      <p class="cf-infra-card__text"><strong>Storage plików</strong> — obiekty w tym samym ekosystemie co reszta stacku.</p>
    </div>
  </article>
</div>

## Observability

<div class="cf-infra-grid" aria-label="Observability">
  <article class="cf-infra-card cf-infra-card--soft">
    <div class="cf-infra-card__icon cf-infra-card__icon--sm" aria-hidden="true">
      <svg class="cf-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
    </div>
    <div class="cf-infra-card__body">
      <h3 class="cf-infra-card__title">CF — metryki i logi</h3>
      <p class="cf-infra-card__text"><strong>Podstawowe observability</strong> na MVP — bez pełnego APM od pierwszego dnia.</p>
    </div>
  </article>
  <article class="cf-infra-card cf-infra-card--soft cf-infra-card--exploring" aria-label="Opcja w rozważaniu">
    <div class="cf-infra-card__icon cf-infra-card__icon--sm" aria-hidden="true">
      <svg class="cf-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
    </div>
    <div class="cf-infra-card__body">
      <h3 class="cf-infra-card__title">Grafana stack <span class="cf-infra-card__badge">opcja</span></h3>
      <p class="cf-infra-card__text"><strong>Dashboardy + logi/metryki</strong> (np. Loki, Prometheus/Mimir — zależnie od stacku). Rozważam i będę <strong>testował</strong> obok domyślnego observability z CF.</p>
    </div>
  </article>
</div>

## AI

<div class="cf-infra-grid" aria-label="AI i LLM">
  <article class="cf-infra-card cf-infra-card--soft">
    <div class="cf-infra-card__icon cf-infra-card__icon--sm" aria-hidden="true">
      <svg class="cf-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="6" cy="12" r="3"/><circle cx="18" cy="12" r="3"/><path d="M9 12h6"/><path d="M15 9l3 3-3 3"/></svg>
    </div>
    <div class="cf-infra-card__body">
      <h3 class="cf-infra-card__title">OpenRouter</h3>
      <p class="cf-infra-card__text"><strong>Jeden punkt wejścia</strong> do wielu modeli. Ewentualnie zamiast lub obok: <strong>AI Gateway</strong> (Cloudflare) — też usługa proxy pod LLM.</p>
    </div>
  </article>
  <article class="cf-infra-card cf-infra-card--soft">
    <div class="cf-infra-card__icon cf-infra-card__icon--sm" aria-hidden="true">
      <svg class="cf-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
    </div>
    <div class="cf-infra-card__body">
      <h3 class="cf-infra-card__title">Langfuse</h3>
      <p class="cf-infra-card__text"><strong>Rekomendacja pod LLM</strong> — ślady, koszty, eksperymenty; <strong>free tier</strong> zwykle na MVP wystarczy.</p>
    </div>
  </article>
</div>

## Autoryzacja i płatności

<div class="cf-infra-grid" aria-label="Autoryzacja i płatności">
  <article class="cf-infra-card cf-infra-card--soft">
    <div class="cf-infra-card__icon cf-infra-card__icon--sm" aria-hidden="true">
      <svg class="cf-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 4v5c0 4.8-2.9 7.8-7 9-4.1-1.2-7-4.2-7-9V7l7-4z"/><path d="M9.5 12l1.7 1.7L14.8 10"/></svg>
    </div>
    <div class="cf-infra-card__body">
      <h3 class="cf-infra-card__title">Clerk</h3>
      <p class="cf-infra-card__text"><strong>Auth + Organizations + RBAC</strong> — gotowe logowanie, role i kontrola dostępu bez budowania auth od zera.</p>
    </div>
  </article>
  <article class="cf-infra-card cf-infra-card--soft">
    <div class="cf-infra-card__icon cf-infra-card__icon--sm" aria-hidden="true">
      <svg class="cf-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="5" width="19" height="14" rx="2.2"/><path d="M2.5 10.2h19"/><path d="M7.5 14.2h3.5"/></svg>
    </div>
    <div class="cf-infra-card__body">
      <h3 class="cf-infra-card__title">Creem</h3>
      <p class="cf-infra-card__text"><strong>Merchant of Record</strong> — płatności globalne, podatki i compliance po stronie platformy. Dzięki temu nie dotykam rozliczeń operacyjnie.</p>
    </div>
  </article>
</div>

## Podsumowanie

**Workers + D1 + R2** w jednym ekosystemie; **Hyperdrive** tylko wtedy, gdy realnie potrzebujesz **Postgres** obok (lub zamiast) D1.
