// ── Cursor ──────────────────────────────────────────────────
const dot  = document.getElementById('cdot');
const ring = document.getElementById('cring');
let mx=0,my=0,rx=0,ry=0;

document.addEventListener('mousemove',e=>{
  mx=e.clientX; my=e.clientY;
  dot.style.left=mx+'px'; dot.style.top=my+'px';
});
(function lerp(){
  rx+=(mx-rx)*.1; ry+=(my-ry)*.1;
  ring.style.left=rx+'px'; ring.style.top=ry+'px';
  requestAnimationFrame(lerp);
})();
document.querySelectorAll('a,button,.tab-btn,.m-card,.bento-cell').forEach(el=>{
  el.addEventListener('mouseenter',()=>document.body.classList.add('hovering'));
  el.addEventListener('mouseleave',()=>document.body.classList.remove('hovering'));
});

// ── Loader ──────────────────────────────────────────────────
gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });
const loader = document.getElementById('loader');
const llogo  = document.getElementById('l-logo');

const ltagline = document.getElementById('l-tagline');

const loaderTL = gsap.timeline({ onComplete: startSite });
loaderTL
  // Logo zoom-in
  .to(llogo,    { opacity:1, scale:1, duration:.8, ease:'power3.out' })
  // Tagline slides up + fades in
  .to(ltagline, { opacity:1, y:0, duration:.6, ease:'power3.out' }, '-=.3')
  // Subtle pulse on logo
  .to(llogo,    { scale:1.06, duration:.3, ease:'power1.inOut' })
  .to(llogo,    { scale:1,    duration:.3, ease:'power1.inOut' })
  // Burst exit: logo scales up, tagline fades out
  .to(llogo,    { scale:2.4, opacity:0, duration:.55, ease:'power2.in' }, '+=.2')
  .to(ltagline, { opacity:0, y:-8,       duration:.35, ease:'power2.in' }, '<')
  // Loader slides up
  .to(loader,   { yPercent:-100, duration:.75, ease:'power4.inOut' }, '-=.2');

function startSite() {
  loader.style.display = 'none';

  // Hero entrance
  const tl = gsap.timeline();
  tl.to('#h-eye span',           { y:'0%', duration:.8, ease:'power3.out' }, .1)
    .to('.hero-title .line span',{ y:'0%', duration:1,  ease:'power3.out', stagger:.12 }, .25)
    .to('#h-sub p',              { y:'0%', duration:.8, ease:'power3.out' }, .7)
    .to('#h-act',                { opacity:1, duration:.6, ease:'power2.out' }, .9)
    .to('#h-scroll',             { opacity:1, duration:.6, ease:'power2.out' }, 1);

  // Hero parallax scale-in
  gsap.to('#hero-img', { scale:1, duration:2, ease:'power3.out' });
}

// ── Nav scroll ──────────────────────────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => nav.classList.toggle('solid', scrollY > 60));

// ── Hamburger ───────────────────────────────────────────────
document.getElementById('ham').addEventListener('click', () => nav.classList.toggle('open'));
document.querySelectorAll('#nav-links a').forEach(a =>
  a.addEventListener('click', () => nav.classList.remove('open'))
);

// ── Scroll reveals ──────────────────────────────────────────
document.querySelectorAll('.slide-up').forEach(el => {
  gsap.to(el, {
    opacity:1, y:0, duration:.9, ease:'power3.out',
    scrollTrigger: { trigger:el, start:'top 88%', toggleActions:'play none none none' }
  });
});

// ── Counters ─────────────────────────────────────────────────
document.querySelectorAll('[data-count]').forEach(el => {
  const t = +el.dataset.count;
  ScrollTrigger.create({ trigger:el, start:'top 90%', once:true, onEnter:() => {
    gsap.to({ v:0 }, { v:t, duration:1.8, ease:'power2.out',
      onUpdate: function(){ el.textContent = Math.round(this.targets()[0].v); }
    });
  }});
});

// ── Hero parallax ───────────────────────────────────────────
gsap.to('#hero-img', {
  yPercent:20, ease:'none',
  scrollTrigger: { trigger:'#hero', start:'top top', end:'bottom top', scrub:true }
});
// ── Bánh mì éclaté : canvas scroll-scrub plein écran ──────────
{
  const pin = document.getElementById('bxc-pin');
  const canvas = document.getElementById('bxc-canvas');
  if (pin && canvas) {
    const ctx = canvas.getContext('2d');
    const FRAME_START = 68;
    const FRAME_END = 202;
    const FRAME_TOTAL = FRAME_END - FRAME_START + 1;
    const frameSrc = i => `banh-frames-v3/frame_${String(i).padStart(4,'0')}.jpg`;
    const images = {};
    let lastDrawn = FRAME_START;

    for (let i = FRAME_START; i <= FRAME_END; i++) {
      const img = new Image();
      img.src = frameSrc(i);
      images[i] = img;
    }

    let cw = 0, ch = 0, dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cw = pin.clientWidth; ch = pin.clientHeight;
      canvas.width = cw * dpr; canvas.height = ch * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawFrame(lastDrawn);
    };

    const drawFrame = n => {
      n = Math.min(FRAME_END, Math.max(FRAME_START, n));
      let img = images[n];
      while ((!img || !img.complete || !img.naturalWidth) && n > FRAME_START) { n--; img = images[n]; }
      if (!img || !img.naturalWidth || !cw || !ch) return;
      lastDrawn = n;
      // contain-fit (jamais de crop) : ancré à droite sur PC (à côté du texte),
      // centré en haut sur mobile (place réservée en bas pour les légendes empilées)
      const w = window.innerWidth;
      const isMobile = w <= 768;
      const isTablet = !isMobile && w <= 1024;
      const boxW = cw * (isMobile ? 0.78 : isTablet ? 0.98 : 0.56);
      const boxH = ch * (isMobile ? 0.72 : isTablet ? 0.98 : 0.8);
      const scale = Math.min(boxW / img.naturalWidth, boxH / img.naturalHeight);
      const dw = img.naturalWidth * scale, dh = img.naturalHeight * scale;
      let dx, dy;
      if (isMobile) {
        const rightPad = cw * 0.01;
        dx = cw - dw - rightPad;
        dy = ch * 0.04;
      } else if (isTablet) {
        dx = cw - dw;
        dy = (ch - dh) / 2;
      } else {
        const rightPad = cw * 0.06;
        dx = cw - dw - rightPad;
        dy = (ch - dh) / 2;
      }
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, dx, dy, dw, dh);
    };

    const capItems = document.querySelectorAll('#bxc-caption .bxc-cap-item');
    let activeBand = -1;
    const setBand = progress => {
      const band = Math.min(capItems.length - 1, Math.floor(progress * capItems.length));
      if (band === activeBand) return;
      activeBand = band;
      capItems.forEach((el, i) => el.classList.toggle('active', i === band));
    };

    window.addEventListener('resize', resize);
    resize();
    setBand(0);

    const navOffset = () => {
      const navEl = document.querySelector('nav');
      return navEl ? Math.round(navEl.getBoundingClientRect().height) : 0;
    };

    ScrollTrigger.create({
      trigger: '#bxc-pin',
      start: () => 'top ' + navOffset() + 'px',
      end: () => '+=' + Math.round(pin.getBoundingClientRect().height * (window.innerWidth <= 768 ? 0.7 : 2.2)),
      pin: true,
      pinSpacing: true,
      scrub: window.innerWidth <= 768 ? .15 : .4,
      onUpdate: self => {
        const n = Math.round(FRAME_START + self.progress * (FRAME_TOTAL - 1));
        drawFrame(n);
        setBand(self.progress);
      },
      onRefresh: () => resize()
    });
  }
}

// ── Bento stagger ───────────────────────────────────────────
gsap.fromTo('.bento-cell',
  { opacity:0, y:32 },
  { opacity:1, y:0, duration:.7, stagger:.08, ease:'power3.out',
    scrollTrigger: { trigger:'.bento', start:'top 85%' } }
);

// ── Menu tabs ───────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.menu-panel').forEach(p => p.classList.add('hidden'));
    btn.classList.add('active');
    const panel = document.getElementById('tab-' + btn.dataset.tab);
    if (panel) {
      panel.classList.remove('hidden');
      gsap.fromTo(panel.querySelectorAll('.m-card'),
        { opacity:0, y:20 },
        { opacity:1, y:0, duration:.5, stagger:.06, ease:'power2.out' }
      );
    }
  });
});

// ── Horizontal gallery drag ──────────────────────────────────
const track = document.getElementById('h-track');
let isDown=false, startX, scrollL;
track.addEventListener('mousedown',  e => { isDown=true; startX=e.pageX-track.offsetLeft; scrollL=track.scrollLeft; });
track.addEventListener('mouseleave', ()=> isDown=false);
track.addEventListener('mouseup',    ()=> isDown=false);
track.addEventListener('mousemove',  e => {
  if (!isDown) return;
  e.preventDefault();
  track.scrollLeft = scrollL - (e.pageX - track.offsetLeft - startX) * 1.5;
});
track.style.overflowX = 'auto';
track.style.cursor    = 'grab';

// ── Marquee reviews (RAF loop — aucun saut de boucle) ────────
(function initMarquee() {
  function makeMarquee(track, pxPerFrame, startX) {
    if (!track) return { pause: ()=>{}, resume: ()=>{} };
    let x = startX;
    let running = true;
    const half = () => track.scrollWidth / 2;

    function tick() {
      if (!running) { requestAnimationFrame(tick); return; }
      x += pxPerFrame;
      const h = half();
      // modulo sans saut
      if (pxPerFrame < 0 && x <= -h) x += h;
      if (pxPerFrame > 0 && x >= 0)  x -= h;
      track.style.transform = `translateX(${x}px)`;
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    return {
      pause:  () => { running = false; },
      resume: () => { running = true;  }
    };
  }

  const left  = document.querySelector('.track-left');
  const right = document.querySelector('.track-right');

  const mLeft  = makeMarquee(left,  -0.6, 0);   // → gauche
  const mRight = makeMarquee(right,  0.5, -(right ? right.scrollWidth / 2 : 0)); // → droite

  document.querySelectorAll('.marquee-row').forEach((row, i) => {
    const m = i === 0 ? mLeft : mRight;
    row.addEventListener('mouseenter', () => m.pause());
    row.addEventListener('mouseleave', () => m.resume());
  });
})();

// ── Gallery scroll-triggered entrance ───────────────────────
gsap.fromTo('.h-card',
  { opacity:0, x:40 },
  { opacity:1, x:0, duration:.7, stagger:.12, ease:'power3.out',
    scrollTrigger: { trigger:'#h-track', start:'top 85%' } }
);

// ── Gallery image parallax ───────────────────────────────────
document.querySelectorAll('.h-card img').forEach(img => {
  gsap.to(img, {
    yPercent:10, ease:'none',
    scrollTrigger: { trigger:img, start:'top bottom', end:'bottom top', scrub:1.5 }
  });
});


// ── Back to top ──────────────────────────────────────────
const backTop = document.getElementById('back-top');
window.addEventListener('scroll', () => {
  backTop.classList.toggle('visible', scrollY > 400);
});
backTop.addEventListener('click', () => {
  window.scrollTo({ top:0, behavior:'smooth' });
});
// cursor hover state
backTop.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
backTop.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
