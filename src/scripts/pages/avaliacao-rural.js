import { CLASSES, UF } from '../shared/valuation-data.js';
import { calculatePreview } from '../shared/valuation-preview.js';

const STATES = [
  ['AC', 'Acre'], ['AL', 'Alagoas'], ['AP', 'Amapá'], ['AM', 'Amazonas'],
  ['BA', 'Bahia'], ['CE', 'Ceará'], ['DF', 'Distrito Federal'], ['ES', 'Espírito Santo'],
  ['GO', 'Goiás'], ['MA', 'Maranhão'], ['MT', 'Mato Grosso'], ['MS', 'Mato Grosso do Sul'],
  ['MG', 'Minas Gerais'], ['PA', 'Pará'], ['PB', 'Paraíba'], ['PR', 'Paraná'],
  ['PE', 'Pernambuco'], ['PI', 'Piauí'], ['RJ', 'Rio de Janeiro'], ['RN', 'Rio Grande do Norte'],
  ['RS', 'Rio Grande do Sul'], ['RO', 'Rondônia'], ['RR', 'Roraima'], ['SC', 'Santa Catarina'],
  ['SP', 'São Paulo'], ['SE', 'Sergipe'], ['TO', 'Tocantins'],
];
const byId = id => document.getElementById(id);
const number = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });
const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const propertyForm = byId('property-form');
const evaluationForm = byId('evaluation-form');
const stateField = byId('property-state');
const cityField = byId('property-city');
const propertyStatus = byId('property-status');
const leadStatus = byId('lead-status');
const submitButton = byId('send-evaluation');
const phoneField = byId('lead-phone');
const apiBaseUrl = (import.meta.env.VITE_BFF_API_BASE_URL || '/api').replace(/\/$/, '');
let property = null;
let sending = false;
let completed = false;

// Keep campaign attribution in memory only. Do not include arbitrary URL parameters.
const campaignParameters = new URLSearchParams(location.search);
const attribution = Object.fromEntries(
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
    .filter(key => campaignParameters.has(key))
    .map(key => [key, campaignParameters.get(key).slice(0, 200)]),
);

STATES.forEach(([code, name]) => stateField.add(new Option(name, code)));
CLASSES.forEach((use, index) => {
  const row = document.createElement('div');
  row.className = 'campaign-area-row';
  const label = document.createElement('label');
  label.htmlFor = `area-${index}`;
  label.textContent = use.n;
  const input = document.createElement('input');
  Object.assign(input, { id: `area-${index}`, name: `area-${index}`, type: 'text', placeholder: '0', inputMode: 'decimal', maxLength: 11, pattern: '[0-9]+([.,][0-9]{1,2})?', title: 'Informe os hectares, com até duas casas decimais. Exemplo: 12,50.' });
  input.setAttribute('aria-label', `${use.n}, em hectares`);
  row.append(label, input);
  byId([0, 3, 7].includes(index) ? 'primary-areas' : 'additional-areas').append(row);
});
const areaFields = CLASSES.map((_, index) => byId(`area-${index}`));
const readArea = field => Number(field.value.trim().replace(',', '.') || 0);
const scrollToWorkspace = () => document.querySelector('.campaign-workspace').scrollIntoView({ behavior: 'instant', block: 'start' });
const scrollToCalculator = () => byId('calculadora').scrollIntoView({ behavior: 'instant', block: 'start' });

stateField.addEventListener('change', () => {
  cityField.value = '';
  cityField.disabled = !stateField.value;
  byId('city-suggestions').replaceChildren(...(UF[stateField.value]?.c || []).map(([name]) => new Option(name, name)));
});

byId('toggle-areas').addEventListener('click', () => {
  const extra = byId('additional-areas');
  extra.hidden = !extra.hidden;
  byId('toggle-areas').setAttribute('aria-expanded', String(!extra.hidden));
  byId('toggle-areas').textContent = extra.hidden ? '+ Adicionar outros usos do solo' : '− Recolher outros usos do solo';
});

propertyForm.addEventListener('input', () => {
  propertyStatus.textContent = '';
  cityField.setCustomValidity('');
  const total = areaFields.reduce((sum, field) => sum + (Number.isFinite(readArea(field)) ? readArea(field) : 0), 0);
  byId('total-area').textContent = number.format(total);
});

function showStep(step) {
  byId('resultado').hidden = step !== 'contact';
  evaluationForm.hidden = step !== 'contact';
  document.querySelector('.campaign-workspace').classList.toggle('has-preview', step === 'contact');
  document.querySelectorAll('[data-progress]').forEach(item => {
    const current = item.dataset.progress === step;
    item.classList.toggle('is-current', current);
    item.classList.toggle('is-complete', step === 'contact' && item.dataset.progress === 'property');
    if (current) item.setAttribute('aria-current', 'step');
    else item.removeAttribute('aria-current');
  });
}

function renderPreview() {
  const { preview } = property;
  byId('preview-empty').hidden = true;
  byId('preview-result').hidden = false;
  byId('preview-title').textContent = preview.value === null ? 'Seu imóvel merece uma leitura própria.' : 'Um primeiro olhar sobre o seu potencial.';
  byId('preview-location').textContent = `${property.city} / ${property.state}`;
  byId('preview-area').textContent = `${number.format(preview.totalArea)} ha`;
  byId('preview-uses').textContent = `${preview.uses} ${preview.uses === 1 ? 'classe' : 'classes'}`;
  byId('preview-value-label').textContent = preview.value === null ? 'Análise da equipe' : 'Valor ilustrativo do imóvel';
  byId('preview-value').textContent = preview.value === null ? 'Uma avaliação para a sua terra.' : currency.format(preview.value);
  byId('preview-range').textContent = preview.value === null
    ? 'Esta localidade não tem valores na base demonstrativa. Envie os dados para nossa equipe analisar.'
    : `Faixa ilustrativa: ${currency.format(preview.minimum)} a ${currency.format(preview.maximum)}.`;
  byId('property-summary').textContent = `${property.city} / ${property.state} · ${number.format(preview.totalArea)} ha · ${preview.uses} ${preview.uses === 1 ? 'uso do solo' : 'usos do solo'}`;
}

// Reveal collapsed invalid fields before native validation tries to focus them.
areaFields.forEach(field => field.addEventListener('invalid', () => {
  if (byId('additional-areas').contains(field) && byId('additional-areas').hidden) byId('toggle-areas').click();
}));

propertyForm.addEventListener('submit', event => {
  event.preventDefault();
  cityField.value = cityField.value.trim();
  if (cityField.value.length < 2) {
    cityField.setCustomValidity('Informe o nome do município.');
    cityField.reportValidity();
    return;
  }
  const areas = areaFields.map(readArea);
  let preview;
  try {
    preview = calculatePreview(stateField.value, cityField.value, areas);
  } catch (error) {
    propertyStatus.textContent = error.message;
    return;
  }
  if (preview.totalArea <= 0) {
    propertyStatus.textContent = 'Informe a área de pelo menos um uso do solo para continuar.';
    areaFields[0].focus();
    return;
  }
  property = { state: stateField.value, city: cityField.value, areas, preview };
  renderPreview();
  showStep('contact');
  byId('contact-title').focus({ preventScroll: true });
  scrollToWorkspace();
});

byId('edit-property').addEventListener('click', () => {
  if (sending || completed) return;
  showStep('property');
  stateField.focus({ preventScroll: true });
  scrollToCalculator();
});

function validatePhone() {
  const digits = phoneField.value.replace(/\D/g, '');
  const national = digits.length > 11 && digits.startsWith('55') ? digits.slice(2) : digits;
  const valid = /^\d{10,11}$/.test(national) && !/^(\d)\1+$/.test(national) && /^[1-9]{2}/.test(national);
  phoneField.setCustomValidity(valid ? '' : 'Informe um WhatsApp válido com DDD.');
  return valid;
}
phoneField.addEventListener('input', () => phoneField.setCustomValidity(''));
phoneField.addEventListener('blur', () => { if (phoneField.value) validatePhone(); });

function buildMessage(data) {
  const { preview } = property;
  return [
    'SOLICITAÇÃO DE AVALIAÇÃO RURAL — CAMPANHA',
    `Localidade: ${property.city} / ${property.state}`,
    `Área total: ${number.format(preview.totalArea)} ha`,
    'Uso do solo:',
    ...property.areas.flatMap((area, index) => area > 0 ? [`- ${CLASSES[index].n}: ${number.format(area)} ha`] : []),
    `Simulação ilustrativa: ${preview.value === null ? 'localidade sem referência demonstrativa; avaliação pela equipe' : currency.format(preview.value)}`,
    'A simulação usa dados de demonstração, não é uma avaliação real.',
    `Perfil: ${data.get('profile')}`,
    'Pedido: receber por e-mail o retorno da equipe sobre a avaliação do imóvel.',
    'Contato sobre esta solicitação autorizado no formulário.',
    `Página: ${location.origin}${location.pathname}`,
    ...Object.entries(attribution).map(([key, value]) => `${key}: ${value.replace(/[\r\n]/g, ' ')}`),
  ].join('\n');
}

evaluationForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (sending || completed || !property) return;
  leadStatus.textContent = '';
  if (!validatePhone()) { phoneField.reportValidity(); return; }
  const data = new FormData(evaluationForm);
  const name = String(data.get('name')).trim();
  if (name.length < 3) {
    leadStatus.textContent = 'Informe seu nome completo.';
    byId('lead-name').focus();
    return;
  }
  const payload = {
    name,
    email: String(data.get('email')).trim(),
    company: String(data.get('company')).trim() || 'Pessoa física',
    phone: String(data.get('phone')).trim(),
    message: buildMessage(data),
    website: String(data.get('website')).trim(),
  };
  sending = true;
  submitButton.disabled = true;
  byId('edit-property').disabled = true;
  evaluationForm.setAttribute('aria-busy', 'true');
  submitButton.textContent = 'Enviando sua solicitação…';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(`${apiBaseUrl}/public/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    // A static host can return its index page with HTTP 200 for an absent API.
    if (!response.ok || response.redirected || response.headers.get('content-type')?.includes('text/html')) {
      throw new Error('evaluation_submission_failed');
    }
    completed = true;
    propertyForm.querySelector('[type="submit"]').disabled = true;
    propertyForm.querySelector('[type="submit"]').textContent = 'Solicitação enviada';
    document.querySelector('.campaign-workspace').classList.remove('has-preview');
    evaluationForm.hidden = true;
    byId('evaluation-success').hidden = false;
    byId('success-email').textContent = payload.email;
    byId('success-summary').textContent = byId('property-summary').textContent;
    byId('preview-next').textContent = 'Solicitação enviada. Nossa equipe vai dar continuidade à leitura do seu imóvel.';
    document.querySelectorAll('[data-progress]').forEach(item => {
      item.classList.remove('is-current');
      item.classList.add('is-complete');
      item.removeAttribute('aria-current');
    });
    byId('success-title').focus({ preventScroll: true });
    scrollToWorkspace();
    // The existing consent module is the only code that initializes analytics.
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'generate_lead', { form_name: 'avaliacao_rural', lead_source: attribution.utm_source || 'direct' });
    }
  } catch {
    leadStatus.textContent = 'Não foi possível enviar agora. Seus dados continuam preenchidos. Tente novamente ou fale com agrovalora@agroconsult.com.br.';
  } finally {
    clearTimeout(timeout);
    sending = false;
    submitButton.disabled = false;
    byId('edit-property').disabled = false;
    evaluationForm.removeAttribute('aria-busy');
    submitButton.replaceChildren(document.createTextNode('Solicitar minha avaliação '));
    const arrow = document.createElement('span');
    arrow.textContent = '↗';
    arrow.setAttribute('aria-hidden', 'true');
    submitButton.append(arrow);
  }
});

byId('campaign-year').textContent = new Date().getFullYear();

const kmzDemoForm = byId('kmz-demo-form');
const kmzFile = byId('kmz-file');
const kmzDemoStatus = byId('kmz-demo-status');
kmzDemoForm.addEventListener('input', () => {
  kmzDemoStatus.textContent = '';
  kmzDemoStatus.classList.remove('is-success');
  kmzFile.setCustomValidity('');
});
kmzDemoForm.addEventListener('submit', event => {
  event.preventDefault();
  const file = kmzFile.files?.[0];
  if (!file || !/\.kmz$/i.test(file.name)) {
    kmzFile.setCustomValidity('Selecione um arquivo KMZ.');
    kmzFile.reportValidity();
    return;
  }
  if (file.size > 25 * 1024 * 1024) {
    kmzFile.setCustomValidity('Selecione um KMZ de até 25 MB.');
    kmzFile.reportValidity();
    return;
  }
  const phone = byId('kmz-phone');
  const digits = phone.value.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 13) {
    phone.setCustomValidity('Informe um WhatsApp válido com DDD.');
    phone.reportValidity();
    return;
  }
  phone.setCustomValidity('');
  kmzDemoStatus.textContent = 'Simulação concluída. O arquivo não foi enviado e nossa equipe não recebeu esta solicitação.';
  kmzDemoStatus.classList.add('is-success');
});
byId('kmz-phone').addEventListener('input', event => event.currentTarget.setCustomValidity(''));
