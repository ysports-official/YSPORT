
// 0. DYNAMIC ONBOARDING MODELS
const BRANCH_REQUIREMENTS = {
  "Futbol": [
    { id: "stamina", label: "Max VO2 Kapasitesi", type: "number", placeholder: "Örn: 55" },
    { id: "sprint", label: "30m Sprint Süresi (Sn)", type: "number", placeholder: "Örn: 4.1" },
    { id: "position", label: "Mevki", type: "select", options: ["Forvet", "Orta Saha", "Defans", "Kaleci"] }
  ],
  "Basketbol": [
    { id: "vertical", label: "Dikey Sıçrama (Cm)", type: "number", placeholder: "Örn: 85" },
    { id: "wingspan", label: "Kulaç Uzunluğu (Cm)", type: "number", placeholder: "Örn: 205" }
  ],
  "Halter": [
    { id: "squat", label: "Maksimum Squat (KG)", type: "number", placeholder: "Örn: 180" },
    { id: "clean", label: "Clean & Jerk (KG)", type: "number", placeholder: "Örn: 140" },
    { id: "bodyweight", label: "Vücut Ağırlığı Kategorisi", type: "select", options: ["61kg", "73kg", "89kg", "102kg", "+109kg"] }
  ],
  "Okçuluk": [
    { id: "vision", label: "Görme Keskinliği", type: "select", options: ["20/20", "20/15 (Elit)", "Miyop/Astigmat Destekli"] },
    { id: "focus", label: "Statik Odak Süresi (Dk)", type: "number", placeholder: "Örn: 45" }
  ],
  "Yüzme": [
    { id: "lung", label: "Akciğer Kapasitesi (Litre)", type: "number", placeholder: "Örn: 6.5" },
    { id: "stroke", label: "Ana Stil", type: "select", options: ["Serbest", "Kelebek", "Sırtüstü", "Kurbağalama"] }
  ],
  "E-Spor": [
    { id: "apm", label: "APM (Dakika Başı İşlem)", type: "number", placeholder: "Örn: 350" },
    { id: "reaction", label: "Görsel Reaksiyon (Ms)", type: "number", placeholder: "Örn: 150" }
  ],
  "Karate": [
    { id: "flexibility", label: "Esneklik Derecesi", type: "select", options: ["Düşük", "Orta", "Yüksek", "Elit"] },
    { id: "reaction_time", label: "Reaksiyon Hızı (Ms)", type: "number", placeholder: "Örn: 200" }
  ],
  "Jimnastik": [
    { id: "balance", label: "Statik Denge Süresi (Sn)", type: "number", placeholder: "Örn: 120" },
    { id: "flex_index", label: "Esneklik İndeksi (1-10)", type: "number", placeholder: "Örn: 9" }
  ]
};

function renderDynamicOnboardingFields() {
  const branch = document.getElementById('onboardingBranchSelect').value;
  const container = document.getElementById('dynamicOnboardingContainer');
  const area = document.getElementById('dynamicFieldsArea');
  
  if(!branch) {
    container.style.display = 'none';
    return;
  }
  
  container.style.display = 'block';
  let html = '';
  
  const reqs = BRANCH_REQUIREMENTS[branch];
  if(reqs) {
    reqs.forEach(r => {
      html += `<div style="text-align:left;">
        <label style="display:block; font-size:10px; font-weight:700; color:var(--muted); text-transform:uppercase; margin-bottom:6px;">${r.label}</label>`;
      
      if(r.type === 'select') {
        html += `<select class="inp" id="dyn_${r.id}" style="margin-bottom:0; appearance:none; background:var(--card);"><option value="">Seçiniz...</option>`;
        r.options.forEach(o => html += `<option value="${o}">${o}</option>`);
        html += `</select>`;
      } else {
        html += `<input class="inp" id="dyn_${r.id}" type="${r.type}" placeholder="${r.placeholder}" style="margin-bottom:0; background:var(--card);">`;
      }
      html += `</div>`;
    });
  } else {
    // AI Fallback Generator
    html += `
      <div style="background:rgba(99,57,255,0.1); border:1px solid rgba(99,57,255,0.3); border-radius:12px; padding:12px; text-align:left;">
        <div style="font-size:10px; color:var(--pur-light); font-weight:700; margin-bottom:8px;">🤖 AI Biyo-Metrik Üreteci Devrede</div>
        <p style="font-size:11px; color:var(--muted); margin-bottom:12px;">Bu branş için özel parametreler Y SPORTS AI tarafından dinamik olarak atanacaktır.</p>
        <label style="display:block; font-size:10px; font-weight:700; color:var(--muted); text-transform:uppercase; margin-bottom:6px;">Genel Dayanıklılık Puanı (1-100)</label>
        <input class="inp" type="number" placeholder="Örn: 85" style="margin-bottom:0; background:var(--card);">
      </div>
    `;
  }
  
  area.innerHTML = html;
}

function completeOnboarding() {
  t('🚀 Biyo-metriklerin başarıyla analiz edildi!');
  setTimeout(() => {
    pg('pg4');
  }, 1000);
}

// 1. DATA MODELS
const ATHLETES_MOB = [
  { name: 'Yalçın Perik', code: 'YP', branch: '💻 Yazılım', city: 'Samsun', baseVal: 500000, price: 500000, monthlyPay: 35000, sgs: 95, spark: [460,470,480,485,492,500], bg: 'linear-gradient(135deg, var(--blue), var(--purple))', av: '💻', status: '✓ Sponsor Aktif' },
  { name: 'Ömer Yılmaz', code: 'ÖY', branch: '🥋 Karate', city: 'Samsun', baseVal: 350000, price: 350000, monthlyPay: 25000, sgs: 85, spark: [310,320,332,341,348,350], bg: 'linear-gradient(135deg, #c9a227, #ffd700)', av: '🥋', status: '✓ Sponsor Aktif' },
  { name: 'Eyüp Perik', code: 'EP', branch: '🥊 Kick Boks', city: 'Samsun', baseVal: 340000, price: 340000, monthlyPay: 24000, sgs: 76, spark: [320,325,328,334,336,340], bg: 'linear-gradient(135deg, #dc2626, #ef4444)', av: '🥊', status: '⏳ Sponsor Aranıyor' },
  { name: 'Yusra Perik', code: 'YP', branch: '🤸 Jimnastik', city: 'Samsun', baseVal: 200000, price: 200000, monthlyPay: 14000, sgs: 68, spark: [210,208,205,203,201,200], bg: 'linear-gradient(135deg, #06b6d4, #00c88c)', av: '🤸', status: '⏳ Sponsor Aranıyor' },
  { name: 'Hanene Perik', code: 'HP', branch: '🥋 Karate', city: 'Samsun', baseVal: 175000, price: 175000, monthlyPay: 12000, sgs: 65, spark: [140,148,152,160,171,175], bg: 'linear-gradient(135deg, #a78bff, #6339ff)', av: '🥋', status: '⏳ Sponsor Aranıyor' }
];

const SPORTS_LIST = [
  { name: 'Karate', count: 12, color: '#f59e0b' },
  { name: 'Yüzme', count: 8, color: '#3b82f6' },
  { name: 'Atletizm', count: 15, color: '#ef4444' },
  { name: 'Jimnastik', count: 6, color: '#8b5cf6' }
];

const PDF_RAW_DATA = {
  s: "JVBERi0xLjQKJZOMi54gUmVwb3J0TGFiIEdlbmVyYXRlZCBQREYgZG9jdW1lbnQgKG9wZW5zb3VyY2Up...", // Base64 simulated
  t: "JVBERi0xLjQKJZOMi54gUmVwb3J0TGFiIEdlbmVyYXRlZCBQREYgZG9jdW1lbnQgKG9wZW5zb3VyY2Up...",
  sp: "JVBERi0xLjQKJZOMi54gUmVwb3J0TGFiIEdlbmVyYXRlZCBQREYgZG9jdW1lbnQgKG9wZW5zb3VyY2Up..."
};

// 2. STATE STACK
const historyStack = [];
let currentScreenId = 'pg1';
let mobUploadCount = 1;
let bourseSubTab = 0;

// Dynamic Login & Registration States
let activeLoginRole = 'sporcu';
let isRegisterMode = false;

function openLoginScreen(role) {
  activeLoginRole = role;
  isRegisterMode = false;
  
  // Reset fields
  document.getElementById('regName').value = '';
  document.getElementById('loginPhone').value = '';
  document.getElementById('kvkkCheck').checked = false;
  document.getElementById('registerFields').style.display = 'none';
  
  // Set texts according to role
  const icon = document.getElementById('loginRoleIcon');
  const title = document.getElementById('loginRoleTitle');
  const sub = document.getElementById('loginRoleSub');
  
  let iconChar = '🏃';
  let titleText = 'Sporcu Giriş Paneli';
  let subText = 'Y SPORTS akıllı sporcu sistemine güvenli erişim sağlayın.';
  
  if (role === 'sporcu') {
    iconChar = '🏃';
    titleText = 'Sporcu Giriş Paneli';
    subText = 'Lisans, SGD değerleme ve video taahhüt takibi.';
  } else if (role === 'sponsor') {
    iconChar = '💼';
    titleText = 'Sponsor Giriş Paneli';
    subText = 'Sporcu sponsorluk pazarı, yatırım ve AI eşleşme.';
  } else if (role === 'federasyon') {
    iconChar = '🏛️';
    titleText = 'Federasyon Giriş Paneli';
    subText = 'Federasyon yetki doğrulama ve lisans tescil kontrolü.';
  } else if (role === 'kulup') {
    iconChar = '🛡️';
    titleText = 'Kulüp Giriş Paneli';
    subText = 'Spor kulübü üye veri tabanı ve teşvik entegrasyonu.';
  } else if (role === 'temsilci') {
    iconChar = '🏙️';
    titleText = 'İl Temsilcisi Giriş Paneli';
    subText = 'Akıllı Şehir koordinasyon, denetleme ve spor teşvik fonları.';
  }
  
  icon.textContent = iconChar;
  title.textContent = titleText;
  sub.textContent = subText;
  
  // Set buttons text
  document.getElementById('loginScreenTitle').textContent = 'Giriş Yap';
  document.getElementById('googleLoginBtn').textContent = 'Google ile Giriş Yap';
  document.getElementById('phoneAuthBtn').textContent = 'Doğrulama Kodu Gönder';
  document.getElementById('toggleModeText').textContent = 'Hesabınız yok mu?';
  document.getElementById('toggleModeBtn').textContent = 'Yeni Hesap Oluştur (Kaydol)';
  
  pg('pg3');
}

function toggleLoginMode() {
  isRegisterMode = !isRegisterMode;
  
  const regFields = document.getElementById('registerFields');
  const screenTitle = document.getElementById('loginScreenTitle');
  const googleBtn = document.getElementById('googleLoginBtn');
  const phoneBtn = document.getElementById('phoneAuthBtn');
  const toggleText = document.getElementById('toggleModeText');
  const toggleBtn = document.getElementById('toggleModeBtn');
  const roleTitle = document.getElementById('loginRoleTitle');
  
  // Format dynamic role title based on register mode
  let rolePrefix = 'Sporcu';
  if (activeLoginRole === 'sponsor') rolePrefix = 'Sponsor';
  else if (activeLoginRole === 'federasyon') rolePrefix = 'Federasyon';
  else if (activeLoginRole === 'kulup') rolePrefix = 'Kulüp';
  else if (activeLoginRole === 'temsilci') rolePrefix = 'İl Temsilcisi';

  if (isRegisterMode) {
    regFields.style.display = 'block';
    screenTitle.textContent = 'Yeni Kayıt Ol';
    roleTitle.textContent = rolePrefix + ' Üye Kayıt Paneli';
    googleBtn.textContent = 'Google ile Kayıt Ol';
    phoneBtn.textContent = 'Kayıt Ol ve Doğrula';
    toggleText.textContent = 'Zaten hesabınız var mı?';
    toggleBtn.textContent = 'Giriş Yapın';
  } else {
    regFields.style.display = 'none';
    screenTitle.textContent = 'Giriş Yap';
    roleTitle.textContent = rolePrefix + ' Giriş Paneli';
    googleBtn.textContent = 'Google ile Giriş Yap';
    phoneBtn.textContent = 'Doğrulama Kodu Gönder';
    toggleText.textContent = 'Hesabınız yok mu?';
    toggleBtn.textContent = 'Yeni Hesap Oluştur (Kaydol)';
  }
}

function triggerGoogleAuth() {
  // Check KVKK Checkbox
  if (!document.getElementById('kvkkCheck').checked) {
    t('⚠️ Giriş yapmak için KVKK Aydınlatma Metnini onaylamanız hukuken mecburidir.');
    return;
  }
  
  if (isRegisterMode) {
    const name = document.getElementById('regName').value.trim();
    if (!name) {
      t('⚠️ Lütfen Ad Soyad bilginizi eksiksiz yazın.');
      return;
    }
  }
  
  // Determine target screen based on activeLoginRole
  let target = 'pgOnboarding';
  if (activeLoginRole === 'sporcu') target = 'pgOnboarding';
  else if (activeLoginRole === 'sponsor') target = 'pg9';
  else if (activeLoginRole === 'federasyon') target = 'pg12';
  else if (activeLoginRole === 'kulup') target = 'pg12';
  else if (activeLoginRole === 'temsilci') target = 'pg12';
  
  openGoogleModal(activeLoginRole, target);
}

function triggerPhoneAuth() {
  // Check KVKK Checkbox
  if (!document.getElementById('kvkkCheck').checked) {
    t('⚠️ İşleme devam etmek için KVKK Açık Rıza Beyanını onaylamanız gerekmektedir.');
    return;
  }
  
  const phone = document.getElementById('loginPhone').value.trim();
  if (phone.length < 10) {
    t('⚠️ Lütfen geçerli bir telefon numarası girin.');
    return;
  }
  
  if (isRegisterMode) {
    const name = document.getElementById('regName').value.trim();
    if (!name) {
      t('⚠️ Lütfen Ad Soyad giriniz.');
      return;
    }
  }

  // Determine target screen based on activeLoginRole
  let target = 'pgOnboarding';
  if (activeLoginRole === 'sporcu') target = 'pgOnboarding';
  else if (activeLoginRole === 'sponsor') target = 'pg9';
  else if (activeLoginRole === 'federasyon') target = 'pg12';
  else if (activeLoginRole === 'kulup') target = 'pg12';
  else if (activeLoginRole === 'temsilci') target = 'pg12';
  
  openSmsModal(target);
}

// 3. TOAST TRIGGER
let toastTimeout;
function t(msg){
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => el.classList.remove('show'), 2500);
}

// 4. ROUTER pg(id)
function pg(id){
  const cur = document.querySelector('.screen.active');
  if(cur && cur.id !== id) historyStack.push(cur.id);
  
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(id);
  if(!target) { t('Ekran bulunamadı: ' + id); return; }
  
  target.classList.add('active');
  currentScreenId = id;

  // Active Bottom Nav Highlight
  document.querySelectorAll('.bni').forEach(btn => btn.classList.remove('on'));
  const highlightTab = (tabIdx) => {
    document.querySelectorAll('.bnav').forEach(nav => {
      if(nav.children[tabIdx]) nav.children[tabIdx].classList.add('on');
    });
  };
  
  if(id === 'pg1' || id === 'pg4' || id === 'pg18') highlightTab(0);
  else if(id === 'pg6') highlightTab(1);
  else if(id === 'pg7') highlightTab(2);
  else if(id === 'pg8') highlightTab(3);
  else if(id === 'pg27') highlightTab(4);

  // Dinamik Belediye & Federasyon & Kulüp Dashboard Yönetimi
  if (id === 'pg12') {
    const role = activeLoginRole;
    const profBrans = document.getElementById('mobProfBrans') ? document.getElementById('mobProfBrans').value.trim() : 'Karate';
    const profSehir = document.getElementById('mobProfSehir') ? document.getElementById('mobProfSehir').value.trim() : 'Samsun';
    
    if (role === 'federasyon') {
      document.getElementById('temsilciTitle').textContent = '🏛️ Federasyon Paneli';
      document.getElementById('temsilciSubTop').textContent = `Türkiye ${profBrans} Federasyonu`;
      document.getElementById('temsilciPortalTitle').textContent = `${profSehir} İl Temsilciliği / Hakem Kurulu`;
      document.getElementById('temsilciNameBox').innerHTML = `Resmi Denetçi: <strong>Dr. Yalçın Perik</strong>`;
      
      document.getElementById('temsilciBannerTitle').textContent = `📜 Resmi Federasyon Entegrasyon Protokolü`;
      document.getElementById('temsilciBannerSub').textContent = `Y SPORTS lisans doğrulama ve teknik branş katsayı onay yetkisi.`;
    } else if (role === 'kulup') {
      document.getElementById('temsilciTitle').textContent = '🛡️ Kulüp Paneli';
      document.getElementById('temsilciSubTop').textContent = `${profSehir} ${profBrans} İhtisas Kulübü`;
      document.getElementById('temsilciPortalTitle').textContent = `Altyapı & Yetenek Gelişim Portalı`;
      document.getElementById('temsilciNameBox').innerHTML = `Kulüp Başkanı: <strong>Eyüp Perik</strong>`;
      
      document.getElementById('temsilciBannerTitle').textContent = `📜 Kulüp Altyapı & Tesis Paylaşım Sözleşmesi`;
      document.getElementById('temsilciBannerSub').textContent = `Yetenek teşvik fonları ve IoT salon doluluk entegrasyonu.`;
    } else {
      // temsilci
      document.getElementById('temsilciTitle').textContent = 'Belediye & İl Temsilcisi';
      document.getElementById('temsilciSubTop').textContent = `${profSehir} Belediyesi`;
      document.getElementById('temsilciPortalTitle').textContent = `Akıllı Şehir Spor Portalı`;
      document.getElementById('temsilciNameBox').innerHTML = `İl Temsilcisi: <strong>Mehmet Perik</strong>`;
      
      document.getElementById('temsilciBannerTitle').textContent = `📜 İl Temsilcisi Sorumluluk Sözleşmesi`;
      document.getElementById('temsilciBannerSub').textContent = `Bölgesel koordinasyon, KVKK denetimi ve yasal onay yetkisi.`;
    }
  }

  // Trigger builders
  if(id === 'pg6') { buildBourseMobile(); buildOrderBookMobile(); recalcSgdSim(); }
  else if(id === 'pg7') { buildAthletesListMob(); }
  else if(id === 'pg8') { renderSportsMob(); }
}

function back(){
  if(historyStack.length) pg(historyStack.pop());
  else pg('pg1');
}

// 5. LIVE SPONSORSHIP MATCH NOTIFICATIONS (TICKER)
function buildTicker(){
  const inner = document.getElementById('tickerInner');
  const notifications = [
    "✓ Yalçın Perik Yazılım, Ömer Yılmaz'a sponsor oldu! (350.000 TL)",
    "🆕 Samsun Gıda, Eyüp Perik ile eşleşme görüşmelerine başladı! (340.000 TL)",
    "🆕 Turkcell Yıldızlar, Yusra Perik'e sponsorluk teklifi iletti! (200.000 TL)",
    "✓ Vestel, Yalçın Perik'e teknoloji sponsoru oldu! (500.000 TL)"
  ];
  let html = '';
  notifications.forEach(n => {
    html += `
      <span class="tick-item">
        <span style="color:var(--pur-light); font-size:10px;">★</span>
        <span>${n}</span>
      </span>
    `;
  });
  inner.innerHTML = html + html;
}

// 6. SPORCU BOURSE TAB TOGGLE
function switchBorsaTab(idx){
  bourseSubTab = idx;
  document.getElementById('bt0').classList.toggle('active', idx===0);
  document.getElementById('bt1').classList.toggle('active', idx===1);
  document.getElementById('borsaTab0').style.display = idx===0 ? 'block' : 'none';
  document.getElementById('borsaTab1').style.display = idx===1 ? 'block' : 'none';
}

function buildBourseMobile(){
  const container = document.getElementById('borsaListMobile');
  if(!container) return;
  let html = '';
  ATHLETES_MOB.forEach(s => {
    const isAraniyor = s.status.includes('Aranıyor');
    const monthlyPay = Math.round(s.baseVal / 14); // monthly sponsor payout
    
    html += `
      <div class="athlete-item" style="padding: 10px; background:var(--card); border: 1px solid var(--border); border-radius: 12px; margin-bottom: 6px; display:flex; align-items:center; justify-content:space-between; cursor:pointer;" onclick="openTradeModalWithNameMobile('${s.name}')">
        <div style="width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,0.05);display:flex;align-items:center;justify-content:center;font-size:16px;">${s.av}</div>
        <div style="flex:1; margin-left:10px; min-width:0;">
          <div style="font-size:11.5px; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${s.name}</div>
          <div style="font-size:9px; color:var(--muted); margin-top:2px;">${s.branch} · SGS: ${s.sgs}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-family:'Bebas Neue'; font-size:16px; color:var(--gold);">${s.baseVal.toLocaleString('tr-TR')} TL</div>
          <div style="font-size:9px; font-weight:700; color:${isAraniyor?'var(--red)':'var(--green)'};">${s.status}</div>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}

function buildOrderBookMobile(){
  const container = document.getElementById('orderBookMobile');
  if(!container) return;
  
  const offers = [
    { brand: 'Yalçın Perik Yazılım', athlete: 'Ömer Yılmaz', offer: '350.000 TL', status: '✓ Aktif Sözleşme', color: 'var(--green)' },
    { brand: 'Samsun Gıda Dağıtım', athlete: 'Eyüp Perik', offer: '340.000 TL', status: '⏳ Yanıt Bekleniyor', color: 'var(--gold2)' },
    { brand: 'Turkcell Yıldızlar', athlete: 'Yusra Perik', offer: '200.000 TL', status: '⏳ İncelemede', color: 'var(--pur-light)' }
  ];
  
  let html = '';
  offers.forEach(o => {
    html += `
      <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border); border-radius:10px; padding:8px; margin-bottom:6px; font-size:10px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
          <span style="font-weight:700; color:#fff;">${o.brand}</span>
          <span style="color:${o.color}; font-weight:700;">${o.status}</span>
        </div>
        <div style="display:flex; justify-content:space-between; color:var(--muted);">
          <span>Sporcu: ${o.athlete}</span>
          <span>Sponsorluk Değeri: ${o.offer}</span>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}

// Recalculates SGD dynamic valuation based on sliders
function recalcSgdSim(){
  const sgs = parseInt(document.getElementById('slSgs').value);
  const yas = parseInt(document.getElementById('slYas').value);
  const medal = parseInt(document.getElementById('slMedal').value);
  const media = parseInt(document.getElementById('slMedia').value);

  document.getElementById('slSgsVal').textContent = sgs;
  document.getElementById('slYasVal').textContent = yas;
  document.getElementById('slMedalVal').textContent = medal;
  document.getElementById('slMediaVal').textContent = media + 'K';

  // Sgd math formulas
  const ageFactor = yas <= 12 ? 1.8 : yas <= 18 ? 1.4 : 1.0;
  const base = (sgs * 2000) + (medal * 5000) + (media * 1200);
  const finalVal = Math.round(base * ageFactor / 5000) * 5000;

  document.getElementById('slideSgdDisplay').textContent = finalVal.toLocaleString('tr-TR') + ' TL';
  
  let label = 'Amatör';
  if(finalVal >= 500000) label = '★ Elit Yıldız Seviyesi';
  else if(finalVal >= 250000) label = '★ Olimpiyat Seviyesi';
  else if(finalVal >= 100000) label = '★ Gelişen Seviye';
  else label = '★ Temel Seviye';
  
  document.getElementById('slideSgdLabel').textContent = label;



  // Home Screen display update
  const homeDisplay = document.getElementById('dashValDisplay');
  if(homeDisplay) homeDisplay.textContent = '₺' + Math.round(finalVal / 1000) + 'K';
}

// Circular progress commitment updater
function updateMobileComm(){
  const circle = document.getElementById('commCircle');
  const text = document.getElementById('commText');
  const sub = document.getElementById('commSubText');

  if(!circle) return;

  if(mobUploadCount === 0){
    circle.setAttribute('stroke-dashoffset', '163.3'); // 0%
    text.textContent = 'Aylık Video Yükleme: 0 / 2';
    sub.innerHTML = 'Gecikme Cezası Riski: <span style="color:var(--red); font-weight:700;">%50</span>. Bu ay 2 video yüklenmelidir.';
  } else if(mobUploadCount === 1){
    circle.setAttribute('stroke-dashoffset', '81.65'); // 50%
    text.textContent = 'Aylık Video Yükleme: 1 / 2';
    sub.innerHTML = 'Gecikme Cezası Riski: %0. Bu ay son video için <strong>5 gününüz</strong> kaldı.';
  } else {
    circle.setAttribute('stroke-dashoffset', '0'); // 100%
    text.textContent = 'Aylık Video Yükleme: 2 / 2 (TAMAMLANDI ✓)';
    sub.innerHTML = '<span style="color:var(--green); font-weight:700;">Tebrikler!</span> Bu ayki sponsorluk taahhüdünüzü başarıyla tamamladınız.';
  }
}

// ----------------------- REVENUE SPLIT -----------------------
// Calculates the distribution of a total amount based on predefined percentages.
// Athlete: 75%, Federation: 5%, Representative (İl Temsilcisi): 5%, Club: 5%, Platform: 5%
function calculateRevenueSplit(totalAmount) {
  const percentages = {
    athlete: 0.75,
    federation: 0.05,
    representative: 0.05,
    club: 0.05,
    platform: 0.05
  };
  const split = {};
  let allocated = 0;
  for (const [role, pct] of Object.entries(percentages)) {
    split[role] = Math.round(totalAmount * pct);
    allocated += split[role];
  }
  // Adjust for rounding errors to ensure total == totalAmount
  const diff = totalAmount - allocated;
  if (diff !== 0) {
    // Add the remainder to the athlete share (largest share)
    split.athlete += diff;
  }
  return split;
}

function showRevenueSplit(amount) {
  const split = calculateRevenueSplit(amount);
  const info = `🟢 Sporcu: ${split.athlete.toLocaleString('tr-TR')} TL\n🔵 Federasyon: ${split.federation.toLocaleString('tr-TR')} TL\n🟠 İl Temsilcisi: ${split.representative.toLocaleString('tr-TR')} TL\n🟣 Kulüp: ${split.club.toLocaleString('tr-TR')} TL\n⚪ Platform: ${split.platform.toLocaleString('tr-TR')} TL`;
  alert(info);
}

function openTradeModalWithNameMobile(name) {
  const athlete = ATHLETES_MOB.find(a => a.name === name);
  if (athlete) {
    const amount = athlete.baseVal;
    showRevenueSplit(amount);
  }
  // Existing modal opening logic should follow here (omitted for brevity)
}
// Duplicate pg function removed (original pg retained)
function updateMobileComm(){
  const circle = document.getElementById('commCircle');
  const text = document.getElementById('commText');
  const sub = document.getElementById('commSubText');

  if(!circle) return;

  if(mobUploadCount === 0){
    circle.setAttribute('stroke-dashoffset', '163.3'); // 0%
    text.textContent = 'Aylık Video Yükleme: 0 / 2';
    sub.innerHTML = 'Gecikme Cezası Riski: <span style="color:var(--red); font-weight:700;">%50</span>. Bu ay 2 video yüklenmelidir.';
  } else if(mobUploadCount === 1){
    circle.setAttribute('stroke-dashoffset', '81.65'); // 50%
    text.textContent = 'Aylık Video Yükleme: 1 / 2';
    sub.innerHTML = 'Gecikme Cezası Riski: %0. Bu ay son video için <strong>5 gününüz</strong> kaldı.';
  } else {
    circle.setAttribute('stroke-dashoffset', '0'); // 100%
    text.textContent = 'Aylık Video Yükleme: 2 / 2 (TAMAMLANDI ✓)';
    sub.innerHTML = '<span style="color:var(--green); font-weight:700;">Tebrikler!</span> Bu ayki sponsorluk taahhüdünüzü başarıyla tamamladınız.';
    
    // Also update Sponsor view video counter
    const sponStatus = document.getElementById('sponVideo2Status');
    if(sponStatus) sponStatus.innerHTML = '<span>2. Video Durumu:</span><span style="color:var(--green); font-weight:700;">✓ AI Doğrulandı</span>';
  }
}

// 7. AI VIDEO SCANNER PROCESS
function triggerMobileScan(event){
  const file = event.target.files[0];
  if(!file) return;

  const widget = document.getElementById('aiScanWidget');
  const fill = document.getElementById('scanBarFill');
  const c1 = document.getElementById('scChk1');
  const c2 = document.getElementById('scChk2');
  const c3 = document.getElementById('scChk3');

  widget.style.display = 'block';
  fill.style.width = '0%';
  c1.innerHTML = '⚪ Süre Doğrulanıyor (Min 15 Saniye)...';
  c2.innerHTML = '⚪ Sponsor Marka Varlığı Aranıyor...';
  c3.innerHTML = '⚪ Sonuç: Bekleniyor...';

  setTimeout(() => fill.style.width = '100%', 50);

  // 1. Duration check
  setTimeout(() => {
    c1.innerHTML = '<span style="color:var(--green);">✓</span> Süre Doğrulandı (35 Saniye)';
  }, 900);

  // 2. Brand Detection
  setTimeout(() => {
    c2.innerHTML = '<span style="color:var(--green);">✓</span> Sponsor Markası (Yalçın Perik Yazılım) Tespit Edildi';
  }, 1800);

  // 3. Finalization
  setTimeout(() => {
    c3.innerHTML = '<span style="color:var(--green); font-weight:700;">✓ AI Taahhüt Onayı: BAŞARILI</span>';
    t('📹 Video başarıyla yüklendi ve AI tarafından doğrulandı! ✓');

    // Add to video listing in pg18
    const grid = document.getElementById('mobileVideoGrid');
    grid.innerHTML += `
      <div class="card" style="overflow:hidden;padding:0;margin-bottom:10px;" onclick="t('Video oynatılıyor...')">
        <div style="height:110px;background:linear-gradient(135deg,var(--blue),var(--purple));display:flex;align-items:center;justify-content:center;font-size:36px;position:relative;">💪<div style="position:absolute;bottom:8px;right:8px;background:rgba(0,0,0,.75);color:#fff;font-size:10px;padding:2px 7px;border-radius:6px;font-weight:700;">0:35</div><div style="position:absolute;top:8px;left:8px;background:rgba(0,200,140,.9);border-radius:6px;padding:2px 8px;font-size:9px;font-weight:700;color:#fff;">AI ONAYLANDI ✓</div></div>
        <div style="padding:10px 12px;"><div style="color:#fff;font-size:12px;font-weight:700;">Sponsorluk Katılım ve Tanıtım Seansı</div><div style="display:flex;gap:8px;margin-top:4px;"><span style="color:var(--muted);font-size:10px;">Bugün</span><span style="color:var(--muted);font-size:10px;">👁 Canlı</span></div></div>
      </div>
    `;

    mobUploadCount = 2;
    updateMobileComm();
  }, 2700);
}

// 8. BOURSE TRADE MODALS MOB
function openTradeModalMobile(){
  document.getElementById('tradeModalMobile').classList.add('op');
  mobModalTotalUpdate();
}
function openTradeModalWithNameMobile(name){
  const select = document.getElementById('mSelectAthlete');
  for(let i=0; i<select.options.length; i++){
    if(select.options[i].text.includes(name)){
      select.selectedIndex = i;
      break;
    }
  }
  mobModalPriceUpdate(select.value);
  openTradeModalMobile();
}
function closeTradeModalMobile(){
  document.getElementById('tradeModalMobile').classList.remove('op');
}
function mobModalPriceUpdate(val){
  let price = 350000;
  if(val === 'Yalçın') price = 500000;
  else if(val === 'Ömer') price = 350000;
  else if(val === 'Eyüp') price = 340000;
  else if(val === 'Yusra') price = 200000;
  else if(val === 'Hanen') price = 175000;
  document.getElementById('mModalBirimFiyat').textContent = price.toLocaleString('tr-TR') + ' TL';
  mobModalTotalUpdate();
}
function mobModalTotalUpdate(){
  const selectVal = document.getElementById('mSelectAthlete').value;
  let price = 350000;
  if(selectVal === 'Yalçın') price = 500000;
  else if(selectVal === 'Ömer') price = 350000;
  else if(selectVal === 'Eyüp') price = 340000;
  else if(selectVal === 'Yusra') price = 200000;
  else if(selectVal === 'Hanen') price = 175000;

  const monthly = Math.round(price / 14);
  document.getElementById('mModalTotalSum').textContent = monthly.toLocaleString('tr-TR') + ' TL/ay';
}
function executeTradeMob(){
  const select = document.getElementById('mSelectAthlete');
  const name = select.options[select.selectedIndex].text.split('(')[0].trim();
  const val = select.value;
  let price = 350000;
  if(val === 'Yalçın') price = 500000;
  else if(val === 'Ömer') price = 350000;
  else if(val === 'Eyüp') price = 340000;
  else if(val === 'Yusra') price = 200000;
  else if(val === 'Hanen') price = 175000;

  t(`✓ ${name} için ${price.toLocaleString('tr-TR')} TL değerli sponsorluk anlaşması başlatıldı ve teklif gönderildi!`);
  closeTradeModalMobile();
}

// 9. GOOGLE LOGIN MOBILE
let _gTarget = 'pg4';
function openGoogleModal(userType, target){
  _gTarget = target;
  document.getElementById('googleModal').classList.add('show');
}
function closeGoogleModal(){
  document.getElementById('googleModal').classList.remove('show');
}
function selectGoogleAccMob(email){
  closeGoogleModal();
  t('Hesap doğrulandı: ' + email);
  setTimeout(() => pg(_gTarget), 500);
}

// 10. SMS DOĞRULAMA MOB
let _sTarget = 'pg4';
function openSmsModal(target){
  _sTarget = target;
  document.getElementById('smsPhoneLabel').textContent = 'Kodu Girin: 1234';
  ['s1', 's2', 's3', 's4'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('smsModal').classList.add('show');
  setTimeout(() => document.getElementById('s1').focus(), 150);
}
function closeSmsModal(){
  document.getElementById('smsModal').classList.remove('show');
}
function smsInpNext(el, nextId){
  if(el.value.length === 1){
    document.getElementById(nextId).focus();
  }
}
function smsInpVerify(){
  const code = ['s1', 's2', 's3', 's4'].map(id => document.getElementById(id).value).join('');
  if(code === '1234'){
    closeSmsModal();
    t('✓ Telefon doğrulandı!');
    setTimeout(() => pg(_sTarget), 500);
  } else {
    t('Hatalı kod. 1234 yazın.');
  }
}

// 11. PROFILE SETTINGS
function saveProfileMob(){
  const ad = document.getElementById('mobProfAd').value;
  const soyad = document.getElementById('mobProfSoyad').value;
  const sehir = document.getElementById('mobProfSehir').value;
  const brans = document.getElementById('mobProfBrans').value;
  const yas = document.getElementById('mobProfYas').value;

  t('✓ Profil kaydedildi!');
  pg('pg4');
}

function simProfileImageMob(event){
  const file = event.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById('mobProfilePic').innerHTML = `<img src="${e.target.result}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
    t('✓ Profil resmi güncellendi!');
  };
  reader.readAsDataURL(file);
}

// 12. GEOLOCATION POSITIONER
function openMaps(){
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(pos => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
        .then(r => r.json())
        .then(d => {
          const city = d.address.city || d.address.town || d.address.state || 'Samsun';
          document.getElementById('cityName').textContent = city;
          t('📍 Konum güncellendi: ' + city);
        }).catch(() => {});
    });
  }
}

// 13. PDF SIM DOWNLOADER
function G20PDF(type){
  t('📄 PDF hazırlanıyor ve indiriliyor...');
  setTimeout(() => {
    const link = document.createElement('a');
    link.href = 'data:application/pdf;base64,' + PDF_RAW_DATA.s;
    link.download = type==='sp' ? 'Y_SPORTS_Sponsor_Sözleşmesi.pdf' : 'Y_SPORTS_Temsilci_Sözleşmesi.pdf';
    link.click();
    t('✓ Sözleşme başarıyla indirildi!');
  }, 1000);
}

// 15. DYNAMIC TURKEY SPORTS BRANCHES (63 BRANŞ) LIST & CONTROLLER
const CATS_MOB = [
  { id:'bireysel', icon:'🏅', label:'Bireysel Sporlar', cls:'bireysel', sports:[
    {e:'🏹',n:'Okçuluk'},{e:'🧭',n:'Oryantiring'},{e:'🏃',n:'Atletizm'},
    {e:'🏸',n:'Badminton'},{e:'🥊',n:'Boks'},{e:'🤸',n:'Cimnastik'},
    {e:'⚔️',n:'Eskrim'},{e:'⛳',n:'Golf'},{e:'🤼',n:'Güreş'},
    {e:'🏋️',n:'Halter'},{e:'🥋',n:'Judo'},{e:'🥋',n:'Karate'},
    {e:'🦵',n:'Kick Boks'},{e:'🧘',n:'Muay Thai'},{e:'🏓',n:'Masa Tenisi'},
    {e:'🎾',n:'Tenis'},{e:'🏊',n:'Triatlon'},{e:'💪',n:'Vücut Geliştirme'},
    {e:'🎯',n:'Pentatlon'},{e:'🔫',n:'Atıcılık'},{e:'🧗',n:'Dağcılık'},
  ]},
  { id:'takim', icon:'👥', label:'Takım Sporları', cls:'takim', sports:[
    {e:'🏀',n:'Basketbol'},{e:'🏐',n:'Voleybol'},{e:'🤾',n:'Hentbol'},
    {e:'🏉',n:'Ragbi'},{e:'🤽',n:'Sutopu'},{e:'🏑',n:'Hokey'},
    {e:'🏒',n:'Buz Hokeyi'},
  ]},
  { id:'su', icon:'🌊', label:'Su & Deniz Sporları', cls:'su', sports:[
    {e:'🏊',n:'Yüzme'},{e:'🤿',n:'Sualtı'},
    {e:'🚣',n:'Kürek'},{e:'🛶',n:'Kano'},{e:'⛵',n:'Yelken'},
  ]},
  { id:'motor', icon:'🚗', label:'Motor Sporları', cls:'motor', sports:[
    {e:'🏎️',n:'Otomobil'},{e:'🏍️',n:'Motorsiklet'},
  ]},
  { id:'kis', icon:'❄️', label:'Kış & Buz Sporları', cls:'kis', sports:[
    {e:'⛷️',n:'Kayak'},{e:'⛸️',n:'Buz Pateni'},{e:'🥌',n:'Curling'},
  ]},
  { id:'geleneksel', icon:'🏹', label:'Geleneksel Sporlar', cls:'geleneksel', sports:[
    {e:'🏹',n:'Geleneksel Okçuluk'},{e:'🐎',n:'Atlı Sporlar'},
    {e:'🤼',n:'Karakucak Güreşi'},{e:'💃',n:'Halk Oyunları'},
    {e:'🎽',n:'Geleneksel Sporlar'},
  ]},
  { id:'wushu', icon:'🥋', label:'Dövüş Sanatları', cls:'wushu', sports:[
    {e:'🥋',n:'Taekwondo'},{e:'🥋',n:'Wushu Kungfu'},
  ]},
  { id:'engelli', icon:'♿', label:'Engelli Sporları', cls:'engelli', sports:[
    {e:'♿',n:'Bedensel Engelliler'},{e:'👁️',n:'Görme Engelliler'},
    {e:'👂',n:'İşitme Engelliler'},{e:'⭐',n:'Özel Sporcular'},
  ]},
  { id:'diger', icon:'🎯', label:'Diğer & Gelişen', cls:'diger', sports:[
    {e:'🎮',n:'E-Spor'},{e:'🛹',n:'Kaykay'},{e:'🪂',n:'Hava Sporları'},
    {e:'🧭',n:'İzcilik'},{e:'💃',n:'Dans'},{e:'🎳',n:'Bocce Bowling'},
    {e:'🎱',n:'Bilardo'},{e:'🏇',n:'Binicilik'},{e:'🚴',n:'Bisiklet'},
    {e:'♟️',n:'Satranç'},{e:'🎓',n:'Üniversite Sporları'},{e:'🤝',n:'Herkes İçin Spor'},
    {e:'🃏',n:'Briç'},{e:'🏊',n:'Gelişen Branşlar'},
  ]},
];

let openCatsMob = new Set(['bireysel']);
let searchSportsQ = '';

function renderSportsMob(){
  const container = document.getElementById('sportsListMobContainer');
  if(!container) return;
  
  const q = searchSportsQ.toLowerCase();
  let html = '';
  
  CATS_MOB.forEach(cat => {
    const filtered = q ? cat.sports.filter(s => s.n.toLowerCase().includes(q)) : cat.sports;
    if(!filtered.length) return;
    
    const isOpen = openCatsMob.has(cat.id) || q.length > 0;
    
    html += `
      <div class="cat-section" style="margin-bottom:10px;">
        <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.02); border:1px solid var(--border); border-radius:12px; padding:10px 12px; cursor:pointer;" onclick="toggleCatMob('${cat.id}')">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:16px;">${cat.icon}</span>
            <span style="font-size:12.5px; font-weight:700; color:#fff;">${cat.label}</span>
          </div>
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="background:rgba(99,57,255,0.15); border-radius:10px; padding:2px 8px; font-size:9.5px; color:var(--pur-light); font-weight:700;">${filtered.length}</span>
            <span style="color:var(--dim); font-size:12px; transform:${isOpen?'rotate(90deg)':'rotate(0deg)'}; transition:transform 0.2s; display:inline-block;">›</span>
          </div>
        </div>
    `;
    
    if(isOpen){
      html += `
        <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:6px; margin-top:6px;">
      `;
      filtered.forEach(s => {
        html += `
          <div style="background:var(--card); border:1px solid var(--border); border-radius:12px; padding:8px 4px; text-align:center; cursor:pointer; transition:transform 0.1s;" onclick="selectBranchMob('${s.n}')">
            <div style="font-size:18px; margin-bottom:3px;">${s.e}</div>
            <div style="font-size:9.5px; color:#c8d8ff; font-weight:600; line-height:1.2;">${s.n}</div>
          </div>
        `;
      });
      html += `</div>`;
    }
    
    html += `</div>`;
  });
  
  container.innerHTML = html;
}

function toggleCatMob(id){
  if(openCatsMob.has(id)) openCatsMob.delete(id);
  else openCatsMob.add(id);
  renderSportsMob();
}

function filterSportsMob(val){
  searchSportsQ = val;
  renderSportsMob();
}

// 64 Spor Dalı İçin Özel Nitelik Veritabanı ve Akıllı Üreteç
function getBranchSpecs(branchName) {
  // Popüler olimpik ve ulusal branşların el yapımı premium tanımlamaları
  const customSpecs = {
    'Okçuluk': {
      olimpik: true,
      pop: 88,
      butce: 180000,
      reqs: ['Odak & Konsantrasyon', 'Zihinsel İstikrar', 'Üst Vücut Gücü'],
      lic: 'Resmi TOF Okçuluk Lisansı'
    },
    'Atletizm': {
      olimpik: true,
      pop: 95,
      butce: 250000,
      reqs: ['Hız & Patlayıcı Güç', 'Kas Dayanıklılığı', 'Kardiyovasküler Kapasite'],
      lic: 'TAF Atletizm Sporcu Lisansı'
    },
    'Boks': {
      olimpik: true,
      pop: 91,
      butce: 200000,
      reqs: ['Refleks & Reaksiyon', 'Kondisyon', 'Taktik Zeka'],
      lic: 'Türkiye Boks Federasyonu Lisansı'
    },
    'Karate': {
      olimpik: false,
      pop: 89,
      butce: 160000,
      reqs: ['Esneklik & Denge', 'Disiplin & Odak', 'Hızlı Reaksiyon'],
      lic: 'TKF Karate-Do Sporcu Lisansı'
    },
    'Tenis': {
      olimpik: true,
      pop: 94,
      butce: 240000,
      reqs: ['Çeviklik & Koordinasyon', 'El-Göz Koordinasyonu', 'Aerobik Güç'],
      lic: 'TTF Tenis Oyuncu Lisansı'
    },
    'Basketbol': {
      olimpik: true,
      pop: 96,
      butce: 220000,
      reqs: ['Dikey Sıçrama & Güç', 'Takım Taktik Bilgisi', 'El-Göz Koordinasyonu'],
      lic: 'TBF Altyapı Sporcu Lisansı'
    },
    'Voleybol': {
      olimpik: true,
      pop: 97,
      butce: 230000,
      reqs: ['Reaksiyon Hızı', 'Esneklik & Sıçrama', 'Takım Uyumu'],
      lic: 'TVF Resmi Sporcu Lisansı'
    },
    'Yüzme': {
      olimpik: true,
      pop: 93,
      butce: 210000,
      reqs: ['Tüm Vücut Kondisyonu', 'Akciğer Kapasitesi', 'Kas Dayanıklılığı'],
      lic: 'TYF Yüzme Sporcu Vizeli Lisansı'
    },
    'E-Spor': {
      olimpik: false,
      pop: 92,
      butce: 150000,
      reqs: ['APM (Reaksiyon Hızı)', 'Stratejik Planlama', 'Bilişsel Odak'],
      lic: 'TÜSFED Dijital Sporcu Lisansı'
    },
    'Satranç': {
      olimpik: false,
      pop: 85,
      butce: 110000,
      reqs: ['Derin Hesaplama', 'Zihinsel Dayanıklılık', 'Stratejik Öngörü'],
      lic: 'TSF Resmi Satranç Sporcu Lisansı'
    }
  };

  // Eğer branş özel olarak tanımlanmışsa onu dön
  if (customSpecs[branchName]) {
    return customSpecs[branchName];
  }

  // Diğer branşlar için deterministik akıllı üreteç (Branş isminin hash'ine göre)
  let hash = 0;
  for (let i = 0; i < branchName.length; i++) {
    hash = branchName.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  const isOlimpik = (hash % 3) !== 0;
  const popularity = 70 + (hash % 23);
  const budget = Math.round((45000 + (hash % 13) * 10000) / 5000) * 5000;

  const reqPool = [
    'Dayanıklılık', 'Reaksiyon Hızı', 'Kondisyon', 'Odak & Sabır', 
    'Esneklik', 'Çeviklik', 'Denge & Stabilite', 'Taktik Zeka', 
    'Stratejik Düşünce', 'El-Göz Koordinasyonu', 'Patlayıcı Güç',
    'Akciğer Kapasitesi', 'Bilişsel Odak', 'Zihinsel Dayanıklılık'
  ];
  const reqs = [];
  const reqIdx1 = hash % reqPool.length;
  const reqIdx2 = (hash + 5) % reqPool.length;
  const reqIdx3 = (hash + 11) % reqPool.length;
  reqs.push(reqPool[reqIdx1]);
  if (reqIdx2 !== reqIdx1) reqs.push(reqPool[reqIdx2]);
  if (reqIdx3 !== reqIdx1 && reqIdx3 !== reqIdx2 && reqs.length < 3) reqs.push(reqPool[reqIdx3]);

  const license = `Türkiye ${branchName} Federasyonu Resmi Lisansı`;

  return {
    olimpik: isOlimpik,
    pop: popularity,
    butce: budget,
    reqs: reqs,
    lic: license
  };
}

function selectBranchMob(branchName){
  document.getElementById('sportsSelectedAthletesContainer').style.display = 'block';
  document.getElementById('selBrTitle').textContent = `🏃 ${branchName} Branşındaki Sporcular`;
  
  // Fetch branch specs
  const specs = getBranchSpecs(branchName);
  
  // Fill specifications card
  document.getElementById('brSpecName').textContent = `📊 ${branchName} Branş Analizi`;
  
  const budgetEl = document.getElementById('brSpecBudget');
  budgetEl.textContent = '₺' + specs.butce.toLocaleString('tr-TR');
  
  const olimpikBadge = document.getElementById('brSpecOlimpikBadge');
  if(specs.olimpik) {
    olimpikBadge.textContent = '🏅 OLİMPİK BRANŞ';
    olimpikBadge.style.background = 'rgba(59,130,246,0.15)';
    olimpikBadge.style.color = '#60a5fa';
    olimpikBadge.style.border = '1px solid rgba(59,130,246,0.3)';
  } else {
    olimpikBadge.textContent = '🎗️ ULUSAL BRANŞ';
    olimpikBadge.style.background = 'rgba(192,132,252,0.15)';
    olimpikBadge.style.color = '#c084fc';
    olimpikBadge.style.border = '1px solid rgba(192,132,252,0.3)';
  }
  
  document.getElementById('brSpecLicence').textContent = specs.lic;
  document.getElementById('brSpecPopVal').textContent = `%${specs.pop}`;
  document.getElementById('brSpecPopBar').style.width = `${specs.pop}%`;
  
  // Render requirements badges
  const reqsContainer = document.getElementById('brSpecReqs');
  let reqsHtml = '';
  specs.reqs.forEach(req => {
    reqsHtml += `<span class="tag tag-blue" style="margin: 0; padding: 2px 6px; font-size: 8.5px; background: rgba(99,57,255,0.15); color: var(--pur-light); border: 1px solid rgba(99,57,255,0.25);">${req}</span>`;
  });
  reqsContainer.innerHTML = reqsHtml;

  // Filter athletes
  const filtered = ATHLETES_MOB.filter(a => a.branch.includes(branchName));
  const container = document.getElementById('brAthleteListMob');
  
  if(filtered.length === 0){
    container.innerHTML = `
      <div style="background:rgba(255,255,255,0.02); border:1px dashed rgba(234, 179, 8, 0.4); border-radius:14px; padding:16px; text-align:center; color:var(--muted); font-size:11px; margin-top:8px;">
        <span style="font-size:24px; display:block; margin-bottom:6px;">💪</span>
        <strong style="color:var(--gold); display:block; margin-bottom:4px;">Bu Branşta Yeni Yetenekler Aranıyor!</strong>
        Samsun Belediyesi Teşvik Fonu desteğiyle (<strong>₺${specs.butce.toLocaleString('tr-TR')} bütçe aktif</strong>) sporcu kaydı yapmak için profil ayarlarından branşınızı güncelleyin.
      </div>
    `;
  } else {
    let html = '';
    filtered.forEach(a => {
      const isAraniyor = a.status.includes('Aranıyor');
      html += `
        <div class="athlete-item" style="padding: 10px; background:var(--card); border: 1px solid var(--border); border-radius: 12px; margin-top: 6px; display:flex; align-items:center; justify-content:space-between; cursor:pointer;" onclick="openTradeModalWithNameMobile('${a.name}')">
          <div style="width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,0.05);display:flex;align-items:center;justify-content:center;font-size:16px;">${a.av}</div>
          <div style="flex:1; margin-left:10px; min-width:0;">
            <div style="font-size:11.5px; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${a.name}</div>
            <div style="font-size:9px; color:var(--muted); margin-top:2px;">SGS: ${a.sgs} · Samsun</div>
          </div>
          <div style="text-align:right;">
            <div style="font-family:'Bebas Neue'; font-size:16px; color:var(--gold);">${a.baseVal.toLocaleString('tr-TR')} TL</div>
            <div style="font-size:9px; font-weight:700; color:${isAraniyor?'var(--red)':'var(--green)'};">${a.status}</div>
          </div>
        </div>
      `;
    });
    container.innerHTML = html;
  }
  
  // Scroll to show results
  setTimeout(() => {
    document.getElementById('sportsSelectedAthletesContainer').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
}

function resetBranchFilterMob(){
  document.getElementById('sportsSelectedAthletesContainer').style.display = 'none';
  t('Tüm branş filtreleri sıfırlandı.');
}

// 13.5 ATHLETE DIRECT LIST & SEARCH FOR PG7
let searchAthleteQ = '';
function buildAthletesListMob() {
  const container = document.getElementById('athletesListMobContainer');
  if(!container) return;
  
  const q = searchAthleteQ.toLowerCase().trim();
  let html = '';
  
  const filtered = ATHLETES_MOB.filter(a => {
    return a.name.toLowerCase().includes(q) || 
           a.branch.toLowerCase().includes(q) || 
           a.city.toLowerCase().includes(q);
  });
  
  if(filtered.length === 0) {
    html = `
      <div style="background:rgba(255,255,255,0.02); border:1px dashed var(--border); border-radius:14px; padding:24px; text-align:center; color:var(--muted); font-size:11px; margin-top:10px;">
        🔍 Arama kriterlerine uygun sporcu bulunamadı.
      </div>
    `;
  } else {
    filtered.forEach(a => {
      const isAraniyor = a.status.includes('Aranıyor');
      html += `
        <div class="athlete-item" style="padding:10px; background:var(--card); border: 1px solid var(--border); border-radius: 12px; margin-bottom: 6px; display:flex; align-items:center; justify-content:space-between; cursor:pointer;" onclick="openTradeModalWithNameMobile('${a.name}')">
          <div style="width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,0.05);display:flex;align-items:center;justify-content:center;font-size:16px;">${a.av}</div>
          <div style="flex:1; margin-left:10px; min-width:0;">
            <div style="font-size:11.5px; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${a.name}
              <span class="tag tag-blue" style="margin:0 0 0 6px; font-size:8px; padding:1px 5px;">SGS: ${a.sgs}</span>
            </div>
            <div style="font-size:9px; color:var(--muted); margin-top:2px;">${a.branch} · ${a.city}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-family:'Bebas Neue'; font-size:16px; color:var(--gold);">${a.baseVal.toLocaleString('tr-TR')} TL</div>
            <div style="font-size:9px; font-weight:700; color:${isAraniyor ? 'var(--red)' : 'var(--green)'}; margin-top:2px;">${a.status}</div>
          </div>
        </div>
      `;
    });
  }
  container.innerHTML = html;
}

function filterAthletesMob(val) {
  searchAthleteQ = val;
  buildAthletesListMob();
}

// ============================================
// 15. GİYİLEBİLİR CİHAZ & BİYO-GÜÇ SİMÜLASYONU
// ============================================
let isWearableConnected = false;
let connectedDevice = '';
let burntCalories = 0;
let calorieGoal = 1000;
let isCalorieConverted = false;

function openWearableModal() {
  const modal = document.getElementById('wearableModal');
  if(!modal) return;
  modal.style.display = 'flex';
  document.getElementById('wearableDevicesList').style.display = 'flex';
  document.getElementById('wearableConnectingStatus').style.display = 'none';
}

function closeWearableModal() {
  const modal = document.getElementById('wearableModal');
  if(modal) modal.style.display = 'none';
}

function startWearableSimConnection(deviceKey, deviceLabel) {
  document.getElementById('wearableDevicesList').style.display = 'none';
  const statusDiv = document.getElementById('wearableConnectingStatus');
  statusDiv.style.display = 'block';
  
  const textDiv = document.getElementById('wearableConnectingText');
  textDiv.textContent = `${deviceKey} ile şifreli biyometrik veri kanalı açılıyor...`;
  
  setTimeout(() => {
    textDiv.textContent = `Kalori ve aktif antrenman verileri senkronize ediliyor...`;
    
    setTimeout(() => {
      isWearableConnected = true;
      connectedDevice = deviceLabel;
      burntCalories = 0;
      isCalorieConverted = false;
      
      // Update UI
      document.getElementById('wearableStatusBadge').textContent = 'Eşleşti ✓';
      document.getElementById('wearableStatusBadge').className = 'tag tag-green';
      document.getElementById('wearableStatusBadge').style.background = 'rgba(16, 185, 129, 0.15)';
      document.getElementById('wearableStatusBadge').style.color = '#34d399';
      document.getElementById('wearableStatusBadge').style.borderColor = 'rgba(16, 185, 129, 0.3)';
      
      document.getElementById('wearableConnectArea').style.display = 'none';
      document.getElementById('wearableTrackingArea').style.display = 'flex';
      document.getElementById('wearableSimButtons').style.display = 'grid';
      
      document.getElementById('connectedDeviceName').textContent = deviceLabel;
      document.getElementById('burntCaloriesDisplay').textContent = '0';
      document.getElementById('caloriePercentText').textContent = '%0';
      document.getElementById('calorieCircle').style.strokeDashoffset = '138.2';
      
      document.getElementById('biopowerPrompt').innerHTML = `🔋 Biyo-Güç toplanıyor... Ne kadar çok güç, o kadar iyi kazanç ve madalya! 🏅`;
      document.getElementById('biopowerPrompt').style.color = '#34d399';
      document.getElementById('biopowerPrompt').style.borderLeftColor = '#10b981';
      
      document.getElementById('btnConvertCalorie').style.opacity = '1';
      document.getElementById('btnConvertCalorie').disabled = false;
      
      closeWearableModal();
      t(`✓ ${deviceKey} başarıyla entegre edildi!`);
    }, 1000);
  }, 1000);
}

function simulateAntrenmanCalorie() {
  if(!isWearableConnected) return;
  if(isCalorieConverted) {
    t('⚠️ Kaloriler zaten dönüştürüldü! Yeni antrenman seansı için cihazı yeniden bağlayın.');
    return;
  }
  
  if(burntCalories >= calorieGoal) {
    t('🔥 Günlük maksimum Biyo-Güç limitine ulaştınız! Gücü hemen dönüştürebilirsiniz.');
    return;
  }
  
  // Add deterministic random calories
  const inc = Math.round(150 + Math.random() * 100);
  burntCalories = Math.min(burntCalories + inc, calorieGoal);
  
  // Update UI Calorie display
  document.getElementById('burntCaloriesDisplay').textContent = burntCalories;
  
  const pct = Math.round((burntCalories / calorieGoal) * 100);
  document.getElementById('caloriePercentText').textContent = `%${pct}`;
  
  // Update SVG dashoffset
  const offset = 138.2 - (138.2 * pct) / 100;
  document.getElementById('calorieCircle').style.strokeDashoffset = offset;
  
  // Update prompts with dynamic messages
  const promptEl = document.getElementById('biopowerPrompt');
  if(burntCalories >= calorieGoal) {
    promptEl.innerHTML = `🌟 <strong>Efsanevi Güç Limiti!</strong> Kazanç ve Madalya Çarpanı Aktif! 🏋️‍♂️`;
    promptEl.style.color = '#eab308';
    promptEl.style.borderLeftColor = '#eab308';
    t('✓ Maksimum enerji hedefine ulaşıldı! Gücü kazanca dönüştürmeye hazırsınız!');
  } else if(pct >= 80) {
    promptEl.innerHTML = `⚡ <strong>Hadi biraz daha az kaldı!</strong> Hedefe çok yaklaştın! (Kalan: ${calorieGoal - burntCalories} kcal)`;
    promptEl.style.color = '#3b82f6';
    promptEl.style.borderLeftColor = '#3b82f6';
  } else if(pct >= 50) {
    promptEl.innerHTML = `🏃 <strong>Güç = Kazanç ve Madalya!</strong> Isınma bitti, tempoyu arttır! 🏅`;
    promptEl.style.color = '#a78bfa';
    promptEl.style.borderLeftColor = '#a78bfa';
  } else {
    promptEl.innerHTML = `🔋 Biyo-Güç toplanıyor... Ne kadar çok güç, o kadar iyi kazanç ve madalya! 🏅`;
    promptEl.style.color = '#34d399';
    promptEl.style.borderLeftColor = '#10b981';
  }
  
  t(`🏃 Antrenman yapıldı: +${inc} kcal yakıldı!`);
}

function convertCaloriesToEarnings() {
  if(!isWearableConnected) return;
  if(isCalorieConverted) return;
  if(burntCalories === 0) {
    t('⚠️ Dönüştürecek biyo-güç (kalori) bulunmuyor. Önce biraz antrenman yapmalısınız!');
    return;
  }
  
  isCalorieConverted = true;
  
  // Read dynamic performance variables
  const sgs = parseInt(document.getElementById('slSgs').value) || 85;
  const medals = parseInt(document.getElementById('slMedal').value) || 6;
  const media = parseInt(document.getElementById('slMedia').value) || 42;
  const videoFactor = mobUploadCount >= 2 ? 1.5 : 1.0;
  
  // Active sport branch specific multiplier (Karate = 1.5)
  const multiplier = 1.5; 
  
  // Calculate Performans Değer Artış Puanı (TL/Nakit para içermeyen saf değerleme endeksi)
  const valueIndexBonus = Math.round(burntCalories * multiplier * (sgs / 100) * (1 + medals * 0.1) * (1 + media / 100) * videoFactor);
  
  // Organic Reputational SGS Increase (Maç Puanı Artışı - Max 100)
  const sgsIncrease = Math.min(10, 100 - sgs);
  const newSgs = sgs + sgsIncrease;
  
  // Update SGS Slider & Recalculate SGD
  document.getElementById('slSgs').value = newSgs;
  document.getElementById('slSgsVal').textContent = newSgs;
  
  // Recalculate displays
  recalcSgdSim();
  buildAthletesListMob();
  
  // Disable conversion button
  const btn = document.getElementById('btnConvertCalorie');
  btn.style.opacity = '0.5';
  btn.disabled = true;
  
  // Update status badge to "Doğrulandı"
  document.getElementById('wearableStatusBadge').textContent = 'Doğrulandı ✓';
  document.getElementById('wearableStatusBadge').style.background = 'rgba(16, 185, 129, 0.15)';
  document.getElementById('wearableStatusBadge').style.color = '#34d399';
  document.getElementById('wearableStatusBadge').style.borderColor = 'rgba(16, 185, 129, 0.3)';
  
  document.getElementById('biopowerPrompt').innerHTML = `📈 <strong>Performans Değer Endeksi Artışı: +${valueIndexBonus.toLocaleString('tr-TR')} Puan!</strong> Biyo-Güç, Paylaşım Videoları, Maç Puanları ve Sosyal Medya Etkileşimi başarıyla doğrulandı! Maç Puanı (SGS): <strong>+${sgsIncrease} puan eklendi!</strong> 🏅`;
  document.getElementById('biopowerPrompt').style.color = '#34d399';
  document.getElementById('biopowerPrompt').style.borderLeftColor = '#10b981';
  
  t(`🏆 DEĞER ARTIŞI DOĞRULANDI! \nBiyo-Performans Endeksi: +${valueIndexBonus.toLocaleString('tr-TR')} Puan! \nMaç Puanı (SGS) Artışı: +${sgsIncrease}`);
}

// ============================================
// 16. GİZLİLİK DOSTU AI SOSYAL MEDYA TAKİPÇİSİ
// ============================================
let isSocialScanned = false;

function triggerSocialLinkScan() {
  const url = document.getElementById('socialLinkInput').value.trim();
  if(!url) {
    t('⚠️ Lütfen doğrulamak istediğiniz Instagram veya TikTok gönderi linkini girin!');
    return;
  }
  
  if(isSocialScanned) {
    t('⚠️ Bu paylaşım zaten doğrulandı ve Medya Yönetimi katsayınız güncellendi!');
    return;
  }
  
  // Reset elements
  document.getElementById('socialScanStatus').style.display = 'block';
  document.getElementById('socialScanSpinner').style.display = 'block';
  document.getElementById('socialScanText').textContent = 'Gönderi Linki Analiz Ediliyor...';
  
  const soc1 = document.getElementById('socChk1');
  const soc2 = document.getElementById('socChk2');
  const soc3 = document.getElementById('socChk3');
  const soc4 = document.getElementById('socChk4');
  
  soc1.innerHTML = `⚪ Gönderi açık verileri çekiliyor...`;
  soc1.style.color = 'var(--muted)';
  soc2.innerHTML = `⚪ @ysports etiket veya hashtag araması...`;
  soc2.style.color = 'var(--muted)';
  soc3.innerHTML = `⚪ Vision AI: Logo & Yüz tanıma...`;
  soc3.style.color = 'var(--muted)';
  soc4.innerHTML = `⚪ Durum: Bekleniyor...`;
  soc4.style.color = 'var(--muted)';
  
  // Step 1: Fetching metadata
  setTimeout(() => {
    soc1.innerHTML = `🟢 Gönderi açık verileri başarıyla çekildi (Gizlilik Dostu) ✓`;
    soc1.style.color = '#34d399';
    document.getElementById('socialScanText').textContent = 'AI Metin Analizi Yapılıyor...';
    
    // Step 2: NLP search for Y SPORTS tags
    setTimeout(() => {
      soc2.innerHTML = `🟢 Açıklamada @ysports etiketi başarıyla doğrulandı ✓`;
      soc2.style.color = '#34d399';
      document.getElementById('socialScanText').textContent = 'Vision AI Görsel Tarama Yapılıyor...';
      
      // Step 3: Vision AI Logo detection
      setTimeout(() => {
        soc3.innerHTML = `🟢 Vision AI: Görseldeki Y SPORTS logoları başarıyla eşleşti ✓`;
        soc3.style.color = '#34d399';
        document.getElementById('socialScanText').textContent = 'Doğrulama Sonuçlandırılıyor...';
        
        // Step 4: Finalize
        setTimeout(() => {
          isSocialScanned = true;
          document.getElementById('socialScanSpinner').style.display = 'none';
          document.getElementById('socialScanText').textContent = 'Paylaşım Başarıyla Doğrulandı!';
          
          soc4.innerHTML = `🏆 Sonuç: %100 DOĞRULANDI! Medya Yönetimi Puanı Arttı!`;
          soc4.style.color = '#eab308';
          
          // Organic Media Score Increase (+15)
          const currentMedia = parseInt(document.getElementById('slMedia').value) || 42;
          const mediaIncrease = Math.min(15, 100 - currentMedia);
          const newMedia = currentMedia + mediaIncrease;
          
          document.getElementById('slMedia').value = newMedia;
          document.getElementById('slMediaVal').textContent = newMedia + 'K';
          
          // Trigger recalculations
          recalcSgdSim();
          buildAthletesListMob();
          
          t(`🏆 SOSYAL ETKİLEŞİM DOĞRULANDI! \nMedya Yönetimi Puanı: +${mediaIncrease} puan! \nSponsorluk Değer Endeksiniz yükseldi!`);
        }, 1500);
      }, 1500);
    }, 1500);
  }, 1500);
}

// ============================================
// 17. UNICORN SEVİYESİ DİJİTAL SÖZLEŞME MODÜLÜ
// ============================================
// ============================================
// 17. UNICORN SEVİYESİ DİJİTAL SÖZLEŞME MODÜLÜ
// ============================================
function getDynamicContractText(role) {
  // Aktif sporcuyu bul (varsayılan Ömer Yılmaz)
  let activeAthlete = ATHLETES_MOB[1];
  
  // Eğer profil ayarlarında isim güncellendiyse onu yansıt
  const profAd = document.getElementById('mobProfAd') ? document.getElementById('mobProfAd').value.trim() : 'Ömer';
  const profSoyad = document.getElementById('mobProfSoyad') ? document.getElementById('mobProfSoyad').value.trim() : 'Yılmaz';
  const profBrans = document.getElementById('mobProfBrans') ? document.getElementById('mobProfBrans').value.trim() : 'Karate';
  const profSehir = document.getElementById('mobProfSehir') ? document.getElementById('mobProfSehir').value.trim() : 'Samsun';
  const profYas = document.getElementById('mobProfYas') ? document.getElementById('mobProfYas').value : '11';
  
  const athleteName = profAd + " " + profSoyad;
  const athleteBranch = profBrans;
  const athleteCity = profSehir;
  const athleteAge = profYas;
  
  // Branşa uygun federasyon adı
  const federationName = `Türkiye ${athleteBranch} Federasyonu`;
  
  // Branşa uygun kulüp adı
  const clubName = `Samsun ${athleteBranch} İhtisas Spor Kulübü`;
  
  // SGS ve SGD değerleri
  const sgs = document.getElementById('slSgs') ? document.getElementById('slSgs').value : activeAthlete.sgs;
  const sgd = document.getElementById('slideSgdDisplay') ? document.getElementById('slideSgdDisplay').textContent : (activeAthlete.baseVal.toLocaleString('tr-TR') + ' TL');
  
  // Sponsor adı
  const sponsorName = "Yalçın Perik Yazılım A.Ş.";
  
  if (role === 'sporcu') {
    return {
      title: `🏃 ${athleteName} - Profesyonel Sporcu Sözleşmesi`,
      docType: `YS-${athleteBranch.toUpperCase()}-ATHLETE-AGREEMENT`,
      docId: `DOCID: YS-2026-${athleteBranch.substring(0,3).toUpperCase()}-ATH-${sgs}S`,
      text: `<b>Y SPORTS AKILLI ŞEHİR SPORCU GELİŞİM VE SPONSORLUK ANLAŞMASI</b><br><br>
<b>TARAFLAR:</b><br>
İşbu sözleşme, bir tarafta Y SPORTS Gelişim ve Değerleme Platformu (bundan böyle "Platform" olarak anılacaktır) ile diğer tarafta biyo-performans verileri doğrulanmış Lisanslı Amatör Sporcu <b>${athleteName}</b> (bundan böyle "Sporcu" olarak anılacaktır) arasında aşağıdaki şartlar çerçevesinde akdedilmiştir.<br><br>
<b>MADDE 1 - SÖZLEŞMENİN AMACI:</b><br>
Sözleşmenin amacı, Sporcu'nun Platform üzerindeki doğrulanabilir antrenman, biyo-güç (aktif kalori) ve sosyal etkileşim verilerini Y SPORTS standartlarına uygun olarak sunması karşılığında; Platform tarafından sağlanan AI Akıllı Eşleştirme Sistemi aracılığıyla profesyonel sponsorluk ve belediye altyapı teşvik fonlarına (güncel <b>SGD Piyasa Değeri: ${sgd}</b> ve <b>SGS Gelişim Skoru: ${sgs}</b> kapsamında) erişim hakkı kazanmasıdır.<br><br>
<b>MADDE 2 - SPORCUNUN YÜKÜMLÜLÜKLERİ:</b><br>
2.1. <b>Video Taahhüt Koşulu:</b> Sporcu, Platform'un Medya Merkezi modülüne her takvim ayı içerisinde en az 2 (iki) adet doğrulanmış teknik antrenman videosu yüklemekle yükümlüdür. Videolar en az 15 saniye uzunluğunda olmalı ve sponsor marka görünürlük kriterlerini taşımalıdır.<br>
2.2. <b>Biyo-Veri Doğruluğu:</b> Sporcu, antrenman esnasında giyilebilir cihaz (Apple Watch, WHOOP, Garmin, Fitbit vb.) entegrasyonunu aktif tutarak aktif kalori ve kardiyovasküler performans verilerini eksiksiz Platform'a iletecektir.<br>
2.3. <b>Sosyal Medya Etkileşimi:</b> Sporcu, herkese açık sosyal medya paylaşımlarında Y SPORTS platformunu ve sponsor logolarını (@ysports) etiketleyerek dijital büyüme ekosistemine katkı sunacaktır.<br>
2.4. <b>Lisans ve Vize Durumu:</b> Resmi <b>${federationName}</b> vizeli sporcu lisansının güncelliğini korumak sporcunun asli görevidir.<br><br>
<b>MADDE 3 - CEZAİ VE YAPTIRIM KOŞULLARI:</b><br>
Video taahhüdünün eksik kalması, sahte veri beyanı veya etiketleme kurallarına uyulmaması durumunda Sporcu'nun SGS (Sporcu Gelişim Skoru) puanı kalıcı olarak düşürülür ve SGD sponsorluk hak ediş katsayısı askıya alınır.<br><br>
<i>İşbu dijital sözleşme, 6698 sayılı KVKK açık rıza beyanının kabulü ve cihaz eşleştirmesinin tamamlanmasıyla elektronik olarak imza altına alınmış ve yürürlüğe girmiştir.</i>`
    };
  }
  
  if (role === 'sponsor') {
    return {
      title: `💼 ${sponsorName} - Profesyonel Sponsor Sözleşmesi`,
      docType: `YS-${sponsorName.substring(0,3).toUpperCase()}-SPONSORSHIP-PROT`,
      docId: `DOCID: YS-2026-SPN-492Y`,
      text: `<b>Y SPORTS SPONSORLUK VE BİYO-VERİ KULLANIM ANLAŞMASI</b><br><br>
<b>TARAFLAR:</b><br>
İşbu sözleşme, bir tarafta Y SPORTS Sporcu Gelişim ve Değerleme Platformu ile diğer tarafta doğrulanmış biyo-performans verilerine karşılık akıllı sponsorluk bütçesini fonlayan <b>${sponsorName}</b> (bundan böyle "Sponsor" olarak anılacaktır) arasında akdedilmiştir.<br><br>
<b>MADDE 1 - ANLAŞMANIN KAPSAMI:</b><br>
Sponsor, Platform'un tescilli yapay zeka (AI) eşleştirme algoritmaları tarafından sektörel uyumluluk analizi tamamlanmış olan ve en az %90 eşleşme oranı sağlanan <b>${athleteCity}</b> bölgesindeki lisanslı sporcu <b>${athleteName}</b>'a, belirlenen <b>SGD Değeri: ${sgd}</b> piyasa değer endeksi bazında aylık sponsorluk bütçe desteği sağlamayı taahhüt eder.<br><br>
<b>MADDE 2 - SPONSORUN HAK VE YÜKÜMLÜLÜKLERİ:</b><br>
2.1. <b>Bütçe Taahhüdü:</b> Sponsor, atanan sporcunun aylık hak ediş ve biyo-performans ödemelerini zamanında karşılamakla yükümlüdür.<br>
2.2. <b>Veri Erişim Hakkı:</b> Sponsor, desteklediği sporcunun antrenman yoğunluğu (kalori, nabız, toparlanma) ve doğrulanmış antrenman arşiv videolarını Y SPORTS arayüzü üzerinden canlı ve sınırsız izleme hakkına sahiptir.<br>
2.3. <b>Pazarlama Hakları:</b> Sponsor, doğrulanmış biyo-verileri ve sporcunun turnuva performans metriklerini kendi kurumsal pazarlama kampanyalarında, Y SPORTS logolarıyla birlikte referans olarak kullanabilir.<br><br>
<b>MADDE 3 - FİKRİ MÜLKİYET VE GİZLİLİK:</b><br>
Platform tarafından sunulan biyo-değerleme (SGD) algoritmaları ve sporcu performans tahmin modelleri Y SPORTS'un fikri mülkiyetindedir, üçüncü şahıslarla paylaşılamaz.<br><br>
<i>İşbu protokol, Sponsor Giriş paneli üzerinden Google ve SMS dijital doğrulamasıyla elektronik ortamda imzalanarak hukuken yürürlüğe girmiştir.</i>`
    };
  }
  
  if (role === 'federasyon') {
    return {
      title: `🏛️ ${federationName} Entegrasyon Protokolü`,
      docType: `YS-FEDERATION-${athleteBranch.toUpperCase()}-PROT`,
      docId: `DOCID: YS-2026-FED-${athleteBranch.substring(0,3).toUpperCase()}-112Z`,
      text: `<b>Y SPORTS SPOR FEDERASYONU LİSANS VE DENETİM PROTOKOLÜ</b><br><br>
<b>TARAFLAR:</b><br>
İşbu protokol, Y SPORTS Dijital Sporcu Ekosistemi ile ilgili resmi <b>${federationName}</b> (bundan böyle "Federasyon" olarak anılacaktır) arasında yetenek keşfi ve branş gelişim standartlarını dijitalleştirmek amacıyla akdedilmiştir.<br><br>
<b>MADDE 1 - İŞBİRLİĞİNİN AMACI:</b><br>
Federasyon bünyesindeki resmi hakemler ve antrenörler tarafından sporcu <b>${athleteName}</b>'a verilen müsabaka puanlarının ve lisans vizelerinin doğruluğunun Y SPORTS SGS (Sporcu Gelişim Skoru: ${sgs}) veri tabanına pürüzsüz entegrasyonu ve denetimidir.<br><br>
<b>MADDE 2 - FEDERASYONUN YÜKÜMLÜLÜKLERİ:</b><br>
2.1. <b>Lisans Doğrulama:</b> Federasyon, sistemde aktif olan sporcuların resmi lisans ve sağlık vizesi durumlarını haftalık periyotlarla dijital veri tabanı üzerinden otomatik doğrulamayı kabul eder.<br>
2.2. <b>Branş Katsayıları Onayı:</b> Federasyon, <b>${athleteBranch}</b> branşının biyo-performans kalori çarpanlarını ve antrenman zorluk katsayılarını Y SPORTS teknik kuruluna onaylatacaktır.<br>
2.3. <b>Belediye Teşvik Denetimi:</b> Belediye sporcu teşvik fonlarının branş bazında hakkaniyetli dağılımını izlemek üzere bir denetçi atamayı taahhüt eder.<br><br>
<b>MADDE 3 - VERİ PAYLAŞIMI:</b><br>
Tüm veri alışverişi 6698 sayılı KVKK mevzuatına tam uyumlu şekilde, resmi entegrasyon anahtarları (API) üzerinden şifreli olarak gerçekleştirilecektir.<br><br>
<i>İşbu protokol dijital olarak imzalanmış ve yürürlüğe alınmıştır.</i>`
    };
  }
  
  if (role === 'kulup') {
    return {
      title: `🛡️ ${clubName} Altyapı Sözleşmesi`,
      docType: `YS-CLUB-${athleteBranch.toUpperCase()}-AGR`,
      docId: `DOCID: YS-2026-CLB-${athleteBranch.substring(0,3).toUpperCase()}-753W`,
      text: `<b>Y SPORTS SPOR KULÜBÜ ALTYAPI VE SPORCU PAYLAŞIM SÖZLEŞMESİ</b><br><br>
<b>TARAFLAR:</b><br>
İşbu sözleşme, Y SPORTS Akıllı Şehir Sporcu Ekosistemi ile tescilli <b>${clubName}</b> (bundan böyle "Kulüp" olarak anılacaktır) arasında altyapı yetenek yönetimi ve tesis paylaşım esaslarını düzenlemek üzere akdedilmiştir.<br><br>
<b>MADDE 1 - SÖZLEŞMENİN AMACI:</b><br>
Kulüp altyapısında yetişen yetenekli amatör sporcuların, özellikle ${athleteBranch} branşındaki <b>${athleteName}</b> gibi sporcuların Y SPORTS platformuna kazandırılması, antrenör gözetiminde SGS puan girişlerinin yapılması ve kulüp spor tesislerinin dijitalleşme sürecinin koordine edilmesidir.<br><br>
<b>MADDE 2 - KULÜBÜN HAK VE YÜKÜMLÜLÜKLERİ:</b><br>
2.1. <b>Tesis Dijitalleşme:</b> Kulüp, bünyesindeki antrenman salonlarının anlık doluluk oranlarını Y SPORTS IoT modülleri yardımıyla şeffaf olarak dijitalleştirmeyi kabul eder.<br>
2.2. <b>Sporcu Hakları ve Teşvik:</b> Altyapı sporcusu <b>${athleteName}</b>'ın sponsorluk (SGD) değer artışlarından elde edilen bölgesel tesis teşvik payları doğrudan kulüp tesislerinin modernizasyonunda kullanılmak üzere bloke edilir.<br>
2.3. <b>Antrenör Sorumluluğu:</b> Kulüp antrenörleri, sporcuların antrenman disiplinini ve veri girişlerini haftalık olarak doğrulamakla mükelleftir.<br><br>
<i>İşbu altyapı gelişim sözleşmesi tarafların karşılıklı dijital onayıyla resmiyet kazanmıştır.</i>`
    };
  }
  
  if (role === 'temsilci') {
    return {
      title: `🏙️ İl Temsilcisi Sorumluluk Sözleşmesi`,
      docType: `YS-REP-REGIONAL-${athleteCity.toUpperCase()}`,
      docId: `DOCID: YS-2026-REP-${athleteCity.substring(0,3).toUpperCase()}-910A`,
      text: `<b>Y SPORTS BÖLGESEL KOORDİNATÖRLÜK VE BÖLGE TEMSİLCİSİ SÖZLEŞMESİ</b><br><br>
<b>TARAFLAR:</b><br>
İşbu sözleşme, Y SPORTS Yönetim Kurulu ile Samsun Bölge Temsilcisi <b>Mehmet Perik</b> (bundan böyle "İl Temsilcisi" olarak anılacaktır) arasında bölgesel koordinasyon, lisans doğrulama ve tesis denetim yetki/sorumluluklarını belirlemek amacıyla akdedilmiştir.<br><br>
<b>MADDE 1 - İL TEMSİLCİSİNİN GÖREV VE SORUMLULUKLARI:</b><br>
İl Temsilcisi, atanmış olduğu coğrafi bölge (<b>${athleteCity} İli ve İlçeleri</b>) sınırları içerisinde aşağıdaki görevleri eksiksiz yerine getirmeyi kabul ve taahhüt eder:<br><br>
1.1. <b>Bölgesel Tesis Denetimi:</b> ${athleteCity} ili sınırları içerisindeki Atatürk Spor Salonu, Belediye Atletizm Pisti ve Kapalı Olimpik Yüzme Havuzu gibi resmi tesislerin doluluk oranlarını haftalık olarak yerinde denetlemek, veri doğruluğunu sisteme girmek.<br>
1.2. <b>Resmi Vize ve Lisans Onayı:</b> Bölgesindeki <b>${athleteName}</b> gibi sporcuların sisteme yüklediği resmi <b>${federationName}</b> lisans belgelerini ve sporcu sağlık raporlarını yerinde/dijitalde inceleyerek ilk hukuki onayı (vizeyi) vermek.<br>
1.3. <b>Belediye Spor Teşvik Fonu Koordinasyonu:</b> Samsun Belediyesi tarafından ayrılan ₺1.850.000 tutarındaki Sporcu Teşvik Fonu'nun sporculara SGS başarı puanlarına göre adil ve KVK mevzuatına uygun dağıtılmasını koordine etmek.<br>
1.4. <b>Hukuki KVKK Sorumluluğu:</b> Sporcuların ve velilerinin 6698 sayılı Kanun kapsamında hazırlanan *Aydınlatma ve Açık Rıza Metinlerini* manuel veya dijital olarak eksiksiz onaylamalarını denetlemek ve veri güvenliğini bölge bazında sağlamak.<br><br>
<b>MADDE 2 - YETKİ SINIRLARI VE GİZLİLİK:</b><br>
İl Temsilcisi, sporculara ait hassas nitelikli biyo-verileri ve kişisel dosyaları Y SPORTS güvenlik politikaları haricinde hiçbir üçüncü parti şahıs veya kurumla paylaşamaz. Aksi takdirde 6698 sayılı Kanun kapsamında doğrudan cezai sorumluluk İl Temsilcisi'ne aittir.<br><br>
<i>İşbu sorumluluk ve yetkilendirme sözleşmesi dijital imza ve SMS onayıyla tescil edilmiştir.</i>`
    };
  }
}

function showRoleContractScreen() {
  const role = activeLoginRole || 'sporcu';
  const template = getDynamicContractText(role);
  
  // Set content
  document.getElementById('sozlesmeTitle').textContent = template.title;
  document.getElementById('sozlesmeDocType').textContent = template.docType;
  document.getElementById('sozlesmeDocId').textContent = template.docId;
  document.getElementById('sozlesmeTextContent').innerHTML = template.text;
  
  // Setup correct bottom navigation back transition
  const bnav = document.getElementById('sozlesmeBnav');
  let exitHtml = '';
  if (role === 'sporcu') {
    exitHtml = `<button class="bni" onclick="pg('pg4')"><span class="bni-icon">🏠</span><span class="bni-lbl">Panel</span></button>`;
  } else if (role === 'sponsor') {
    exitHtml = `<button class="bni" onclick="pg('pg9')"><span class="bni-icon">🏠</span><span class="bni-lbl">Panel</span></button>`;
  } else {
    exitHtml = `<button class="bni" onclick="pg('pg12')"><span class="bni-icon">🏠</span><span class="bni-lbl">Panel</span></button>`;
  }
  bnav.innerHTML = `
    ${exitHtml}
    <button class="bni on"><span class="bni-icon">📄</span><span class="bni-lbl">Sözleşme</span></button>
  `;
  
  // Open screen
  pg('pgSozlesme');
  t('📄 Dijital sözleşmeniz başarıyla yüklendi!');
}

// 14. INITIALIZER
function initApp() {
  buildTicker();
  updateMobileComm();
  recalcSgdSim();
  renderSportsMob();
  buildAthletesListMob();
}

document.addEventListener('DOMContentLoaded', initApp);

