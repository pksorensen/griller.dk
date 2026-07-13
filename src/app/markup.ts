// The griller.dk page body, kept as a raw HTML fragment so the hand-tuned
// chalkboard markup + inline SVG stay byte-identical to the original,
// verified single-file page. Behaviour (countdown, gauge, status, form,
// tracking) is attached by GrillClient against these stable element IDs.
export const BODY_HTML = `<div class="board-edge" aria-hidden="true"></div>

<!-- ============================= AI-DISCLAIMER BANNER ============================= -->
<div class="ai-banner" role="note">
  <div class="wrap">
    <span class="tag">🤖 AI-eksperiment</span>
    <span class="txt">Denne side er lavet med AI som et lille, kærligt ment eksperiment — inspireret af Martin&nbsp;&amp;&nbsp;Jespers grill-opslag på LinkedIn. Helt uofficiel og bare for sjov. 🌭</span>
    <a href="https://www.linkedin.com/feed/update/urn:li:activity:7482080470562746368/" target="_blank" rel="noopener">Se opslaget&nbsp;↗</a>
  </div>
</div>

<!-- ============================= HERO ============================= -->
<header class="hero">
  <div class="wrap">
    <span class="eyebrow chalk">griller.dk · uofficiel driftsstatus</span>

    <div class="hero-grid">
      <div class="hero-text">
        <h1 class="headline">Hvornår griller <span class="em">Martin</span> og <span class="em">Jesper</span> igen?</h1>
        <svg class="headline-underline draw" viewBox="0 0 360 22" fill="none" aria-hidden="true">
          <path style="--len:380" d="M4 14 C 70 6, 150 20, 220 11 S 330 6, 356 13" stroke="#ffd15c" stroke-width="4" stroke-linecap="round"/>
        </svg>

        <div class="status" id="statusRoot" aria-live="polite">
          <p class="status-line">
            <span class="status-dot pulse" id="statusDot" aria-hidden="true"></span><span id="statusText">Ikke lige nu.</span>
          </p>
          <p class="status-sub chalk" id="statusSub">Men solen er på vej — og pølserne står på planen.</p>
        </div>

        <div class="countdown" id="countdown">
          <span class="cd-label" id="cdLabel">Næste grill om</span>
          <span class="cd-digits" id="cdDigits">– – –</span>
        </div>
      </div>

      <div class="photo-col">
        <div class="arrow-note draw" aria-hidden="true">
          det er dem
          <svg viewBox="0 0 60 46" fill="none">
            <path class="d2" style="--len:80" d="M30 4 C 24 16, 36 24, 30 40" stroke="#ffd15c" stroke-width="3" stroke-linecap="round"/>
            <path class="d3" style="--len:44" d="M30 40 L 22 32 M30 40 L 38 32" stroke="#ffd15c" stroke-width="3" stroke-linecap="round"/>
          </svg>
        </div>

        <figure class="polaroid">
          <div class="polaroid-inner">
            <span class="rec"><span class="rec-dot"></span>REC</span>
            <img src="/hero.jpg" width="1152" height="1536"
                 alt="Martin Thorborg og Jesper Buch står bag en grillbod på havnen i Gudhjem en solrig sommerdag. Martin har stribet forklæde og kasket på, Jesper har hvid t-shirt, hvid kasket og solbriller på og holder en pølse i grilltangen.">
            <span class="photo-chalk chalk" id="photoChalk" aria-hidden="true">VI GRILLER</span>
          </div>
          <figcaption class="polaroid-cap chalk">
            Live-bevis · seneste observation
            <span class="ts mono" id="photoTs">— · —</span>
          </figcaption>
        </figure>
      </div>
    </div>
  </div>
</header>

<main>
<!-- ================== GRILLSANDSYNLIGHEDSMÅLER ================== -->
<section>
  <div class="wrap">
    <p class="kicker">Driftsmåling</p>
    <h2 class="sec-title">Grillsandsynlighedsmåler</h2>
    <div class="card" style="margin-top:18px">
      <div class="meter-wrap">
        <div class="gauge">
          <svg viewBox="0 0 220 130" role="img" aria-label="Grillsandsynlighed: 92 procent">
            <!-- track -->
            <path d="M18 118 A 92 92 0 0 1 202 118" fill="none" stroke="rgba(244,239,225,.16)" stroke-width="14" stroke-linecap="round"/>
            <!-- colored arc -->
            <path d="M18 118 A 92 92 0 0 1 202 118" fill="none" stroke="url(#g)" stroke-width="14" stroke-linecap="round" stroke-dasharray="289" stroke-dashoffset="23"/>
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stop-color="#e0533f"/>
                <stop offset="0.5" stop-color="#f2b544"/>
                <stop offset="1" stop-color="#46c37b"/>
              </linearGradient>
            </defs>
            <!-- ticks -->
            <g stroke="rgba(244,239,225,.35)" stroke-width="2">
              <line x1="18" y1="118" x2="30" y2="112"/>
              <line x1="110" y1="26" x2="110" y2="40"/>
              <line x1="202" y1="118" x2="190" y2="112"/>
            </g>
            <!-- needle -->
            <g class="needle" id="needle">
              <line x1="110" y1="118" x2="110" y2="40" stroke="#f4efe1" stroke-width="4" stroke-linecap="round"/>
              <circle cx="110" cy="118" r="8" fill="#f4efe1"/>
              <circle cx="110" cy="118" r="3" fill="#20241d"/>
            </g>
          </svg>
          <div class="gauge-read chalk" id="gaugeRead">92 %</div>
          <div class="gauge-label chalk">sandsynlighed for grill</div>
          <ul class="meter-inputs">
            <li>☀ Sol: høj</li>
            <li>😄 Humør: stigende</li>
            <li>🍺 Øl-niveau: stabilt</li>
          </ul>
        </div>
        <div>
          <p class="facts line" style="max-width:38ch">Måleren vejer de tre faktorer, der faktisk afgør aftenen: solen, humøret og øl-niveauet. Alt andet er støj.</p>
          <p class="aside-chalk">Endelig en burn rate, alle kan forstå.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ================== NÆSTE GRILL (facts) ================== -->
<section>
  <div class="wrap">
    <p class="kicker">Planlagt driftsvindue</p>
    <h2 class="sec-title">Næste grill</h2>
    <div class="card" style="margin-top:18px">
      <div class="facts">
        <span class="big">Havnen i Gudhjem</span>
        <span class="line">Fra kl. 17.30 · Klippen Hotel, Skt. Jørgens Gaard.</span>
        <span class="line" id="factsDate">—</span>
      </div>
      <a class="chalk-btn" id="calBtn" download="grill-i-gudhjem.ics" href="#">[ Sæt kryds i kalenderen ]</a>
      <p class="cal-note chalk" id="calNote">Kryds sat ✔ — vi ses ved røgen.</p>
    </div>
  </div>
</section>

<!-- ================== GRILLMESTRENE ================== -->
<section>
  <div class="wrap">
    <p class="kicker">Bemanding</p>
    <h2 class="sec-title">Grillmestrene</h2>
    <div class="card" style="margin-top:18px">
      <div class="bios">
        <div class="bio">
          <span class="role">Station 1 · Venstre for grillen</span>
          <h3>Martin</h3>
          <p>Grillmester &amp; selvudnævnt verdensmester i ikke at stå stille. Byggede Amino og Dinero — kan holde et helt foredrag om stegeskorpen, før kullene overhovedet er varme.</p>
        </div>
        <div class="bio">
          <span class="role">Station 2 · Højre for grillen</span>
          <h3>Jesper</h3>
          <p>Grillmester &amp; løve. Byggede Just Eat, så du kunne blive i sofaen — i aften må du selv rejse dig. Beholder solbrillerne på, også i skyggen.</p>
        </div>
      </div>
      <p class="photo-caption chalk">To iværksættere. Én pølsevogn. Nul exitstrategi.</p>
    </div>
  </div>
</section>

<!-- ================== MENUEN ================== -->
<section>
  <div class="wrap">
    <p class="kicker">Kort, men ærligt</p>
    <h2 class="sec-title">Menuen</h2>
    <div class="card" style="margin-top:18px">
      <div class="menu">
        <div class="menu-item"><span class="name">Pølse (klassisk)</span><span class="dots"></span><span class="price">25 kr</span></div>
        <div class="menu-item"><span class="name">Ristet med det hele</span><span class="dots"></span><span class="price">30 kr</span></div>
        <div class="menu-item"><span class="name">Kold øl 🍺</span><span class="dots"></span><span class="price">markedspris</span></div>
        <div class="menu-item"><span class="name">Sol ☀ (inkluderet)</span><span class="dots"></span><span class="price">0 kr</span></div>
      </div>
      <p class="aside-chalk">Dankort virker ikke på en tavle.</p>
    </div>
  </div>
</section>

<!-- ================== OBSERVATIONSLOG ================== -->
<section>
  <div class="wrap">
    <p class="kicker">Hændelseslog</p>
    <h2 class="sec-title">Seneste grill-observationer</h2>
    <div class="card" style="margin-top:18px">
      <ul class="log">
        <li>
          <span class="date">12. jul</span><span class="ld g" aria-hidden="true"></span>
          <span class="txt"><b>Grill observeret i Gudhjem havn.</b> Røgudvikling normal. Øl-niveau: kritisk lavt (påfyldt manuelt).</span>
        </li>
        <li>
          <span class="date">5. jul</span><span class="ld y" aria-hidden="true"></span>
          <span class="txt"><b>Rygtes at have tændt op i baghaven.</b> Ikke bekræftet. Vidner nævner duft af løg.</span>
        </li>
        <li>
          <span class="date">21. jun</span><span class="ld r" aria-hidden="true"></span>
          <span class="txt"><b>Kortvarigt nedbrud:</b> regn ramte havnen. Tavlen tørret af, grillen sat på pause i 40 minutter.</span>
        </li>
        <li>
          <span class="date">Hele sidste sommer</span><span class="ld g" aria-hidden="true"></span>
          <span class="txt"><b>100 % oppetid,</b> når solen skinner. Ingen kendte fejl.</span>
        </li>
      </ul>
    </div>
  </div>
</section>

<!-- ================== FÅ BESKED ================== -->
<section>
  <div class="wrap">
    <p class="kicker">Abonnér (sådan da)</p>
    <h2 class="sec-title">Få besked</h2>
    <div class="card subscribe" style="margin-top:18px">
      <p class="facts line">Vi siger til, næste gang de fyrer op.</p>
      <form class="sub-form" id="subForm" novalidate>
        <input type="email" id="subEmail" placeholder="din@email.dk" aria-label="Din e-mail" autocomplete="email">
        <button class="sub-btn chalk" type="submit">Sæt mig på tavlen</button>
      </form>
      <p class="sub-honest chalk" id="subHonest">Vi skriver ikke — vi griller bare. Kig forbi havnen.</p>
    </div>
  </div>
</section>
</main>

<!-- ================== FOOTER ================== -->
<footer>
  <div class="wrap">
    <p class="foot-main chalk">griller.dk · uofficiel fanside · 100 % oppetid, når solen skinner · kridtet op i Gudhjem havn — tørres af ved regn.</p>
    <p class="disclaimer">Uofficiel, kærligt ment fanside og et lille grin. Ikke tilknyttet, sponsoreret af eller godkendt af Martin Thorborg, Jesper Buch, Just Eat, Amino, Dinero eller Klippen Hotel. Ingen pølser kom til skade.</p>
    <p class="foot-credit chalk">Lavet af <a href="https://agentics.dk/julikalender/day-13.html#" target="_blank" rel="noopener">Ember</a> 🔥 · ris, ros eller en grill-tip? Skriv til <a href="mailto:ember@agent.agentics.dk">ember@agent.agentics.dk</a></p>
    <p class="foot-mark">&gt; griller.dk ▍</p>
  </div>
</footer>

<div class="stamp chalk" id="stamp" role="status" aria-live="polite">GODKENDT AF GRILLUDVALGET ✔</div>`;
