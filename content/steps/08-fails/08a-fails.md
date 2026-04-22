# Faile, które mnie nauczyły najwięcej

<div class="fails-grid" aria-label="Lista faili projektu">
  <article class="fail-card">
    <h3 class="fail-card__title">Antigravity i liczenie tokenów</h3>
    <p class="fail-card__text">Za dużo wiary, że "samo się policzy". Efekt: złe estymacje kosztu i zbyt późna reakcja.</p>
  </article>

  <article class="fail-card">
    <h3 class="fail-card__title">Claude + OpenRouter + modele spoza Anthropic</h3>
    <p class="fail-card__text">Mieszanie providerów i modeli bez twardych zasad zrobiło niespójne wyniki i trudniejszy debugging.</p>
  </article>

  <article class="fail-card">
    <h3 class="fail-card__title">Jeden wielki `http.api`</h3>
    <p class="fail-card__text">Przeładowanie kontekstu i nieustające konflikty. Duży plik zabija równoległą pracę agentów.</p>
  </article>

  <article class="fail-card">
    <h3 class="fail-card__title">Cursor nie odpala subagentów mimo definicji w `AGENTS.md`</h3>
    <p class="fail-card__text">Sama definicja agentów nie gwarantuje działania orkiestracji. Trzeba testować realny execution path, a nie tylko konfigurację.</p>
  </article>

  <article class="fail-card">
    <h3 class="fail-card__title">UX nieprzygotowany na starcie</h3>
    <p class="fail-card__text">Nie zaplanowałem UX wcześniej i do dziś spłacam ten dług: bałagan z początku wraca w kolejnych iteracjach.</p>
  </article>

  <article class="fail-card fail-card--positive">
    <h3 class="fail-card__title">Testów sam nie weryfikowałem</h3>
    <p class="fail-card__text">Nigdy tam realnie nie zajrzałem, ale wielokrotnie to właśnie testy powstrzymały release i uratowały mnie przed produkcyjną wtopą.</p>
  </article>

  <article class="fail-card">
    <h3 class="fail-card__title">Drag &amp; drop wygenerował tysiące requestów</h3>
    <p class="fail-card__text">Przy implementacji drag and drop ruch API wystrzelił i szybko wysycił plan darmowy na Workers. Wniosek: throttling/batching i limity trzeba projektować od razu.</p>
  </article>

</div>
