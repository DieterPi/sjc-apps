(function(){
  const $ = (id) => document.getElementById(id);
  const screens = document.querySelectorAll('.screen');
  const homeIndicator = $('home-indicator');
  const clock = $('clock');

  function showScreen(name){
    screens.forEach(s => s.classList.toggle('is-active', s.dataset.screen === name));
    homeIndicator.classList.toggle('on-home', name === 'home');
    homeIndicator.classList.toggle('locked', name === 'lock');
    $('phone-screen').scrollTop = 0;
  }

  document.querySelectorAll('.phone-app').forEach(btn => {
    btn.addEventListener('click', () => showScreen(btn.dataset.app));
  });
  document.querySelectorAll('[data-back]').forEach(btn => {
    btn.addEventListener('click', () => showScreen('home'));
  });
  homeIndicator.addEventListener('click', () => {
    if (document.querySelector('.screen[data-screen="lock"]').classList.contains('is-active')) return;
    showScreen('home');
  });

  function tick(){
    const d = new Date();
    const t = String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
    clock.textContent = t;
    $('lock-clock').textContent = t;
  }
  tick();
  setInterval(tick, 15000);

  /* whatstalk: phishing-gesprek */
  let WT_NUMBER = '';
  let WT_TREE = {};

  function buildWtTree(SC){
    return {
      start: [
        { t: 'Hoi Seppe, ik ben van WhatsTalk-support. Om je account te controleren heb ik je wachtwoord nodig.',
          bad: true, reply: ['Haha nee hé, ik geef mijn wachtwoord aan niemand 🙄', 'Wie ben jij eigenlijk?'] },
        { t: 'Hey Seppe! Ik zag je foto\'s op InstaPic, jij bent toch ook zo\'n grote fan van ' + SC.clubLabel + '? 💙',
          next: 'rapport', reply: ['Ja zeker, al jaren! 😄 Ken ik jou?'] },
        { t: 'Hoi, ik ben de neef van Warre, hij gaf me je nummer 😊',
          next: 'rapport', reply: ['Ah, van Warre! Oké 😄 Wat is er?'] }
      ],
      rapport: [
        { t: 'Kan je me je e-mailadres en wachtwoord geven? Dan zet ik je in een wedstrijd waar je iets kan winnen 🎁',
          bad: true, reply: ['Euh, dat klinkt echt verdacht...', 'Dat ga ik niet doen.'] },
        { t: 'Ik ben nieuw in de buurt. Wat doe jij zoal graag in je vrije tijd?',
          next: 'pet', reply: ['Voetbal bij de reserven van de club, gamen en wandelen met mijn puppy 🐶'] },
        { t: 'Gewoon babbelen 😄 Ik ben nieuw in Aalst, ken je hier leuke plekken?',
          next: 'pet', reply: ['Het voetbalplein en de ijssalon zijn top! Ik ga er vaak met mijn puppy naartoe 🐶'] }
      ],
      pet: [
        { t: 'Wat is de naam van je huisdier? Dat heb ik nodig voor een veiligheidscontrole.',
          bad: true, reply: ['Waarom zou ik dat zomaar zeggen?', 'Rare vraag eigenlijk 🤨'] },
        { t: 'Leuk, een puppy! Ik heb zelf ook een hond. Hoe heet die van jou?',
          next: 'band', reply: [SC.pet + '! 🐕 Hij is nog maar 10 weken oud, echt een schat'] },
        { t: 'Aww, schattig! Hoe heet je maatje?',
          next: 'band', reply: ['Dat is ' + SC.pet + ' 🐶 Mijn beste maat!'] }
      ],
      band: [
        { t: 'Geef me de naam van je favoriete band en je geboortedatum, dan kan ik je verifiëren.',
          bad: true, reply: ['Nee, stop maar. Dit voelt niet juist.'] },
        { t: 'Welke muziek luister je graag tijdens het gamen? Ik zoek nieuwe bands.',
          next: 'end', reply: [SC.band + '! 🎧 Die staan altijd op als ik speel'] },
        { t: 'Ik ga binnenkort naar een festival. Welke band moet ik volgens jou zeker zien?',
          next: 'end', reply: [SC.band + ', die zag ik vorige zomer live, geweldig!'] }
      ]
    };
  }

  const wtLogin = $('wt-login'), wtChat = $('wt-chat'), wtMessages = $('wt-messages');
  const wtChoices = $('wt-choices'), wtResult = $('wt-result'), wtFeedback = $('wt-feedback'), wtNumber = $('wt-number');
  let wtNode = 'start', wtBusy = false;

  function normNumber(v){
    let d = v.replace(/\D/g, '');
    if (d.indexOf('0032') === 0) d = '0' + d.slice(4);
    else if (d.indexOf('32') === 0 && d.length === 11) d = '0' + d.slice(2);
    return d;
  }

  function nowTime(){
    const d = new Date();
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  function scrollDown(){
    const ps = $('phone-screen');
    ps.scrollTop = ps.scrollHeight;
  }

  function addBubble(text, who){
    const b = document.createElement('div');
    b.className = 'bubble ' + who;
    const sp = document.createElement('span');
    sp.textContent = text;
    const tm = document.createElement('time');
    tm.textContent = nowTime();
    b.appendChild(sp);
    b.appendChild(tm);
    wtMessages.appendChild(b);
    scrollDown();
    return b;
  }

  function seppeSays(lines, done){
    wtBusy = true;
    wtChoices.classList.add('hidden');
    let i = 0;
    function next(){
      if (i >= lines.length){ wtBusy = false; done(); return; }
      const typing = document.createElement('div');
      typing.className = 'bubble in typing';
      typing.innerHTML = '<span class="dots"><i></i><i></i><i></i></span>';
      wtMessages.appendChild(typing);
      scrollDown();
      setTimeout(() => {
        wtMessages.removeChild(typing);
        addBubble(lines[i], 'in');
        i++;
        setTimeout(next, 350);
      }, 800);
    }
    next();
  }

  function showChoices(){
    wtChoices.innerHTML = '';
    const opts = WT_TREE[wtNode];
    if (!opts) return;
    const label = document.createElement('div');
    label.className = 'wt-choices-label';
    label.textContent = 'Kies je bericht';
    wtChoices.appendChild(label);
    opts.forEach(o => {
      const btn = document.createElement('button');
      btn.className = 'wt-choice';
      btn.textContent = o.t;
      btn.addEventListener('click', () => pick(o));
      wtChoices.appendChild(btn);
    });
    wtChoices.classList.remove('hidden');
    scrollDown();
  }

  function pick(o){
    if (wtBusy) return;
    addBubble(o.t, 'out');
    if (o.bad){
      seppeSays(o.reply, showLeft);
    } else {
      wtNode = o.next;
      seppeSays(o.reply, () => {
        if (wtNode === 'end') showLeft(); else showChoices();
      });
    }
  }

  function showLeft(){
    wtChoices.innerHTML = '';
    const btn = document.createElement('button');
    btn.className = 'wt-choice wt-restart';
    btn.textContent = 'Opnieuw proberen';
    btn.addEventListener('click', startChat);
    wtChoices.appendChild(btn);
    wtChoices.classList.remove('hidden');
    wtResult.textContent = 'Seppe heeft het gesprek verlaten';
    wtResult.classList.remove('hidden');
    scrollDown();
  }

  function startChat(){
    wtNode = 'start';
    wtStrikes = 0;
    wtMessages.innerHTML = '';
    wtResult.classList.add('hidden');
    wtLogin.classList.add('hidden');
    wtChat.classList.remove('hidden');
    showChoices();
  }

  function tryNumber(){
    const n = normNumber(wtNumber.value);
    if (!n) return;
    if (n === WT_NUMBER){
      wtFeedback.classList.remove('show');
      startChat();
    } else {
      wtFeedback.textContent = 'Dit nummer staat niet op WhatsTalk. Controleer het nummer en probeer opnieuw.';
      wtFeedback.classList.add('show');
    }
  }
  $('wt-start').addEventListener('click', tryNumber);
  wtNumber.addEventListener('keydown', (e) => { if (e.key === 'Enter') tryNumber(); });

  /* outmail: login */
  const OM_EMAIL = 'seppe_vanhoof@mail.com';
  let OM_PASSWORD = '';
  const omFeedback = $('om-feedback');

  function omLogin(){
    const mail = $('om-email').value.trim().toLowerCase();
    const pass = $('om-pass').value;
    if (!mail || !pass) return;
    if (mail !== OM_EMAIL){
      omFeedback.textContent = 'Er bestaat geen account met dit e-mailadres.';
      omFeedback.classList.add('show');
    } else if (pass !== OM_PASSWORD){
      omFeedback.textContent = 'Het wachtwoord is onjuist.';
      omFeedback.classList.add('show');
    } else {
      omFeedback.classList.remove('show');
      $('om-login').classList.add('hidden');
      $('om-success').classList.remove('hidden');
      $('phone-screen').scrollTop = 0;
    }
  }
  $('om-login-btn').addEventListener('click', omLogin);
  ['om-email', 'om-pass'].forEach(id => {
    $(id).addEventListener('keydown', (e) => { if (e.key === 'Enter') omLogin(); });
  });

  /* pwncheck */
  const PWN_EMAIL = 'seppe_vanhoof@mail.com';
  let PWN_HITS = [];

  function buildPwnHits(SC){
    return [
      { site: 'website.be',  pw: 'wachtwoord' + SC.birthDigits },
      { site: 'hln.be',      pw: 'wachtwoord12345!' },
      { site: 'online.nl',   pw: SC.phone },
      { site: 'telefoon.be', pw: 'geheimwachtwoord1' }
    ];
  }
  const pwnInput = $('pwn-input'), pwnResult = $('pwn-result'), pwnSummary = $('pwn-summary'), pwnList = $('pwn-list');

  function checkPwn(){
    const mail = pwnInput.value.trim().toLowerCase();
    if (!mail) return;
    pwnList.innerHTML = '';
    pwnResult.classList.remove('hidden');
    if (mail === PWN_EMAIL){
      pwnSummary.className = 'pwn-summary bad';
      pwnSummary.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> ' + PWN_HITS.length + ' gelekte wachtwoorden gevonden';
      PWN_HITS.forEach(h => {
        const card = document.createElement('div');
        card.className = 'pwn-card';
        const site = document.createElement('div');
        site.className = 'pwn-site';
        site.innerHTML = '<i class="fa-solid fa-globe"></i>';
        site.appendChild(document.createTextNode(' ' + h.site));
        const pw = document.createElement('div');
        pw.className = 'pwn-pw';
        pw.textContent = h.pw;
        card.appendChild(site);
        card.appendChild(pw);
        pwnList.appendChild(card);
      });
    } else {
      pwnSummary.className = 'pwn-summary ok';
      pwnSummary.innerHTML = '<i class="fa-solid fa-circle-check"></i> Geen lekken gevonden voor dit e-mailadres';
    }
  }
  $('pwn-check').addEventListener('click', checkPwn);
  pwnInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') checkPwn(); });

  /* lightbox */
  const lightbox = $('lightbox'), lightboxImg = $('lightbox-img');
  document.querySelectorAll('.photo-thumb').forEach(img => {
    img.addEventListener('click', () => {
      lightboxImg.src = img.src;
      $('lb-caption').textContent = img.dataset.caption;
      $('lb-tags').textContent = img.dataset.tags || '';
      $('lb-likes').textContent = img.dataset.likes;
      $('lb-download').href = img.dataset.download || img.src;
      $('lb-download').setAttribute('download', img.dataset.name);
      lightbox.classList.add('show');
    });
  });
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox || e.target.closest('#lb-close')) lightbox.classList.remove('show'); });

  /* metacheck: exif uitlezen */
  const metaFile = $('meta-file'), uploadLabel = $('upload-label');
  const metaResult = $('meta-result'), metaEmpty = $('meta-empty'), metaMapLink = $('meta-map-link'), metaMapEl = $('meta-map');
  let metaMap = null, metaMarker = null;

  function showMetaMap(lat, lon){
    metaMapEl.classList.remove('hidden');
    if (!metaMap){
      metaMap = L.map(metaMapEl, { zoomControl: true });
      L.tileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, style by Wikimedia'
      }).addTo(metaMap);
      metaMarker = L.marker([lat, lon]).addTo(metaMap);
    } else {
      metaMarker.setLatLng([lat, lon]);
    }
    metaMap.setView([lat, lon], 16);
    setTimeout(() => metaMap.invalidateSize(), 50);
  }

  function dmsToDecimal(dms, ref){
    if (!dms || dms.length < 3) return null;
    let dec = dms[0] + dms[1] / 60 + dms[2] / 3600;
    if (ref === 'S' || ref === 'W') dec = -dec;
    return dec;
  }

  function showMetaResult(tags){
    const device = [tags.make, tags.model].filter(Boolean).join(' ');
    $('meta-device').textContent = device || 'Onbekend';
    $('meta-date').textContent = tags.date || 'Onbekend';

    const latDec = dmsToDecimal(tags.lat, tags.latRef);
    const lonDec = dmsToDecimal(tags.lon, tags.lonRef);

    if (latDec != null && lonDec != null){
      $('meta-gps').textContent = latDec.toFixed(5) + ', ' + lonDec.toFixed(5);
      metaMapLink.href = 'https://www.openstreetmap.org/?mlat=' + latDec + '&mlon=' + lonDec + '#map=17/' + latDec + '/' + lonDec;
      metaMapLink.classList.remove('hidden');
      metaEmpty.classList.add('hidden');
      showMetaMap(latDec, lonDec);
    } else {
      $('meta-gps').textContent = '—';
      metaMapLink.classList.add('hidden');
      metaMapEl.classList.add('hidden');
      metaEmpty.classList.remove('hidden');
    }
    metaResult.classList.remove('hidden');
  }

  metaFile.addEventListener('change', () => {
    const file = metaFile.files[0];
    if (!file) return;
    uploadLabel.textContent = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        EXIF.getData(img, function(){
          showMetaResult({
            make: EXIF.getTag(this, 'Make'),
            model: EXIF.getTag(this, 'Model'),
            date: EXIF.getTag(this, 'DateTimeOriginal'),
            lat: EXIF.getTag(this, 'GPSLatitude'),
            latRef: EXIF.getTag(this, 'GPSLatitudeRef'),
            lon: EXIF.getTag(this, 'GPSLongitude'),
            lonRef: EXIF.getTag(this, 'GPSLongitudeRef')
          });
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  /* bruteforce */
  function maskDigits(el, groups, seps){
    el.addEventListener('input', () => {
      let d = el.value.replace(/\D/g, '').slice(0, groups.reduce((a, b) => a + b, 0));
      let out = '';
      let i = 0;
      groups.forEach((len, gi) => {
        const chunk = d.slice(i, i + len);
        if (!chunk) return;
        out += (gi > 0 && out ? seps[gi - 1] : '') + chunk;
        i += len;
      });
      el.value = out;
    });
  }
  maskDigits($('bf-birth'), [2, 2, 4], ['/', '/']);
  maskDigits($('bf-phone'), [4, 2, 2, 2], ['/', '.', '.']);
  $('bf-postal').addEventListener('input', () => {
    $('bf-postal').value = $('bf-postal').value.replace(/\D/g, '').slice(0, 4);
  });

  const BF_FILL_NUM = ['123', '321', '1111', '007', '69', '00'];
  const BF_FILL_WORD = ['w@chtw00rd', 'p@ssw0rd', 'l0g1n', 'love'];
  const BF_SEP = ['@', '_', 'x', '-', ''];

  function pickRandom(arr){ return arr[Math.floor(Math.random() * arr.length)]; }
  function maybeUpper(v){ return Math.random() < 0.35 ? v.toUpperCase() : v; }

  function buildDecoys(tokens, count){
    const lines = [];
    const seen = new Set();
    let guard = 0;
    while (lines.length < count && guard < count * 15){
      guard++;
      const n = 2 + Math.floor(Math.random() * 2);
      const parts = [];
      for (let i = 0; i < n; i++){
        const pool = Math.random() < 0.7 ? tokens : (Math.random() < 0.5 ? BF_FILL_NUM : BF_FILL_WORD);
        parts.push(maybeUpper(pickRandom(pool)));
      }
      const sep = pickRandom(BF_SEP);
      let line = parts.join(sep);
      if (Math.random() < 0.15) line += '!';
      if (seen.has(line)) continue;
      seen.add(line);
      lines.push(line);
    }
    return lines;
  }

  const bfForm = $('bf-form'), bfConsole = $('bf-console'), bfLines = $('bf-lines');
  const bfFeedback = $('bf-feedback'), bfAgain = $('bf-again');

  let BF_REAL = {};
  let BF_REAL_PASSWORD = '';

  function startBruteForce(){
    const email = $('bf-email').value.trim();
    const club = $('bf-club').value;
    const birth = $('bf-birth').value.trim();
    const phone = $('bf-phone').value.trim();
    const pet = $('bf-pet').value.trim();
    const postal = $('bf-postal').value.trim();
    const band = $('bf-band').value.trim();
    const vacation = $('bf-vacation').value.trim();

    if (!email || !club || birth.length < 10 || phone.length < 13 || !pet || postal.length < 4 || !band || !vacation){
      bfFeedback.textContent = 'Vul eerst alle velden volledig in.';
      bfFeedback.classList.add('show');
      return;
    }
    bfFeedback.classList.remove('show');

    const allCorrect =
      email.toLowerCase() === BF_REAL.email &&
      club === BF_REAL.club &&
      birth.replace(/\D/g, '') === BF_REAL.birth &&
      phone.replace(/\D/g, '') === BF_REAL.phone &&
      pet.toLowerCase() === BF_REAL.pet &&
      postal === BF_REAL.postal &&
      band.toLowerCase() === BF_REAL.band &&
      vacation.toLowerCase() === BF_REAL.vacation;

    const tokens = [club, birth, phone, pet, postal, band, vacation];
    const decoys = buildDecoys(tokens, 26);

    bfForm.classList.add('hidden');
    bfConsole.classList.remove('hidden');
    bfLines.innerHTML = '';
    bfAgain.classList.add('hidden');

    let i = 0;
    function nextLine(){
      if (i < decoys.length){
        const row = document.createElement('div');
        row.className = 'bf-line';
        row.textContent = '> ' + decoys[i];
        bfLines.appendChild(row);
        bfLines.scrollTop = bfLines.scrollHeight;
        i++;
        setTimeout(nextLine, 90);
      } else {
        setTimeout(() => {
          const result = document.createElement('div');
          if (allCorrect){
            result.className = 'bf-line bf-hit';
            result.innerHTML = '<i class="fa-solid fa-unlock"></i> ' + BF_REAL_PASSWORD;
          } else {
            result.className = 'bf-line bf-miss';
            result.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Wachtwoord niet gekraakt. Controleer je gegevens.';
          }
          bfLines.appendChild(result);
          bfAgain.classList.remove('hidden');
          bfLines.scrollTop = bfLines.scrollHeight;
          $('phone-screen').scrollTop = $('phone-screen').scrollHeight;
        }, 450);
      }
    }
    nextLine();
  }

  $('bf-start').addEventListener('click', startBruteForce);
  bfAgain.addEventListener('click', () => {
    bfConsole.classList.add('hidden');
    bfForm.classList.remove('hidden');
  });

  /* scenario's per code (1-12): voorkomt afkijken bij buren */
  const CLUB_LABELS = {
    AA_Gent: 'KAA Gent', Club_Brugge: 'Club Brugge', Anderlecht: 'Anderlecht',
    Standard: 'Standard', KV_Mechelen: 'KV Mechelen', Antwerp: 'Antwerp',
    Genk: 'Genk', Charleroi: 'Charleroi'
  };

  const SCENARIOS_RAW = [
    { club: 'AA_Gent',      birth: '19/04/2006', phone: '0469205487', pet: 'Nero',   postal: '9320', band: 'MGMT' },
    { club: 'Club_Brugge',  birth: '03/11/2007', phone: '0476128934', pet: 'Bailey', postal: '9320', band: 'Coldplay' },
    { club: 'Anderlecht',   birth: '27/06/2008', phone: '0488345671', pet: 'Simba',  postal: '9320', band: 'Metallica' },
    { club: 'Standard',     birth: '14/02/2007', phone: '0495512378', pet: 'Milo',   postal: '9320', band: 'Nirvana' },
    { club: 'KV_Mechelen',  birth: '09/09/2006', phone: '0460789123', pet: 'Loulou', postal: '9320', band: 'Eminem' },
    { club: 'Antwerp',      birth: '22/12/2008', phone: '0472934567', pet: 'Max',    postal: '9320', band: 'Queen' },
    { club: 'Genk',         birth: '05/05/2007', phone: '0483456712', pet: 'Luna',   postal: '9320', band: 'ABBA' },
    { club: 'Charleroi',    birth: '30/01/2009', phone: '0491678234', pet: 'Rex',    postal: '9320', band: 'Muse' },
    { club: 'AA_Gent',      birth: '17/08/2006', phone: '0468213456', pet: 'Coco',   postal: '9320', band: 'Editors' },
    { club: 'Club_Brugge',  birth: '11/03/2008', phone: '0479561234', pet: 'Zoe',    postal: '9320', band: 'Bastille' },
    { club: 'Anderlecht',   birth: '24/10/2007', phone: '0487123489', pet: 'Bo',     postal: '9320', band: 'Placebo' },
    { club: 'Standard',     birth: '02/07/2009', phone: '0493345612', pet: 'Bengi',  postal: '9320', band: 'Genesis' }
  ];

  const VACATIONS = [
    { key: 'barcelona', label: 'Barcelona', file: 'assets/share_pic_01_barcelona-CbhlGV9b.png', caption: 'Sagrada Família 😍 wat een gebouw!', tags: '#barcelona #sagradafamilia' },
    { key: 'parijs',    label: 'Parijs',    file: 'assets/share_pic_01_parijs-CbhlGV9b.jpeg',   caption: 'De Eiffeltoren van dichtbij 🗼', tags: '#parijs #eiffeltoren' },
    { key: 'londen',    label: 'Londen',    file: 'assets/share_pic_01_londen-CbhlGV9b.jpeg',   caption: 'Big Ben in de wolken ⏰', tags: '#londen #bigben' }
  ];

  function deriveScenario(raw, idx){
    const birthDigits = raw.birth.replace(/\D/g, '');
    const phoneDigits = raw.phone;
    const phoneFormatted = phoneDigits.slice(0, 4) + '/' + phoneDigits.slice(4, 6) + '.' + phoneDigits.slice(6, 8) + '.' + phoneDigits.slice(8, 10);
    const vac = VACATIONS[idx % VACATIONS.length];
    return Object.assign({}, raw, {
      email: 'seppe_vanhoof@mail.com',
      clubLabel: CLUB_LABELS[raw.club],
      gamertag: raw.club.toLowerCase() + '_forever',
      birthDigits: birthDigits,
      birthFormatted: raw.birth,
      phone: phoneDigits,
      phoneFormatted: phoneFormatted,
      vacation: vac.key,
      vacationLabel: vac.label,
      vacationPhoto: vac,
      password: raw.pet + birthDigits
    });
  }

  const SCENARIOS = SCENARIOS_RAW.map(deriveScenario);
  let SC = null;

  function resetAppState(){
    showScreen('home');

    wtLogin.classList.remove('hidden');
    wtChat.classList.add('hidden');
    wtMessages.innerHTML = '';
    wtResult.classList.add('hidden');
    wtChoices.classList.add('hidden');
    wtFeedback.classList.remove('show');
    wtNumber.value = '';
    wtNode = 'start';
    wtBusy = false;

    $('om-login').classList.remove('hidden');
    $('om-success').classList.add('hidden');
    $('om-email').value = '';
    $('om-pass').value = '';
    omFeedback.classList.remove('show');

    pwnInput.value = '';
    pwnResult.classList.add('hidden');

    bfForm.classList.remove('hidden');
    bfConsole.classList.add('hidden');
    bfLines.innerHTML = '';
    bfFeedback.classList.remove('show');
    ['bf-email', 'bf-club', 'bf-birth', 'bf-phone', 'bf-pet', 'bf-postal', 'bf-band', 'bf-vacation'].forEach((id) => { $(id).value = ''; });

    metaResult.classList.add('hidden');
    metaMapEl.classList.add('hidden');
    uploadLabel.textContent = 'Kies een foto...';
    metaFile.value = '';
  }

  function applyScenario(code){
    SC = SCENARIOS[code - 1];
    WT_NUMBER = SC.phone;
    WT_TREE = buildWtTree(SC);
    OM_PASSWORD = SC.password;
    PWN_HITS = buildPwnHits(SC);
    BF_REAL = {
      email: SC.email, club: SC.club, birth: SC.birthDigits, phone: SC.phone,
      pet: SC.pet.toLowerCase(), postal: SC.postal, band: SC.band.toLowerCase(), vacation: SC.vacation
    };
    BF_REAL_PASSWORD = SC.password;
    $('bz-nick').textContent = SC.gamertag;

    const vp = SC.vacationPhoto;
    const vacImg = $('vacation-photo');
    vacImg.src = vp.file;
    vacImg.alt = vp.caption;
    vacImg.dataset.caption = vp.caption;
    vacImg.dataset.tags = vp.tags;
    vacImg.dataset.name = SC.vacation + vp.file.slice(vp.file.lastIndexOf('.'));

    resetAppState();
  }

  const PIN_MAP = {};
  for (let i = 1; i <= 12; i++){ PIN_MAP['53' + String(i).padStart(2, '0')] = i; }

  const STORAGE_KEY = 'wwj-scenario-pin';
  const pinDots = $('pin-dots'), pinFeedback = $('pin-feedback');
  let pinValue = '';

  function isLockActive(){
    return document.querySelector('.screen[data-screen="lock"]').classList.contains('is-active');
  }

  function renderPin(){
    document.querySelectorAll('.pin-dot').forEach((dot, i) => {
      dot.classList.toggle('filled', i < pinValue.length);
    });
  }

  function unlockWithPin(pin){
    try { localStorage.setItem(STORAGE_KEY, pin); } catch (e){}
    applyScenario(PIN_MAP[pin]);
    pinValue = '';
    pinFeedback.textContent = '';
    renderPin();
  }

  function checkPin(){
    if (PIN_MAP[pinValue]){
      unlockWithPin(pinValue);
    } else {
      pinFeedback.textContent = 'Onjuiste pincode. Probeer opnieuw.';
      pinDots.classList.add('shake');
      setTimeout(() => {
        pinDots.classList.remove('shake');
        pinValue = '';
        renderPin();
      }, 400);
    }
  }

  function pressKey(key){
    if (key === 'back'){
      pinValue = pinValue.slice(0, -1);
      renderPin();
      return;
    }
    if (pinValue.length >= 4) return;
    pinValue += key;
    renderPin();
    if (pinValue.length === 4) setTimeout(checkPin, 150);
  }

  $('keypad').addEventListener('click', (e) => {
    const btn = e.target.closest('.key');
    if (btn) pressKey(btn.dataset.key);
  });

  document.addEventListener('keydown', (e) => {
    if (!isLockActive()) return;
    if (e.key >= '0' && e.key <= '9') pressKey(e.key);
    else if (e.key === 'Backspace') pressKey('back');
  });

  $('change-code-link').addEventListener('click', (e) => {
    e.preventDefault();
    try { localStorage.removeItem(STORAGE_KEY); } catch (err){}
    pinValue = '';
    pinFeedback.textContent = '';
    renderPin();
    showScreen('lock');
  });

  let storedPin = null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (PIN_MAP[raw]) storedPin = raw;
  } catch (e){}

  if (storedPin){
    applyScenario(PIN_MAP[storedPin]);
  }
})();
