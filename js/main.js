'use strict';

/* SCROLL PROGRESS  */
const progBar = document.getElementById('progress-bar');
window.addEventListener('scroll', () => {
  const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
  progBar.style.width = pct + '%';
}, { passive: true });

/* NAV SCROLL + ACTIVE */
const nav = document.getElementById('nav');
const navLinkEls = document.querySelectorAll('.nl');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 24);
  const sections = document.querySelectorAll('section[id]');
  let cur = '';
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 110) cur = s.id; });
  navLinkEls.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + cur));
  document.getElementById('back-top').classList.toggle('show', window.scrollY > 500);
}, { passive: true });

/* MOBILE NAV */
const burger = document.getElementById('burger');
const mobileNav = document.getElementById('mobileNav');
burger.addEventListener('click', () => {
  const open = mobileNav.classList.toggle('open');
  burger.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', open);
});
mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  mobileNav.classList.remove('open');
  burger.classList.remove('open');
  burger.setAttribute('aria-expanded', false);
}));

/* THEME TOGGLE */
const themeBtn = document.getElementById('themeBtn');
const moonSvg  = document.getElementById('moonSvg');
const sunSvg   = document.getElementById('sunSvg');
let dark = localStorage.getItem('bo-theme') !== 'light';
function applyTheme() {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  moonSvg.style.display = dark ? '' : 'none';
  sunSvg.style.display  = dark ? 'none' : '';
  localStorage.setItem('bo-theme', dark ? 'dark' : 'light');
}
applyTheme();
themeBtn.addEventListener('click', () => { dark = !dark; applyTheme(); });

/* BACK TO TOP */
document.getElementById('back-top').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* SMOOTH ANCHORS */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 76, behavior: 'smooth' });
  });
});

/* CV BUTTONS  */
document.getElementById('cvBtn').addEventListener('click', (e) => {
  e.preventDefault();
  const link = document.createElement('a');
  link.href = 'resume/Blessing.pdf';
  link.download = 'Blessing.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

/* HERO CANVAS (circuit grid) */
(function () {
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, nodes = [];
  const COLS = 22, ROWS = 12;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildNodes();
  }

  function buildNodes() {
    nodes = [];
    const cW = W / COLS, cH = H / ROWS;
    for (let r = 0; r <= ROWS; r++) {
      for (let c = 0; c <= COLS; c++) {
        nodes.push({
          x: c * cW + (Math.random() - 0.5) * cW * 0.35,
          y: r * cH + (Math.random() - 0.5) * cH * 0.35,
          active: Math.random() < 0.22,
          pulse: Math.random() * Math.PI * 2,
          speed: 0.01 + Math.random() * 0.015,
        });
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const lineC  = 'rgba(91,110,245,';
    const dotC   = isDark ? 'rgba(14,202,212,' : 'rgba(91,110,245,';

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        const maxD = Math.min(W, H) / (Math.min(COLS, ROWS) * 0.8);
        if (d < maxD) {
          const a = (1 - d / maxD) * 0.14;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = lineC + a + ')';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
      if (nodes[i].active) {
        nodes[i].pulse += nodes[i].speed;
        const glow = 0.4 + 0.35 * Math.sin(nodes[i].pulse);
        ctx.beginPath();
        ctx.arc(nodes[i].x, nodes[i].y, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = dotC + glow + ')';
        ctx.fill();
      }
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();
  draw();
})();

/* TYPED TEXT */
(function () {
  const el = document.getElementById('typedEl');
  const words = ['Software Engineer', 'Mobile App Developer', 'Full-Stack Engineer', 'Backend & API Engineer', 'Shopify Developer'];
    
  let wi = 0, ci = 0, del = false;
  function tick() {
    const w = words[wi];
    el.textContent = del ? w.slice(0, --ci) : w.slice(0, ++ci);
    let t = del ? 55 : 95;
    if (!del && ci === w.length)  { del = true; t = 2200; }
    else if (del && ci === 0)     { del = false; wi = (wi + 1) % words.length; t = 350; }
    setTimeout(tick, t);
  }
  setTimeout(tick, 700);
})();

/* REVEAL OBSERVER */
(function () {
  const triggered = new WeakSet();
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('vis');
      e.target.querySelectorAll('[data-count]').forEach(el => {
        if (triggered.has(el)) return;
        triggered.add(el);
        countUp(el);
      });
      if (e.target.dataset.count && !triggered.has(e.target)) {
        triggered.add(e.target);
        countUp(e.target);
      }
      e.target.querySelectorAll('.sk-fill').forEach(b => {
        if (!triggered.has(b)) {
          triggered.add(b);
          setTimeout(() => b.style.width = b.dataset.w + '%', 120);
        }
      });
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.rv,.rv-l,.rv-r,[data-count],.sk-fill').forEach(el => obs.observe(el));
  document.querySelectorAll('.sk-card').forEach(el => obs.observe(el));
})();

function countUp(el) {
  const target = +el.dataset.count;
  const dur = 1800, start = performance.now();
  (function step(now) {
    const p = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(ease * target) + (el.dataset.suffix || '');
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = target + (el.dataset.suffix || '');
  })(start);
}

/* FILTER PROJECTS  */
document.querySelectorAll('.f-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.f-btn').forEach(b => b.classList.remove('on'));
    btn.classList.add('on');
    const f = btn.dataset.f;
    document.querySelectorAll('.proj-card').forEach(c => {
      const match = f === 'all' || (c.dataset.cat || '').includes(f);
      if (match) {
        c.classList.remove('hide');
        c.style.display = '';
      } else {
        c.classList.add('hide');
        setTimeout(() => { if (c.classList.contains('hide')) c.style.display = 'none'; }, 350);
      }
    });
  });
});

/* PROJECT CARD IMAGE SLIDERS */
(function () {
  document.querySelectorAll('[data-slider]').forEach(slider => {
    const slides  = Array.from(slider.querySelectorAll('.ps-slide'));
    const dotsWrap = slider.querySelector('.ps-dots');
    const prevBtn  = slider.querySelector('.ps-prev');
    const nextBtn  = slider.querySelector('.ps-next');
    if (!slides.length) return;

    let cur = 0;

    // Build dots
    slides.forEach((_, i) => {
      const d = document.createElement('div');
      d.className = 'ps-dot' + (i === 0 ? ' on' : '');
      d.addEventListener('click', e => { e.stopPropagation(); go(i); });
      dotsWrap.appendChild(d);
    });

    function go(idx) {
      slides[cur].classList.remove('on');
      dotsWrap.children[cur].classList.remove('on');
      cur = (idx + slides.length) % slides.length;
      slides[cur].classList.add('on');
      dotsWrap.children[cur].classList.add('on');
    }

    prevBtn.addEventListener('click', e => { e.stopPropagation(); go(cur - 1); });
    nextBtn.addEventListener('click', e => { e.stopPropagation(); go(cur + 1); });
  });
})();

/* PHONE VIDEO PLAYER */
/* PHONE VIDEO PLAYERS — generic, handles all instances */
(function () {
  document.querySelectorAll('.ph-video-wrap').forEach(wrap => {
    const video      = wrap.querySelector('video');
    const poster     = wrap.querySelector('.ph-video-poster');
    const playBtn    = wrap.querySelector('.ph-play-btn');
    const toggleBtn  = wrap.querySelector('.ph-ctrl-btn[aria-label="Play / Pause"]');
    const muteBtn    = wrap.querySelector('.ph-ctrl-btn[aria-label="Toggle mute"]');
    const fill       = wrap.querySelector('.ph-progress-fill');
    const playIcon   = wrap.querySelector('[id^="phPlayIcon"]');
    const pauseIcon  = wrap.querySelector('[id^="phPauseIcon"]');
    const muteIcon   = wrap.querySelector('[id^="phMuteIcon"]');
    const unmuteIcon = wrap.querySelector('[id^="phUnmuteIcon"]');

    if (!video) return;

    function hidePoster() {
      if (poster) poster.style.display = 'none';
    }

    function setPlayState(playing) {
      if (playIcon)  playIcon.style.display  = playing ? 'none' : '';
      if (pauseIcon) pauseIcon.style.display = playing ? ''     : 'none';
    }

    // ── Autoplay when scrolled into view ────────────
    let autoPlayed = false;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !autoPlayed) {
          autoPlayed = true;
          obs.disconnect();
          video.muted = true;
          video.load();
          video.play().then(() => {
            hidePoster();
            wrap.classList.add('playing');
            setPlayState(true);
          }).catch(() => {});
        }
      });
    }, { threshold: 0.2 });
    obs.observe(wrap);

    // ── Poster play button ───────────────────────────
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        video.muted = true;
        video.load();
        video.play().then(() => {
          hidePoster();
          wrap.classList.add('playing');
          setPlayState(true);
        }).catch(err => console.warn('Video play failed:', err));
      });
    }

    // ── Play / Pause toggle ──────────────────────────
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        if (video.paused) {
          video.play();
          wrap.classList.add('playing');
          setPlayState(true);
        } else {
          video.pause();
          wrap.classList.remove('playing');
          setPlayState(false);
        }
      });
    }

    // ── Mute toggle ──────────────────────────────────
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        video.muted = !video.muted;
        if (muteIcon)   muteIcon.style.display   = video.muted ? ''     : 'none';
        if (unmuteIcon) unmuteIcon.style.display = video.muted ? 'none' : '';
      });
    }

    // ── Progress bar ─────────────────────────────────
    video.addEventListener('timeupdate', () => {
      if (!video.duration || !fill) return;
      fill.style.width = (video.currentTime / video.duration * 100) + '%';
    });

    const progressBar = wrap.querySelector('.ph-progress-bar');
    if (progressBar) {
      progressBar.addEventListener('click', e => {
        const rect = progressBar.getBoundingClientRect();
        video.currentTime = ((e.clientX - rect.left) / rect.width) * video.duration;
      });
    }

    // ── Sync UI with native play/pause events ────────
    video.addEventListener('play',  () => { setPlayState(true);  wrap.classList.add('playing'); });
    video.addEventListener('pause', () => { setPlayState(false); wrap.classList.remove('playing'); });
  });
})();




/* ── TESTIMONIALS CAROUSEL ───────────────────── */
(function () {
  const track  = document.getElementById('testiTrack');
  const prev   = document.getElementById('tPrev');
  const next   = document.getElementById('tNext');
  const dotsEl = document.getElementById('tDots');
  if (!track) return;
  const cards = track.querySelectorAll('.testi-card');
  let cur = 0, pv = 2, timer;

  function getPV() { return window.innerWidth <= 768 ? 1 : 2; }

  function buildDots() {
    dotsEl.innerHTML = '';
    const tot = Math.ceil(cards.length / pv);
    for (let i = 0; i < tot; i++) {
      const d = document.createElement('div');
      d.className = 'cn-dot' + (i === 0 ? ' on' : '');
      d.addEventListener('click', () => go(i));
      dotsEl.appendChild(d);
    }
  }

  function go(i) {
    pv = getPV();
    const max = Math.ceil(cards.length / pv) - 1;
    cur = Math.max(0, Math.min(i, max));
    const w = track.parentElement.offsetWidth + 24;
    track.style.transform = `translateX(-${cur * w}px)`;
    dotsEl.querySelectorAll('.cn-dot').forEach((d, j) => d.classList.toggle('on', j === cur));
    clearInterval(timer);
    timer = setInterval(() => go(cur < Math.ceil(cards.length / pv) - 1 ? cur + 1 : 0), 5500);
  }

  prev.addEventListener('click', () => go(cur - 1));
  next.addEventListener('click', () => go(cur + 1));
  window.addEventListener('resize', () => { pv = getPV(); buildDots(); go(0); }, { passive: true });
  pv = getPV(); buildDots();
  timer = setInterval(() => go(cur < Math.ceil(cards.length / pv) - 1 ? cur + 1 : 0), 5500);
})();

/* ── CONTACT FORM ────────────────────────────── */
document.getElementById('contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  const suc = document.getElementById('formSuccess');
  btn.disabled = true;
  btn.textContent = 'Sending…';
  setTimeout(() => {
    btn.disabled = false;
    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg> Send Message';
    suc.classList.add('show');
    e.target.reset();
    setTimeout(() => suc.classList.remove('show'), 6000);
  }, 1400);
});

/* ── CARD TILT (desktop only) ────────────────── */
if (matchMedia('(pointer:fine)').matches) {
  document.querySelectorAll('.card').forEach(c => {
    c.addEventListener('mousemove', e => {
      const r = c.getBoundingClientRect();
      const x = (e.clientX - r.left  - r.width  / 2) / (r.width  / 2);
      const y = (e.clientY - r.top   - r.height / 2) / (r.height / 2);
      c.style.transform = `perspective(900px) rotateY(${x * 3.5}deg) rotateX(${-y * 3.5}deg) translateY(-3px)`;
    });
    c.addEventListener('mouseleave', () => c.style.transform = '');
  });
}


/* ── CONTACT FORM (FORMSPREE CLEAN VERSION) ── */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  const btn = document.getElementById("submitBtn");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    btn.disabled = true;
    btn.innerText = "Sending...";

    try {
      const formData = new FormData(form);

      const res = await fetch(form.action, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json"
        }
      });

      const data = await res.json();

      if (res.ok) {
        window.location.href = "thanks.html";
      } else {
        alert(data.error || "Form submission failed");
      }

    } catch (err) {
      console.error(err);
      alert("Network error — message not sent");
    }

    btn.disabled = false;
    btn.innerText = "Send Message";
  });
});