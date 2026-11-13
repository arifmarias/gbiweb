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

/* tabs */
const tabs = $$('[role=tab]');
tabs.forEach((t, i) => {
  t.addEventListener('click', () => pick(i));
  t.addEventListener('keydown', e => {
    const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (!k) return;
    pick((i + k + tabs.length) % tabs.length); tabs[(i + k + tabs.length) % tabs.length].focus();
  });
});
function pick(n) {
  tabs.forEach((t, i) => {
    t.setAttribute('aria-selected', i === n); t.tabIndex = i === n ? 0 : -1;
    $('#' + t.getAttribute('aria-controls')).hidden = i !== n;
  });
  if (!calm) gsap.from('#r' + n + ' li, #r' + n + ' .big', { y: 16, opacity: 0, duration: .5, stagger: .06, ease: 'power3.out' });
}

/* spotlight cards */
$$('.spot').forEach(c => c.addEventListener('pointermove', e => {
  const r = c.getBoundingClientRect();
  c.style.setProperty('--mx', e.clientX - r.left + 'px'); c.style.setProperty('--my', e.clientY - r.top + 'px');
}));

/* demo */
const demos = [
  { q: 'Which regions grew fastest last quarter?',
    bold: 'West grew fastest at 14.2%,', rest: 'ahead of North at 9.8%. South was flat.',
    unit: '%', rows: [['West', 14.2], ['North', 9.8], ['East', 5.1], ['Central', 3.4], ['South', 0.2]],
    how: ['How I got this', 'tables: sales_orders, regions', 'filter: last quarter, completed'] },
  { q: 'Where are claims taking longest to settle?',
    bold: 'Property claims take longest: 31 days on average,', rest: '9 more than motor. Liability is closing fastest.',
    unit: 'd', rows: [['Property', 31], ['Marine', 27], ['Health', 24], ['Motor', 22], ['Liability', 18]],
    how: ['How I got this', 'tables: claims, claim_types', 'filter: settled, last 90 days'] }
];
const dqt = $('#dqt'), dthink = $('#dthink'), dans = $('#dans'), dchart = $('#dchart'), dhow = $('#dhow');
function build(d) {
  const max = Math.max(...d.rows.map(r => r[1]));
  dchart.innerHTML = d.rows.map((r, i) =>
    `<div class="bar${i ? '' : ' top'}"><span>${r[0]}</span><div class="t"><i style="--v:${(r[1] / max * 100).toFixed(1)}%"></i></div><em>${r[1]}${d.unit}</em></div>`).join('');
  dhow.innerHTML = d.how.map(h => `<span>${h}</span>`).join('');
}
const words = d => (d.bold + ' ' + d.rest).split(' ');
function render(d, k) {
  const w = words(d), nb = d.bold.split(' ').length;
  dans.innerHTML = k <= nb ? `<b>${w.slice(0, k).join(' ')}</b>` : `<b>${w.slice(0, nb).join(' ')}</b> ${w.slice(nb, k).join(' ')}`;
}
function still(d) { dqt.textContent = d.q; build(d); render(d, words(d).length); }
function play(i) {
  const d = demos[i % demos.length], o = { n: 0 }, m = { n: 0 }, w = words(d);
  dqt.textContent = ''; dans.innerHTML = ''; build(d);
  gsap.set(['#dchart .t i'], { scaleX: 0 }); gsap.set('#dchart .bar em', { opacity: 0 }); gsap.set('#dhow span', { opacity: 0, y: 6 }); gsap.set(dthink, { opacity: 0 });
  gsap.timeline({ onComplete: () => play(i + 1) })
    .to(o, { n: d.q.length, duration: d.q.length * .03, ease: 'none', onUpdate: () => dqt.textContent = d.q.slice(0, Math.round(o.n)) }, .5)
    .to(dthink, { opacity: 1, duration: .25 }, '+=.2')
    .to(m, { n: w.length, duration: w.length * .06, ease: 'none', onUpdate: () => render(d, Math.round(m.n)) }, '+=1.1')
    .to(dthink, { opacity: 0, duration: .2 }, '<')
    .to('#dchart .t i', { scaleX: 1, duration: .9, stagger: .09, ease: 'power3.out' }, '-=.4')
    .to('#dchart .bar em', { opacity: 1, duration: .4, stagger: .09 }, '<.3')
    .to('#dhow span', { opacity: 1, y: 0, duration: .4, stagger: .1, ease: 'power2.out' }, '-=.3')
    .to({}, { duration: 4 });
}
if (calm) still(demos[0]); else play(0);

if (calm) return;

/* motion */
gsap.registerPlugin(ScrollTrigger);

// split headings into words
$$('[data-split]').forEach(h => {
  h.setAttribute('aria-label', h.textContent);
  h.innerHTML = h.textContent.trim().split(/\s+/).map(w => `<span class="w" aria-hidden="true"><span>${w}</span></span>`).join(' ');
});
const wordsOf = h => $$('.w>span', h);
gsap.from(wordsOf($('.hero h1')), { yPercent: 110, duration: 1, stagger: .07, ease: 'power4.out', delay: .1 });
gsap.from('.hero .lead, .hero .cta-row', { y: 22, opacity: 0, duration: .9, stagger: .12, delay: .55, ease: 'power3.out' });
gsap.from('.demo', { y: 50, opacity: 0, duration: 1.2, delay: .3, ease: 'power3.out' });
$$('[data-split]').slice(1).forEach(h => gsap.from(wordsOf(h), {
  yPercent: 110, duration: .9, stagger: .05, ease: 'power4.out',
  scrollTrigger: { trigger: h, start: 'top 85%', once: true } }));

const reveal = (sel, vars = {}) => $$(sel).forEach(el => gsap.from(el, { y: 36, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true }, ...vars }));
reveal('.sources'); reveal('.path'); reveal('.tabs, .tabpanel'); reveal('.qa details', { y: 20 }); reveal('.final .btn');
gsap.from('.bento .card', { y: 40, opacity: 0, duration: .8, stagger: .08, ease: 'power3.out', scrollTrigger: { trigger: '.bento', start: 'top 85%', once: true } });
gsap.from('.rows li', { y: 24, opacity: 0, duration: .7, stagger: .1, ease: 'power3.out', scrollTrigger: { trigger: '.rows', start: 'top 85%', once: true } });
// "With GBI" path draws shorter: the before steps slide in one by one
gsap.from('.before li', { opacity: 0, x: -16, duration: .5, stagger: .1, scrollTrigger: { trigger: '.gap .paths', start: 'top 80%', once: true } });

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
