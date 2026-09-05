const CONSENT_STORAGE_KEY = 'agrovalora.analytics-consent';
const CONSENT_ACCEPTED = 'accepted';
const CONSENT_DECLINED = 'declined';
const GOOGLE_ANALYTICS_ID = 'G-3QWWW9NQEP';
const CLARITY_PROJECT_ID = 'xxnkiq6rw4';
let analyticsEnabled = false;

function getStoredConsent() {
  try {
    return window.localStorage.getItem(CONSENT_STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeConsent(value) {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
  } catch {
    // If storage is unavailable, do not persist or enable analytics by default.
  }
}

function loadGoogleAnalytics() {
  if (document.querySelector(`script[data-consent-analytics="${GOOGLE_ANALYTICS_ID}"]`)) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('consent', 'update', {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
  window.gtag('config', GOOGLE_ANALYTICS_ID, { anonymize_ip: true });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`;
  script.dataset.consentAnalytics = GOOGLE_ANALYTICS_ID;
  document.head.appendChild(script);
}

function loadClarity() {
  if (document.querySelector(`script[data-consent-clarity="${CLARITY_PROJECT_ID}"]`)) return;

  window.clarity = window.clarity || function clarity() {
    (window.clarity.q = window.clarity.q || []).push(arguments);
  };

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${CLARITY_PROJECT_ID}`;
  script.dataset.consentClarity = CLARITY_PROJECT_ID;
  document.head.appendChild(script);
}

function enableAnalytics() {
  analyticsEnabled = true;
  loadGoogleAnalytics();
  loadClarity();
}

function removeConsentBanner() {
  document.querySelector('[data-privacy-consent]')?.remove();
}

function addManageButton() {
  if (document.querySelector('[data-consent-manage]')) return;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'privacy-consent-manage';
  button.dataset.consentManage = '';
  button.textContent = 'Privacidade';
  button.addEventListener('click', () => showConsentBanner());
  document.body.appendChild(button);
}

function showConsentBanner() {
  removeConsentBanner();

  const banner = document.createElement('section');
  banner.className = 'privacy-consent';
  banner.dataset.privacyConsent = '';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-labelledby', 'privacy-consent-title');
  banner.innerHTML = `
    <div class="privacy-consent-copy">
      <span class="privacy-consent-kicker">Sua privacidade importa</span>
      <h2 id="privacy-consent-title">Podemos entender melhor esta experiência?</h2>
      <p>Usamos Google Analytics e Microsoft Clarity somente para analisar o uso do site e melhorar nossos conteúdos. Esses recursos só serão ativados com sua autorização.</p>
      <a href="/politica-privacidade.html">Leia nossa Política de Privacidade <span>↗</span></a>
    </div>
    <div class="privacy-consent-actions">
      <button type="button" class="privacy-consent-reject" data-consent-reject>Agora não</button>
      <button type="button" class="privacy-consent-accept" data-consent-accept>Autorizar análise <span>↗</span></button>
    </div>
  `;

  banner.querySelector('[data-consent-reject]').addEventListener('click', () => {
    storeConsent(CONSENT_DECLINED);
    removeConsentBanner();
    if (analyticsEnabled) {
      window.location.reload();
      return;
    }
    addManageButton();
  });
  banner.querySelector('[data-consent-accept]').addEventListener('click', () => {
    storeConsent(CONSENT_ACCEPTED);
    removeConsentBanner();
    addManageButton();
    enableAnalytics();
  });

  document.body.appendChild(banner);
}

const storedConsent = getStoredConsent();

if (storedConsent === CONSENT_ACCEPTED) {
  enableAnalytics();
  addManageButton();
} else if (storedConsent === CONSENT_DECLINED) {
  addManageButton();
} else {
  showConsentBanner();
}
