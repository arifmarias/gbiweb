(() => {
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;

/* nav */
const nav = $('#nav'), menu = $('#menu'), burger = $('#burger');
const onScroll = () => nav.classList.toggle('stuck', scrollY > 24);
addEventListener('scroll', onScroll, { passive: true }); onScroll();
burger.addEventListener('click', () => {
  const open = burger.getAttribute('aria-expanded') !== 'true';
  burger.setAttribute('aria-expanded', open); menu.classList.toggle('open', open);
});
menu.addEventListener('click', e => { if (e.target.closest('a')) { burger.setAttribute('aria-expanded', false); menu.classList.remove('open'); } });

/* tabs: roles, model mode, offices */
function tabsOf(sel, onPick) {
  const list = $$(sel);
  const pick = n => { list.forEach((t, i) => { t.setAttribute('aria-selected', i === n); t.tabIndex = i === n ? 0 : -1; }); onPick(n, list[n]); };
  list.forEach((t, i) => {
    t.addEventListener('click', () => pick(i));
    t.addEventListener('keydown', e => {
      const k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]; if (!k) return;
      e.preventDefault(); const j = (i + k + list.length) % list.length; pick(j); list[j].focus();
    });
  });
}
tabsOf('.tabs [role=tab]', (n, t) => {
  $$('.tabs [role=tab]').forEach(b => { $('#' + b.getAttribute('aria-controls')).hidden = b !== t; });
  if (!calm) gsap.from('#r' + n + ' li, #r' + n + ' .big', { y: 16, opacity: 0, duration: .5, stagger: .06, ease: 'power3.out' });
});

const modes = {
  local: { kind: 'Local model', name: 'Open models via Ollama', cap: 'Questions, schema and results stay inside your network. The model runs on your own hardware.' },
  hosted: { kind: 'Hosted model', name: 'Anthropic, OpenAI, Gemini and others', cap: 'Only what the model needs to answer goes to the provider you chose, under your own API key. The admin can switch it at any time.' }
};
tabsOf('.seg [role=tab]', (n, t) => {
  const m = modes[t.dataset.mode], f = $('#flow');
  f.classList.toggle('local', t.dataset.mode === 'local'); f.classList.toggle('hosted', t.dataset.mode === 'hosted');
  f.setAttribute('aria-labelledby', t.id);
  $('#mkind').textContent = m.kind; $('#mname').textContent = m.name; $('#flowcap').textContent = m.cap;
});

/* local time at each office */
const clocks = $$('.otime');
const tick = () => clocks.forEach(c => { c.textContent = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: c.dataset.tz }); });
tick(); setInterval(tick, 30000);

/* trust: click a figure, see its receipt */
const RC = ['Retail', 'Wholesale', 'Online'].map((name, i) => ({
  name, v: ['14.2%', '9.8%', '0.2%'][i], k: `${name} against plan, this quarter`,
  flt: `this quarter · division = ${name}`,
  sql: `SELECT d.name, 100 * (SUM(s.amount) / p.target - 1) AS vs_plan\nFROM sales_orders s JOIN plan_targets p ON p.division_id = s.division_id\nWHERE s.quarter = 'this' AND d.name = '${name}'\nGROUP BY d.name, p.target`
}));
$$('.fig').forEach((b, i) => b.addEventListener('click', () => {
  $$('.fig').forEach(f => f.setAttribute('aria-pressed', f === b));
  const r = RC[i];
  $('#rv').textContent = r.v; $('#rk').textContent = r.k; $('#rflt').textContent = r.flt; $('#rsql').textContent = r.sql;
  if (!calm) gsap.fromTo('.receipt > *:not(.rl)', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .35, stagger: .05, ease: 'power2.out', overwrite: true });
}));

/* spotlight cards */
$$('.spot').forEach(c => c.addEventListener('pointermove', e => {
  const r = c.getBoundingClientRect();
  c.style.setProperty('--mx', e.clientX - r.left + 'px'); c.style.setProperty('--my', e.clientY - r.top + 'px');
}));

/* hero app mockup: pick a question, see the answer view */
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthsFrom = (m0, y0, n) => Array.from({ length: n }, (_, i) => `${MON[(m0 + i) % 12]} ${y0 + Math.floor((m0 + i) / 12)}`);
const fmt = n => Math.round(n).toLocaleString('en-US');
const orders = [1, 3, 6, 7, 8, 15, 16, 16, 24, 28, 23, 28, 32, 36, 42, 46, 44, 49, 40, 27, 38, 41, 48, 44, 33, 48, 43, 42, 41, 55, 45, 52, 39, 56, 104];
const oLab = monthsFrom(1, 2023, orders.length);
const oTotal = orders.reduce((a, b) => a + b, 0);
const active = [6900, 7050, 7120, 7300, 7410, 7500, 7620, 7800, 7890, 8010, 8170, 8420];
const aLab = monthsFrom(0, 2025, active.length);
const div = [['Retail', 14.2], ['Wholesale', 9.8], ['Corporate', 5.1], ['Partners', 3.4], ['Online', 0.2]];
const clm = [['Property', 48.2], ['Health', 31.6], ['Motor', 27.9], ['Marine', 19.4], ['Liability', 12.3]];
const cTotal = clm.reduce((a, r) => a + r[1], 0);
const QS = [
  { q: 'How did monthly orders change over time?', type: 'line', title: 'Orders per month', vals: orders, labs: oLab, unit: '',
    ans: [`Monthly orders grew from ${orders[0]} in ${oLab[0]} to`, `${orders.at(-1)} in ${oLab.at(-1)},`, 'the highest month so far. Growth was steady, with one dip in mid-2024.'],
    kpis: [['Latest month', orders.at(-1), fmt, `▲ ${Math.round((orders.at(-1) / orders.at(-2) - 1) * 100)}% vs ${oLab.at(-2)}`], ['Total orders', oTotal, fmt, `${oLab[0]} to ${oLab.at(-1)}`, 1], ['Average per month', oTotal / orders.length, fmt, `${orders.length} months`, 1]],
    used: 'orders', how: ['tables: orders', 'filter: all time', `rows: ${orders.length}`], fu: ['Break down by region', 'Compare with the year before'] },
  { q: 'Which divisions are furthest ahead of plan?', type: 'bars', title: 'Against plan, this quarter', rows: div, unit: '%',
    ans: ['Retail leads at 14.2% above plan,', '', 'ahead of Wholesale at 9.8%. Online is on plan.'],
    kpis: [['Top division', 14.2, v => '+' + v.toFixed(1) + '%', 'Retail'], ['Average', div.reduce((a, r) => a + r[1], 0) / div.length, v => '+' + v.toFixed(1) + '%', '5 divisions', 1], ['Spread', 14.2 - 0.2, v => v.toFixed(1) + ' pts', 'top to bottom', 1]],
    used: 'sales_orders, plan_targets', how: ['tables: sales_orders, plan_targets', 'filter: this quarter, vs plan', 'rows: 5'], fu: ['Compare with last quarter', 'Show by month'] },
  { q: 'What is the total amount of all claim payments?', type: 'bars', title: 'Claim payments by type (m)', rows: clm, unit: 'm',
    ans: [`Claim payments total ${cTotal.toFixed(1)}m.`, '', `Property is the largest share at ${Math.round(clm[0][1] / cTotal * 100)}%, followed by Health at ${Math.round(clm[1][1] / cTotal * 100)}%.`],
    kpis: [['Total paid', cTotal, v => v.toFixed(1) + 'm', 'all settled claims'], ['Largest type', clm[0][1] / cTotal * 100, v => Math.round(v) + '%', 'Property', 1], ['Claim types', clm.length, fmt, 'in the data', 1]],
    used: 'claim_payments, claim_types', how: ['tables: claim_payments, claim_types', 'filter: settled claims', 'rows: 5'], fu: ['Compare with last year', 'Show by month'] },
  { q: 'How many customers were active this month?', type: 'line', title: 'Active customers per month', vals: active, labs: aLab, unit: '', min: 6000, max: 9000,
    ans: ['', `${fmt(active.at(-1))} customers were active in ${aLab.at(-1)},`, `up ${((active.at(-1) / active.at(-2) - 1) * 100).toFixed(1)}% on ${aLab.at(-2)}. Growth has held for twelve months.`],
    kpis: [['Active this month', active.at(-1), fmt, `▲ ${((active.at(-1) / active.at(-2) - 1) * 100).toFixed(1)}% vs ${aLab.at(-2)}`], ['New this month', 612, fmt, 'first purchase', 1], ['Returning', active.at(-1) - 612, fmt, 'bought before', 1]],
    used: 'customers, orders', how: ['tables: customers, orders', 'filter: active = bought in month', `rows: ${active.length}`], fu: ['Break down by region', 'Compare with the year before'] }
];
const el = { start: $('#vstart'), ans: $('#vans'), bub: $('#abub'), text: $('#atext'), kpis: $('#akpis'), title: $('#atitle'), body: $('#abody'), used: $('#aused'), how: $('#ahow'), howrow: $('#ahowrow'), fups: $('#afups') };
let qc = null, view = 'chart', run = null, touched = false, lastPick = null;

function lineChart(d) {
  const W = 560, H = 132, n = d.vals.length, min = d.min ?? 0, max = d.max ?? Math.ceil(Math.max(...d.vals) / 20) * 20;
  const pts = d.vals.map((v, i) => [i / (n - 1) * W, H - (v - min) / (max - min) * H]);
  const path = 'M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L');
  const last = pts.at(-1), pct = v => (v * 100).toFixed(2) + '%';
  return `<div class="lc"><div class="ya"><span>${fmt(max)}</span><span>${fmt((max + min) / 2)}</span><span>${fmt(min)}</span></div>
    <div class="plot"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#46c48f" stop-opacity=".28"/><stop offset="1" stop-color="#46c48f" stop-opacity="0"/></linearGradient></defs>
    <line class="gl" x1="0" x2="${W}" y1="0" y2="0"/><line class="gl" x1="0" x2="${W}" y1="${H / 2}" y2="${H / 2}"/><line class="gl" x1="0" x2="${W}" y1="${H}" y2="${H}"/>
    <path class="ar" d="${path} L${W} ${H} L0 ${H} Z"/><path class="ln" d="${path}"/></svg>
    <span class="pt" style="left:${pct(last[0] / W)};top:${pct(last[1] / H)}"></span><span class="ptv" style="left:${pct(last[0] / W)};top:${pct(last[1] / H)}">${fmt(d.vals.at(-1))}</span></div>
    <div class="xa"><span>${d.labs[0]}</span><span>${d.labs[Math.floor(n / 2)]}</span><span>${d.labs.at(-1)}</span></div></div>`;
}
function barChart(d) {
  const max = Math.max(...d.rows.map(r => r[1]));
  return `<div class="bars">${d.rows.map((r, i) => `<div class="bar${i ? '' : ' top'}"><span>${r[0]}</span><div class="t"><i style="--v:${(r[1] / max * 100).toFixed(1)}%"></i></div><em>${r[1]}${d.unit}</em></div>`).join('')}</div>`;
}
function table(d) {
  const rows = d.type === 'line' ? d.vals.map((v, i) => [d.labs[i], fmt(v)]).slice(-6).reverse() : d.rows.map(r => [r[0], r[1] + d.unit]);
  return `<table class="tb"><thead><tr><th>${d.type === 'line' ? 'Month' : 'Name'}</th><th>Value</th></tr></thead><tbody>${rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</tbody></table>${d.type === 'line' ? '<p class="tbn">Latest 6 months shown</p>' : ''}`;
}
const words2 = d => d.ans.join(' ').trim().split(/\s+/);
function renderText(d, k) {
  const w = words2(d);
  const wc = s => s.trim() ? s.trim().split(/\s+/).length : 0;
  const start = d.ans[1] ? wc(d.ans[0]) : 0, end = start + (d.ans[1] ? wc(d.ans[1]) : wc(d.ans[0]));
  el.text.innerHTML = w.slice(0, k).map((t, i) => i >= start && i < end ? `<b>${t}</b>` : t).join(' ');
}
function fill(d) {
  el.bub.textContent = d.q;
  el.kpis.innerHTML = d.kpis.map(k => `<div class="kpi"><small>${k[0]}</small><b>${k[2](k[1])}</b><em${k[4] ? ' class="n"' : ''}>${k[3]}</em></div>`).join('');
  el.title.textContent = d.title;
  el.used.innerHTML = `Used <b>${d.used}</b>`;
  el.howrow.innerHTML = d.how.map(h => `<span>${h}</span>`).join('');
  el.fups.innerHTML = d.fu.map(f => `<span>${f}</span>`).join('');
  setView('chart', d, false);
}
function setView(v, d, animate) {
  view = v;
  $$('.tg button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === v));
  el.body.innerHTML = v === 'table' ? table(d) : d.type === 'line' ? lineChart(d) : barChart(d);
  if (animate && !calm) gsap.from(el.body.children, { opacity: 0, y: 8, duration: .35, ease: 'power2.out' });
}
function show(i, auto, kb) {
  if (!auto) touched = true;
  run && run.kill(); qc = QS[i]; lastPick = i;
  el.start.hidden = true; el.ans.hidden = false;
  el.howrow.hidden = true; el.how.setAttribute('aria-expanded', false);
  fill(qc);
  if (calm) { renderText(qc, words2(qc).length); kb && $('#vback').focus({ preventScroll: true }); return; }
  const w = words2(qc), o = { n: 0 }, kp = $$('.kpi', el.kpis);
  renderText(qc, 0);
  const line = $('.ln', el.body), bars = $$('.bar', el.body);
  gsap.set([el.bub, ...kp, '.acard', '.ameta', el.fups], { opacity: 0, y: 12 });
  run = gsap.timeline()
    .to(el.bub, { opacity: 1, y: 0, duration: .4, ease: 'power3.out' })
    .to(o, { n: w.length, duration: w.length * .045, ease: 'none', onUpdate: () => renderText(qc, Math.round(o.n)) }, '>-.05')
    .to(kp, { opacity: 1, y: 0, duration: .45, stagger: .08, ease: 'power3.out' }, '-=.9')
    .to('.acard', { opacity: 1, y: 0, duration: .45, ease: 'power3.out' }, '-=.5');
  if (line) {
    const len = line.getTotalLength(), extras = $$('.ar, .pt, .ptv', el.body);
    gsap.set(line, { strokeDasharray: len, strokeDashoffset: len }); gsap.set(extras, { opacity: 0 });
    run.to(line, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' }, '<.1').to(extras, { opacity: 1, duration: .5 }, '-=.3');
  } else {
    const fills = bars.map(b => $('.t i', b)), vals = bars.map(b => $('em', b));
    gsap.set(fills, { scaleX: 0 }); gsap.set(vals, { opacity: 0 });
    run.to(fills, { scaleX: 1, duration: .8, stagger: .08, ease: 'power3.out' }, '<.1').to(vals, { opacity: 1, duration: .3, stagger: .08 }, '<.2');
  }
  run.to(['.ameta', el.fups], { opacity: 1, y: 0, duration: .4, stagger: .1, ease: 'power2.out' }, '-=.4');
  kb && $('#vback').focus({ preventScroll: true });
}
function back(kb) {
  run && run.kill(); el.ans.hidden = true; el.start.hidden = false;
  if (!calm) gsap.from('#vstart > *', { opacity: 0, y: 10, duration: .4, stagger: .05, ease: 'power3.out' });
  const p = $(`.pick[data-i="${lastPick}"]`); kb && p && p.focus({ preventScroll: true });
}
// keyboard "clicks" have detail 0: only then move focus (a mouse click must not show a focus ring)
$$('.pick').forEach(b => b.addEventListener('click', e => show(+b.dataset.i, false, e.detail === 0)));
$('#vback').addEventListener('click', e => back(e.detail === 0));
$$('.tg button').forEach(b => b.addEventListener('click', () => qc && setView(b.dataset.v, qc, true)));
el.how.addEventListener('click', () => { const o = el.howrow.hidden; el.howrow.hidden = !o; el.how.setAttribute('aria-expanded', o); });
$('#app').addEventListener('pointerdown', () => { touched = true; });
// first visit: show the answer view once if the visitor has not touched it
if (!calm) setTimeout(() => { if (!touched) show(0, true); }, 2800);

/* the race: each lane takes progress p (0..1) */
function lane(el, p) {
  const items = $$('li', el), n = items.length;
  el.style.setProperty('--p', p);
  items.forEach((li, i) => li.classList.toggle('done', p >= i / (n - 1) - .001));
  el.classList.toggle('end', p >= .999);
  $('.clock', el).textContent = p >= .999 ? el.dataset.end : p > .02 ? el.dataset.mid : el.dataset.start;
}
if (calm) { $$('.lane').forEach(l => lane(l, 1)); return; }

/* motion */
gsap.registerPlugin(ScrollTrigger);

// split headings into words
$$('[data-split]').forEach(h => {
  h.setAttribute('aria-label', h.textContent.replace(/\s*\|\s*/g, ' '));
  h.innerHTML = h.textContent.trim().split(/\s+/).map(w => w === '|' ? '<br>' : `<span class="w" aria-hidden="true"><span>${w}</span></span>`).join(' ');
});
const wordsOf = h => $$('.w>span', h);
gsap.from(wordsOf($('.hero h1')), { yPercent: 110, duration: 1, stagger: .07, ease: 'power4.out', delay: .1 });
gsap.from('.hero .lead, .hero .cta-row', { y: 22, opacity: 0, duration: .9, stagger: .12, delay: .55, ease: 'power3.out' });
gsap.from('.demo', { y: 50, opacity: 0, duration: 1.2, delay: .3, ease: 'power3.out' });
$$('[data-split]').slice(1).forEach(h => gsap.from(wordsOf(h), {
  yPercent: 110, duration: .9, stagger: .05, ease: 'power4.out',
  scrollTrigger: { trigger: h, start: 'top 85%', once: true } }));

const reveal = (sel, vars = {}) => $$(sel).forEach(el => gsap.from(el, { y: 36, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true }, ...vars }));
reveal('.sources');reveal('.tabs, .tabpanel'); reveal('.qa details', { y: 20 }); reveal('.flow'); reveal('.office', { y: 20 });
gsap.from('.bento .card', { y: 40, opacity: 0, duration: .8, stagger: .08, ease: 'power3.out', scrollTrigger: { trigger: '.bento', start: 'top 85%', once: true } });
gsap.from('.rows li', { y: 24, opacity: 0, duration: .7, stagger: .1, ease: 'power3.out', scrollTrigger: { trigger: '.rows', start: 'top 85%', once: true } });
// the race: scroll scrubs the slow route, the direct route finishes as it enters
const [A, B] = $$('.lane');
ScrollTrigger.create({ trigger: '#race', start: 'top 80%', end: 'bottom 55%', onUpdate: s => lane(A, s.progress) });
ScrollTrigger.create({ trigger: '#race', start: 'top 80%', once: true, onEnter: () => { const o = { p: 0 }; gsap.to(o, { p: 1, duration: 1, ease: 'power3.out', delay: .25, onUpdate: () => lane(B, o.p) }); } });

/* how it works: pinned on desktop, timed on small screens */
const steps = $$('#steps li'), panels = $$('.panel'), dots = $$('.dots i');
let cur = -1;
const set = n => {
  if (n === cur) return; cur = n;
  steps.forEach((s, i) => s.classList.toggle('on', i === n));
  panels.forEach((p, i) => p.classList.toggle('on', i === n));
  dots.forEach((d, i) => d.classList.toggle('on', i === n));
};
steps.forEach((s, i) => s.addEventListener('click', () => set(i)));
ScrollTrigger.matchMedia({
  '(min-width:1001px)': () => ScrollTrigger.create({
    trigger: '.how-pin', start: 'top top', end: '+=1500', pin: true,
    onUpdate: s => set(Math.min(2, Math.floor(s.progress * 3)))
  }),
  '(max-width:1000px)': () => {
    let t; const tick = () => { set((cur + 1) % 3); t = gsap.delayedCall(4, tick); };
    return ScrollTrigger.create({ trigger: '.how-sec', start: 'top 70%', end: 'bottom top', onToggle: s => { t && t.kill(); if (s.isActive) { cur = -1; set(0); t = gsap.delayedCall(4, tick); } } });
  }
});

/* magnetic buttons */
if (fine) $$('.magnetic').forEach(b => {
  const x = gsap.quickTo(b, 'x', { duration: .4, ease: 'power3' }), y = gsap.quickTo(b, 'y', { duration: .4, ease: 'power3' });
  b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); x((e.clientX - r.left - r.width / 2) * .25); y((e.clientY - r.top - r.height / 2) * .35); });
  b.addEventListener('pointerleave', () => { x(0); y(0); });
});
})();
