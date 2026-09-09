import Chart from 'chart.js/auto';
import { initSmoothScroll } from '../shared/smooth-scroll.js';

const siteHeader = document.querySelector('.terra-site-header');
const productNav = document.querySelector('.product-nav');
const getStickyOffset = () => (siteHeader?.getBoundingClientRect().height || 0)
  + (productNav?.getBoundingClientRect().height || 0);
const lenis = initSmoothScroll({ anchorOffset: -getStickyOffset() });

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && entry.intersectionRatio >= 0.16) {
      entry.target.classList.add('visible');
      return;
    }
    if (!entry.isIntersecting) entry.target.classList.remove('visible');
  });
}, { threshold: [0, 0.16], rootMargin: '0px 0px -10% 0px' });

document.querySelectorAll('.terra-content .reveal').forEach((element) => {
  revealObserver.observe(element);
});

// Original product prototype: all calculations and purchase/contact flows are illustrative.

/* ───────── DADOS ILUSTRATIVOS ───────── */
const CLASSES=[
 {n:'Agricultura de alto potencial',v:16500},
 {n:'Agricultura de médio potencial',v:12800},
 {n:'Culturas permanentes',v:14200},
 {n:'Pastagem de médio suporte',v:7400},
 {n:'Pastagem de alto suporte',v:9100},
 {n:'Pastagem de baixo suporte',v:5200},
 {n:'Reflorestamento',v:8600},
 {n:'Remanescente de vegetação nativa',v:3100}
];
/* cada município traz o fator do POLO agrícola a que pertence — é o polo, não o estado, que define o preço */
const UF={
 'MT':{c:[['Sorriso',1.00,'Polo 10 — Médio Norte'],['Sinop',0.96,'Polo 10 — Médio Norte'],['Lucas do Rio Verde',1.02,'Polo 10 — Médio Norte'],['Nova Mutum',0.99,'Polo 10 — Médio Norte'],['Primavera do Leste',0.92,'Polo 12 — Sudeste de MT'],['Rondonópolis',0.88,'Polo 14 — Sul de MT']]},
 'MS':{c:[['Maracaju',0.97,'Polo 31 — Sul de MS'],['Dourados',1.01,'Polo 31 — Sul de MS'],['Chapadão do Sul',0.93,'Polo 33 — Nordeste de MS'],['São Gabriel do Oeste',0.86,'Polo 34 — Norte de MS']]},
 'GO':{c:[['Rio Verde',1.12,'Polo 21 — Sudoeste de GO'],['Jataí',1.09,'Polo 21 — Sudoeste de GO'],['Cristalina',1.05,'Polo 24 — Sudeste de GO'],['Luziânia',0.98,'Polo 24 — Sudeste de GO']]},
 'PR':{c:[['Cascavel',1.38,'Polo 71 — Oeste do PR'],['Londrina',1.44,'Polo 74 — Norte do PR'],['Ponta Grossa',1.21,'Polo 77 — Campos Gerais'],['Campo Mourão',1.30,'Polo 73 — Centro-Oeste do PR']]},
 'RS':{c:[['Passo Fundo',1.19,'Polo 91 — Planalto Médio'],['Cruz Alta',1.08,'Polo 92 — Alto Jacuí'],['Erechim',0.94,'Polo 94 — Alto Uruguai'],['Santa Rosa',1.02,'Polo 96 — Noroeste do RS']]},
 'BA':{c:[['Luís Eduardo Magalhães',0.84,'Polo 45 — Oeste da BA'],['Barreiras',0.79,'Polo 45 — Oeste da BA'],['São Desidério',0.81,'Polo 45 — Oeste da BA'],['Correntina',0.68,'Polo 47 — Sudoeste da BA']]},
 'SP':{c:[['Ribeirão Preto',1.52,'Polo 61 — Nordeste de SP'],['Araçatuba',1.24,'Polo 64 — Noroeste de SP'],['Assis',1.36,'Polo 66 — Médio Paranapanema'],['Itapeva',1.11,'Polo 68 — Sudoeste de SP']]},
 'MG':{c:[['Uberlândia',1.14,'Polo 51 — Triângulo Mineiro'],['Uberaba',1.09,'Polo 51 — Triângulo Mineiro'],['Unaí',0.92,'Polo 54 — Noroeste de MG'],['Patos de Minas',0.97,'Polo 53 — Alto Paranaíba']]},
 'MA':{c:[['Balsas',0.64,'Polo 41 — Sul do MA'],['Tasso Fragoso',0.59,'Polo 41 — Sul do MA'],['Riachão',0.56,'Polo 41 — Sul do MA']]},
 'TO':{c:[['Pedro Afonso',0.61,'Polo 43 — Centro do TO'],['Campos Lindos',0.54,'Polo 42 — Nordeste do TO'],['Porto Nacional',0.58,'Polo 43 — Centro do TO']]}
};
const PLANS={
 regional:{name:'Regional',mo:833,yr:10000,vista:8333,tag:null,
   feat:['1 região à escolha','Relatório da região contratada','Relatório Brasil','Até 3 usuários nomeados'],self:true},
 top50:{name:'Top 50 Polos',mo:1667,yr:20000,vista:16667,tag:null,
   feat:['Os 50 principais polos agrícolas','Relatório Brasil','Comparativos e rankings','Até 3 usuários nomeados'],self:true},
 brasil:{name:'Brasil Completo',mo:2500,yr:30000,vista:25000,tag:'MAIS CONTRATADO',hero:true,
   feat:['Os 238 polos do Brasil','Os 4 relatórios regionais','Relatório Brasil','Até 10 usuários nomeados'],self:true},
 enterprise:{name:'Enterprise',mo:null,yr:75000,tag:null,
   feat:['Tudo do Brasil Completo','API de integração','Série histórica de 10 anos','Recorte por município','Reunião trimestral com analista','Usuários ilimitados'],self:false}
};
const REGIOES=[
 {id:'co',n:'Centro-Oeste',d:'Mato Grosso (10 polos) · Mato Grosso do Sul (6) · Goiás (8)'},
 {id:'sul',n:'Sul',d:'Paraná · Santa Catarina · Rio Grande do Sul'},
 {id:'se',n:'Sudeste',d:'São Paulo · Minas Gerais · Espírito Santo · Rio de Janeiro'},
 {id:'nne',n:'Norte / Nordeste',d:'MATOPIBA · Pará · Rondônia · demais estados do Norte e Nordeste'}
];
const POLOS=[
 {n:'Polo 10 — Médio Norte (MT)',m:'Sorriso · Sinop · Lucas do Rio Verde · Nova Mutum',f:1.00,var:'+8,4%'},
 {n:'Polo 12 — Sudeste de MT',m:'Primavera do Leste · Campo Verde · Paranatinga',f:0.92,var:'+6,1%'},
 {n:'Polo 14 — Sul de MT',m:'Rondonópolis · Pedra Preta · Itiquira',f:0.88,var:'+4,9%'},
 {n:'Polo 21 — Sudoeste de GO',m:'Rio Verde · Jataí · Montividiu',f:1.12,var:'+11,2%'},
 {n:'Polo 24 — Sudeste de GO',m:'Cristalina · Luziânia · Ipameri',f:1.05,var:'−2,3%'},
 {n:'Polo 31 — Sul de MS',m:'Maracaju · Dourados · Rio Brilhante',f:0.97,var:'+7,0%'}
];
const REL={
 'Polo 10 — Médio Norte (MT)':['O Médio Norte segue como o polo mais líquido do Centro-Oeste. O preço médio da agricultura de alto potencial avançou 8,4% no semestre, puxado por três fatores combinados: margem de soja acima da média histórica na safra 2025/26, oferta restrita de imóveis com CAR regularizado e a consolidação da segunda safra de milho como receita previsível.','A faixa entre mínimo e máximo se ampliou. Áreas com logística até Miritituba e Rondonópolis já operam próximas ao teto, enquanto glebas mais distantes do eixo da BR-163 continuam bem abaixo da média do polo. Para quem avalia garantia, a leitura é direta: o valor médio do polo não é aplicável sem checar o posicionamento logístico do imóvel.'],
 'Polo 24 — Sudeste de GO':['Único polo do Centro-Oeste com desvalorização no semestre. A queda de 2,3% no preço médio reflete a combinação de duas safras seguidas com quebra por irregularidade de chuva e a saída de dois compradores institucionais que sustentavam o mercado local.','A dispersão entre mínimo e máximo se estreitou, sinal típico de mercado com baixa liquidez: menos negócios, menos referências e comprador mais seletivo. A recomendação de leitura é acompanhar o próximo levantamento antes de projetar tendência.']
};
const DEF=['O polo apresentou valorização no último levantamento, em linha com o comportamento médio da região. A leitura completa deste polo, com os fatores que explicam a variação e o comparativo dos últimos três anos, está disponível no relatório regional do seu pacote.','A faixa entre mínimo e máximo indica dispersão moderada entre os municípios que compõem o polo — atenção especial ao posicionamento logístico e à regularidade documental do imóvel na hora de aplicar o valor médio.'];

const fmt=n=>'R$ '+Math.round(n).toLocaleString('pt-BR');
function toast(t){const e=document.getElementById('toast');e.textContent=t;e.classList.add('on');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('on'),3400)}
function go(id){
  const target=document.getElementById(id);
  if(target)lenis.scrollTo(target,{offset:-getStickyOffset()});
}
function closeAll(){
  document.querySelectorAll('.ov').forEach(o=>o.classList.remove('on'));
  document.body.style.overflow='';
  lenis.start();
  lenis.resize();
}
document.querySelectorAll('.ov').forEach(o=>o.addEventListener('click',e=>{if(e.target===o)closeAll()}));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeAll()});

/* ───────── CALCULADORA ───────── */
function initCalc(){
  const uf=document.getElementById('uf');
  uf.innerHTML=Object.keys(UF).map(k=>`<option>${k}</option>`).join('');
  document.getElementById('classes').innerHTML=CLASSES.map((c,i)=>
    `<div class="classrow"><label for="c${i}">${c.n}</label><input type="number" min="0" id="c${i}" placeholder="0" oninput="calc()"></div>`).join('');
  fillCity();
}
let UNLOCKED=false;
function city(){
  const u=document.getElementById('uf').value, m=document.getElementById('mun').value;
  return UF[u].c.find(x=>x[0]===m)||UF[u].c[0];
}
function fillCity(){
  const u=document.getElementById('uf').value;
  document.getElementById('mun').innerHTML=UF[u].c.map(c=>`<option>${c[0]}</option>`).join('');
  calc();
}
function resetCalc(){CLASSES.forEach((c,i)=>document.getElementById('c'+i).value='');calc()}
function calc(scroll){
  const ct=city(), f=ct[1];
  let tot=0,rows=[];
  CLASSES.forEach((c,i)=>{
    const ha=parseFloat(document.getElementById('c'+i).value)||0;
    if(ha>0){const v=ha*c.v*f;tot+=v;rows.push([c.n,ha,v])}
  });
  document.getElementById('rTot').textContent=tot?fmt(tot):'R$ 0';
  document.getElementById('rRange').textContent=tot
    ? `Faixa do polo: ${fmt(tot*0.81)} a ${fmt(tot*1.16)}`
    : 'Informe as áreas para calcular';
  document.getElementById('rPolo').textContent=tot?ct[2]:'';
  const brk=document.getElementById('rBrk');
  if(!rows.length){brk.innerHTML='';document.getElementById('gateBox').style.display='block';return}
  if(UNLOCKED){
    brk.innerHTML=rows.map(r=>`<div><span>${r[0]} · ${r[1].toLocaleString('pt-BR')} ha</span><b>${fmt(r[2])}</b></div>`).join('')
      +`<div style="border-top:1px solid rgba(255,255,255,.15);margin-top:8px;padding-top:10px"><span>Área total</span><b>${rows.reduce((a,r)=>a+r[1],0).toLocaleString('pt-BR')} ha</b></div>`
      +`<div><span>Variação nos últimos 3 anos</span><b style="color:#9ED879">+21,4%</b></div>`;
    document.getElementById('gateBox').style.display='none';
  }else{
    brk.innerHTML=rows.map(r=>`<div><span>${r[0]} · ${r[1].toLocaleString('pt-BR')} ha</span><b style="filter:blur(5px);user-select:none">R$ ••••••</b></div>`).join('')
      +`<div style="border-top:1px solid rgba(255,255,255,.15);margin-top:8px;padding-top:10px"><span>Área total</span><b>${rows.reduce((a,r)=>a+r[1],0).toLocaleString('pt-BR')} ha</b></div>`;
    document.getElementById('gateBox').style.display='block';
  }
  if(scroll&&!rows.length)toast('Informe a área de pelo menos uma classe de uso do solo.');
}
function gate(){
  const v=document.getElementById('gmail').value.trim();
  if(!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(v)){toast('Informe um e-mail válido para receber o detalhamento.');return}
  UNLOCKED=true;calc();
  toast('Detalhamento liberado e enviado para '+v+'. Você tem mais 2 consultas neste mês.');
  document.getElementById('gmail').value='';
}

/* ───────── PLANOS ───────── */
function renderPlans(){
  document.getElementById('plans').innerHTML=Object.entries(PLANS).map(([k,p])=>`
    <div class="plan ${p.hero?'hero-plan':''}">
      ${p.tag?`<div class="tag">${p.tag}</div>`:''}
      <div class="pname">${p.name}</div>
      <div class="pmo">${p.mo?'R$ '+p.mo.toLocaleString('pt-BR'):'sob consulta'}</div>
      <div class="pyr">${p.mo?'por mês  ·  R$ '+p.yr.toLocaleString('pt-BR')+' por ano':'a partir de R$ '+p.yr.toLocaleString('pt-BR')+'/ano'}</div>
      <ul>${p.feat.map(f=>`<li>${f}</li>`).join('')}</ul>
      ${p.self
        ? `<button class="btn ${p.hero?'btn-p':'btn-o'}" onclick="openBuy('${k}')">Contratar agora</button>
           <div class="self">${p.hero
             ? `<a onclick="openEnt()" style="color:#9ED879;font-weight:600;cursor:pointer;text-decoration:underline">ou falar com um analista</a>`
             : 'Contratação imediata no cartão'}</div>`
        : `<button class="btn btn-o" onclick="openEnt()">Falar com um analista</button><div class="self">Escopo definido em diagnóstico</div>`}
    </div>`).join('');
}

/* ───────── CHECKOUT ───────── */
let ST={plan:'regional',regiao:'co',pay:'12x',step:0};
const STEPS=['Pacote','Pagamento','Seus dados','Confirmação'];
function openBuy(k){ST={plan:k,regiao:'co',pay:'12x',step:0};document.getElementById('ovBuy').classList.add('on');document.body.style.overflow='hidden';lenis.stop();renderStep()}
function openEnt(){
  document.getElementById('ovEnt').classList.add('on');document.body.style.overflow='hidden';lenis.stop();
  document.getElementById('entBody').innerHTML=`
    <h3>Vamos dimensionar o escopo</h3>
    <p class="sub">Em uma conversa de 20 minutos mapeamos onde estão os seus ativos, quais polos importam para a sua decisão e qual recorte faz sentido contratar. Retornamos em até 1 dia útil.</p>
    <div class="entgrid">
      <div class="field"><label>Nome</label><input id="e1" placeholder="Seu nome completo"></div>
      <div class="field"><label>E-mail corporativo</label><input id="e2" placeholder="nome@empresa.com.br"></div>
      <div class="field"><label>Empresa</label><input id="e3" placeholder="Razão social"></div>
      <div class="field"><label>Telefone</label><input id="e4" placeholder="(00) 00000-0000"></div>
    </div>
    <div class="field"><label>Qual o seu segmento?</label><select id="e5">
      <option>Banco, fintech ou cooperativa de crédito</option><option>Fundo ou gestora de ativos rurais</option>
      <option>Trading, indústria ou energia</option><option>Revenda, cooperativa ou máquinas</option>
      <option>Jurídico, perícia ou cartório</option><option>Corretagem de imóveis rurais</option><option>Outro</option>
    </select></div>
    <div class="field"><label>O que você precisa?</label><select id="e6">
      <option>Enterprise — API, série histórica de 10 anos e recorte municipal</option>
      <option>API de integração</option><option>Preços abertos por município</option>
      <option>Série histórica de 10 anos</option><option>Estudo sob medida</option><option>Ainda não sei — quero entender</option>
    </select></div>
    <button class="btn btn-p btn-lg" style="width:100%;margin-top:8px" onclick="sendEnt()">Solicitar contato de um analista</button>
    <div class="trust"><span>Retorno em até 1 dia útil</span><span>Sem compromisso</span><span>Proposta formal por escrito</span></div>`;
}
function sendEnt(){
  const n=document.getElementById('e1').value.trim(),m=document.getElementById('e2').value.trim();
  if(!n||!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(m)){toast('Preencha nome e um e-mail corporativo válido.');return}
  document.getElementById('entBody').innerHTML=`<div class="ok"><div class="ck">✓</div>
    <h3>Recebemos a sua solicitação, ${escapeHtml(n.split(' ')[0])}</h3>
    <p class="sub" style="max-width:440px;margin:10px auto 0">Um analista da Agroconsult entra em contato em até 1 dia útil pelo e-mail ${escapeHtml(m)}. Enquanto isso, o Relatório Brasil resumido já está a caminho.</p>
    <button class="btn btn-o" style="margin-top:24px" onclick="closeAll()">Fechar</button></div>`;
}
function price(){
  const p=PLANS[ST.plan];
  return ST.pay==='vista'?p.vista:p.yr;
}
function renderStep(){
  const p=PLANS[ST.plan];
  document.getElementById('mSub').textContent=p.name+' · assinatura anual';
  document.getElementById('steps').innerHTML=STEPS.map((s,i)=>
    `<div class="step ${i===ST.step?'on':''} ${i<ST.step?'done':''}"><i>${i<ST.step?'✓':i+1}</i>${s}</div>`).join('');
  const B=document.getElementById('mBody'),F=document.getElementById('mFoot');
  if(ST.step===0){
    B.innerHTML=`<h3>${p.name}</h3><p class="sub">${p.mo?'R$ '+p.mo.toLocaleString('pt-BR')+' por mês · R$ '+p.yr.toLocaleString('pt-BR')+' por ano':''}</p>
      ${ST.plan==='regional'?`<label style="margin-bottom:12px">Escolha a sua região</label>`+REGIOES.map(r=>
        `<div class="opt ${ST.regiao===r.id?'sel':''}" onclick="ST.regiao='${r.id}';renderStep()"><div class="rd"></div><div><b>${r.n}</b><small>${r.d}</small></div><div class="pr">incluída</div></div>`).join('')
      :`<div class="sum">${p.feat.map(f=>`<div class="l"><span>${f}</span><span class="gr">✓</span></div>`).join('')}</div>`}
      ${ST.plan!=='brasil'?`<div class="note" style="margin-top:22px"><b>Compare:</b> o pacote Brasil Completo dá os 238 polos, os 4 relatórios regionais e até 10 usuários por R$ 2.500/mês. As 4 regiões contratadas separadamente custariam R$ 40.000 por ano. <a onclick="ST.plan='brasil';ST.step=0;renderStep()" style="color:var(--verde);font-weight:700;cursor:pointer;text-decoration:underline">Ver o Brasil Completo</a></div>`
      :`<div class="note" style="margin-top:22px"><b>Lote Fundador:</b> os 15 primeiros contratos têm o preço congelado por 24 meses e acesso ao webinar de assinantes desde o primeiro mês. Vagas limitadas — <b>até 31/10/2026</b>.</div>`}`;
    F.innerHTML=`<div style="font-size:13px;color:var(--mut)">Assinatura anual · renovação automática, com aviso de não renovação até 30 dias antes do vencimento</div>
      <button class="btn btn-p sp" onclick="ST.step=1;renderStep()">Continuar</button>`;
  }
  else if(ST.step===1){
    B.innerHTML=`<h3>Como você prefere pagar</h3><p class="sub">Assinatura anual. O ano é devido após o prazo legal de arrependimento de 7 dias.</p>
      <div class="opt ${ST.pay==='12x'?'sel':''}" onclick="ST.pay='12x';renderStep()"><div class="rd"></div>
        <div><b>12 parcelas mensais no cartão</b><small>R$ ${p.mo.toLocaleString('pt-BR')} por mês, com cobrança recorrente</small></div>
        <div class="pr">R$ ${p.yr.toLocaleString('pt-BR')}</div></div>
      <div class="opt ${ST.pay==='vista'?'sel':''}" onclick="ST.pay='vista';renderStep()"><div class="rd"></div>
        <div><b>Antecipado — você paga 10 parcelas em vez de 12</b><small>Economia de R$ ${(p.yr-p.vista).toLocaleString('pt-BR')} · ${ST.plan==='brasil'?'boleto, faturamento ou cartão':'cartão de crédito'}</small></div>
        <div class="pr">R$ ${p.vista.toLocaleString('pt-BR')}</div></div>
      <div class="sum">
        <div class="l"><span>${p.name}${ST.plan==='regional'?' — '+REGIOES.find(r=>r.id===ST.regiao).n:''}</span><span>R$ ${p.yr.toLocaleString('pt-BR')}</span></div>
        ${ST.pay==='vista'?`<div class="l"><span>Desconto por pagamento antecipado (2 parcelas)</span><span class="gr">− R$ ${(p.yr-p.vista).toLocaleString('pt-BR')}</span></div>`:''}
        <div class="l"><span>Relatório Brasil</span><span class="gr">incluso</span></div>
        <div class="l tot"><span>Total no ano</span><span>R$ ${price().toLocaleString('pt-BR')}</span></div>
      </div>
      <div class="trust"><span>7 dias para desistir, sem justificativa</span><span>Nota fiscal e contrato por e-mail</span><span>Acesso liberado na hora</span></div>`;
    F.innerHTML=`<button class="btn btn-o" onclick="ST.step=0;renderStep()">Voltar</button>
      <button class="btn btn-p sp" onclick="ST.step=2;renderStep()">Continuar</button>`;
  }
  else if(ST.step===2){
    B.innerHTML=`<h3>Seus dados</h3><p class="sub">Usados para emitir a nota fiscal, gerar o contrato e criar o seu acesso.</p>
      <div class="entgrid">
        <div class="field"><label>Nome completo</label><input id="b1" placeholder="Seu nome"></div>
        <div class="field"><label>E-mail corporativo</label><input id="b2" placeholder="nome@empresa.com.br"></div>
        <div class="field"><label>Empresa</label><input id="b3" placeholder="Razão social"></div>
        <div class="field"><label>CNPJ</label><input id="b4" placeholder="00.000.000/0001-00"></div>
      </div>
      <div class="field"><label>Número do cartão</label><input id="b5" placeholder="0000 0000 0000 0000"></div>
      <div class="entgrid"><div class="field"><label>Validade</label><input placeholder="MM/AA"></div><div class="field"><label>CVV</label><input placeholder="000"></div></div>
      <div class="note amber" style="margin-top:6px"><b>Simulação.</b> Nenhum dado é transmitido e nenhuma cobrança é realizada. Não digite dados reais de cartão.</div>`;
    F.innerHTML=`<button class="btn btn-o" onclick="ST.step=1;renderStep()">Voltar</button>
      <div class="sp" style="text-align:right;margin-right:14px"><div style="font-size:11.5px;color:var(--mut)">Total no ano</div><div class="cf" style="font-weight:700;color:var(--azul);font-size:17px">R$ ${price().toLocaleString('pt-BR')}</div></div>
      <button class="btn btn-p" onclick="finish()">Confirmar assinatura</button>`;
  }
  else{
    const nm=(ST._n||'').split(' ')[0]||'tudo certo';
    B.innerHTML=`<div class="ok"><div class="ck">✓</div>
      <div class="pill">ASSINATURA ATIVA</div>
      <h3 style="margin-top:14px">Pronto, ${nm}. O seu AgroTerra está no ar.</h3>
      <p class="sub" style="max-width:470px;margin:10px auto 0">Enviamos o acesso, o contrato e a nota fiscal para ${ST._m||'o seu e-mail'}. O pacote <b>${p.name}</b>${ST.plan==='regional'?' — '+REGIOES.find(r=>r.id===ST.regiao).n:''} já está liberado.</p>
      <div class="sum" style="text-align:left;max-width:470px;margin:26px auto 0">
        <div class="l"><span>Pacote</span><b>${p.name}</b></div>
        <div class="l"><span>Pagamento</span><b>${ST.pay==='vista'?'Antecipado — 10 parcelas':'12 × R$ '+p.mo.toLocaleString('pt-BR')}</b></div>
        <div class="l"><span>Próxima virada da base</span><b>janeiro de 2027</b></div>
        <div class="l tot"><span>Total no ano</span><span>R$ ${price().toLocaleString('pt-BR')}</span></div>
      </div>
      <div class="trust" style="justify-content:center;margin-top:20px"><span>7 dias para desistir</span><span>Onboarding por e-mail em 24h</span></div>
      <div style="display:flex;gap:12px;justify-content:center;margin-top:26px">
        <button class="btn btn-p" onclick="closeAll();go('plataforma')">Entrar na plataforma</button>
        <button class="btn btn-o" onclick="closeAll()">Fechar</button></div></div>`;
    F.innerHTML='';
  }
}
function finish(){
  const n=document.getElementById('b1').value.trim(),m=document.getElementById('b2').value.trim();
  if(!n||!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(m)){toast('Preencha nome e um e-mail corporativo válido.');return}
  ST._n=escapeHtml(n);ST._m=escapeHtml(m);ST.step=3;renderStep();
}

/* ───────── APP PREVIEW ───────── */
let chart;
function initApp(){
  document.getElementById('fPolo').innerHTML=POLOS.map((p,i)=>`<option value="${i}">${p.n}</option>`).join('');
  renderApp();
}
function renderApp(){
  const p=POLOS[+document.getElementById('fPolo').value];
  const cl=document.getElementById('fClasse').value;
  const idx=cl==='all'?CLASSES.map((_,i)=>i):[+cl];
  const f=(v)=>fmt(v);
  let html=`<tr><th>Classe de uso do solo</th><th>2024</th><th>2025</th><th>Mínimo 2026</th><th>Médio 2026</th><th>Máximo 2026</th></tr>`;
  idx.forEach(i=>{
    const c=CLASSES[i],b=c.v*p.f;
    html+=`<tr><td style="text-align:left">${c.n}</td><td>${f(b*0.86)}</td><td>${f(b*0.93)}</td><td>${f(b*0.81)}</td><td><b>${f(b)}</b></td><td>${f(b*1.16)}</td></tr>`;
  });
  if(cl==='all'){
    html+=`<tr class="lock"><td style="text-align:left">Polo 45 — Oeste da Bahia</td><td colspan="5">bloqueado — pacote Brasil Completo</td></tr>
           <tr class="lock"><td style="text-align:left">Polo 78 — Norte do Paraná</td><td colspan="5">bloqueado — pacote Brasil Completo</td></tr>`;
  }
  document.getElementById('appTbl').innerHTML=html;
  document.getElementById('rpTitle').textContent=p.n;
  document.getElementById('rpMeta').textContent=p.m+'  —  levantamento de julho de 2026  ·  variação no semestre: '+p.var;
  const t=REL[p.n]||DEF;
  document.getElementById('rpP1').textContent=t[0];
  document.getElementById('rpP2').textContent=t[1];
  const base=CLASSES[0].v*p.f;
  const data=[base*0.79,base*0.86,base*0.93,base];
  if(chart)chart.destroy();
  chart=new Chart(document.getElementById('chart'),{type:'line',
    data:{labels:['2023','2024','2025','2026'],datasets:[{data:data,borderColor:'#287052',backgroundColor:'rgba(40,112,82,.1)',fill:true,tension:.32,pointBackgroundColor:'#287052',pointRadius:4,borderWidth:2.5}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>fmt(c.parsed.y)+'/ha'}}},
      scales:{y:{ticks:{callback:v=>'R$ '+(v/1000).toFixed(0)+'k',font:{size:10},color:'#8C94A6'},grid:{color:'#E6EBE5'}},
              x:{ticks:{font:{size:10},color:'#8C94A6'},grid:{display:false}}}}});
}

initCalc();renderPlans();initApp();

// Legacy prototype handlers stay local to this page's bundle.
Object.assign(window, { go, closeAll, openEnt, openBuy, fillCity, calc, resetCalc, gate, sendEnt, renderStep, finish, renderApp });
Object.defineProperty(window, 'ST', { get: () => ST });
function escapeHtml(value) { return value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])); }

const menuToggle = document.querySelector('[data-menu-toggle]');
const mainNav = document.querySelector('[data-nav]');
function setMenuOpen(open) {
  mainNav.classList.toggle('open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
}
menuToggle.addEventListener('click', () => setMenuOpen(!mainNav.classList.contains('open')));
mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenuOpen(false)));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && mainNav.classList.contains('open')) {
    setMenuOpen(false);
    menuToggle.focus();
  }
});

// Add keyboard access and field associations to the original dynamic prototype.
let focusedBeforeDialog;
let activeDialog;
function enhancePrototype() {
  document.querySelectorAll('.terra-content a[onclick]:not([href]), .terra-content .opt').forEach(control => {
    control.setAttribute('role', 'button');
    control.tabIndex = 0;
    if (control.classList.contains('opt')) control.setAttribute('aria-pressed', String(control.classList.contains('sel')));
  });
  document.querySelectorAll('.terra-content .field').forEach((field, index) => {
    const label = field.querySelector('label');
    const input = field.querySelector('input, select');
    if (!label || !input) return;
    if (!input.id) input.id = `terra-field-${index}`;
    label.htmlFor = input.id;
  });
  const overlay = document.querySelector('.ov.on');
  if (overlay !== activeDialog) {
    if (overlay) {
      focusedBeforeDialog ??= document.activeElement;
      activeDialog = overlay;
      overlay.querySelector('.x').focus();
    } else {
      activeDialog = null;
    }
    document.querySelector('.terra-site-header').inert = Boolean(overlay);
    document.querySelector('.terra-content main').inert = Boolean(overlay);
    document.querySelector('.site-footer').inert = Boolean(overlay);
    if (!overlay) {
      focusedBeforeDialog?.focus();
      focusedBeforeDialog = null;
    }
  }
  if (overlay && document.activeElement === document.body) overlay.querySelector('.x').focus();
}
document.querySelectorAll('.ov').forEach(overlay => {
  overlay.setAttribute('data-lenis-prevent', '');
  const dialog = overlay.querySelector('.modal');
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  const title = dialog.querySelector('.mhead .cf');
  title.id = `${overlay.id}-title`;
  dialog.setAttribute('aria-labelledby', title.id);
});
new MutationObserver(enhancePrototype).observe(document.querySelector('.terra-content'), {
  childList: true, subtree: true, attributes: true, attributeFilter: ['class'],
});
document.addEventListener('keydown', event => {
  const control = event.target.closest('.terra-content [role="button"]');
  if (control && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    control.click();
  }
  if (event.key !== 'Tab' || !activeDialog) return;
  const focusable = [...activeDialog.querySelectorAll('button, input, select, a[href], [tabindex="0"]')]
    .filter(element => !element.disabled && element.getClientRects().length);
  const first = focusable[0], last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
enhancePrototype();

// Anchor offsets follow the actual navigation height, including wrapped mobile links.
const updateProductNavHeight = () => {
  document.body.style.setProperty('--terra-product-nav-height', `${productNav.getBoundingClientRect().height}px`);
  if (typeof lenis.options.anchors === 'object') {
    lenis.options.anchors.offset = -getStickyOffset();
  }
  lenis.resize();
};
const stickyResizeObserver = new ResizeObserver(updateProductNavHeight);
stickyResizeObserver.observe(productNav);
stickyResizeObserver.observe(siteHeader);
updateProductNavHeight();
