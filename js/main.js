/* MAIN.JS - Animations, interactions, particles */

(function () {
  'use strict';

  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return [...(ctx || document).querySelectorAll(sel)]; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* SCROLL PROGRESS */
  function initScrollProgress() {
    const bar = qs('#scrollProgress');
    if (!bar) return;
    function update() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
  }

  /* NAV */
  function initNav() {
    const nav = qs('#nav');
    if (!nav) return;
    function update() {
      nav.classList.toggle('nav--scrolled', window.scrollY > 60);
    }
    window.addEventListener('scroll', update, { passive: true });
    update();

    const toggle = qs('#navToggle');
    const links  = qs('#navLinks');
    if (toggle && links) {
      toggle.addEventListener('click', () => {
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!expanded));
        links.classList.toggle('nav-links--open', !expanded);
      });
      qsa('.nav-link', links).forEach(a => {
        a.addEventListener('click', () => {
          toggle.setAttribute('aria-expanded', 'false');
          links.classList.remove('nav-links--open');
        });
      });
      document.addEventListener('click', e => {
        if (!nav.contains(e.target)) {
          toggle.setAttribute('aria-expanded', 'false');
          links.classList.remove('nav-links--open');
        }
      });
    }
  }

  /* MOUSE GLOW */
  function initMouseGlow() {
    if (prefersReducedMotion) return;
    const glow = qs('#mouseGlow');
    if (!glow) return;
    let mx = window.innerWidth / 2, my = window.innerHeight / 2, cx = mx, cy = my;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
    function tick() {
      cx = lerp(cx, mx, 0.08);
      cy = lerp(cy, my, 0.08);
      glow.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* PARTICLES */
  function initParticles() {
    if (prefersReducedMotion) return;
    const canvas = qs('#bgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles;
    const COUNT = window.innerWidth < 768 ? 40 : 80;
    const baseHue = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hue')) || 338;

    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    function makeParticle() {
      return {
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 1.5 + 0.3,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
        a: Math.random() * 0.6 + 0.1,
        da: (Math.random() - 0.5) * 0.003,
        hue: Math.random() > 0.6 ? baseHue : (Math.random() > 0.5 ? baseHue - 22 : baseHue + 26),
      };
    }
    function init() { resize(); particles = Array.from({ length: COUNT }, makeParticle); }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy; p.a += p.da;
        if (p.a <= 0 || p.a >= 0.7) p.da *= -1;
        if (p.x < -5) p.x = W + 5; if (p.x > W + 5) p.x = -5;
        if (p.y < -5) p.y = H + 5; if (p.y > H + 5) p.y = -5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 65%, ${p.a})`;
        ctx.fill();
      }
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `hsla(${baseHue}, 100%, 55%, ${(1 - dist / 100) * 0.05})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }
    init(); draw();
    window.addEventListener('resize', resize, { passive: true });
  }

  /* REVEAL */
  function initReveal() {
    const elements = qsa('.reveal-up, .reveal-left, .reveal-right');
    if (!elements.length) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    elements.forEach(el => io.observe(el));
  }

  /* COUNTERS */
  function initCounters() {
    const counters = qsa('[data-count]');
    if (!counters.length) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const duration = 1200;
        const start = performance.now();
        function tick(now) {
          const progress = clamp((now - start) / duration, 0, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * target);
          if (progress < 1) requestAnimationFrame(tick);
          else el.textContent = target;
        }
        requestAnimationFrame(tick);
        io.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(el => io.observe(el));
  }

  /* SKILL BARS */
  function initSkillBars() {
    const fills = qsa('.skill-fill, .fp-fill');
    if (!fills.length) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.style.width = (el.dataset.width || '0') + '%';
        io.unobserve(el);
      });
    }, { threshold: 0.3 });
    fills.forEach(el => io.observe(el));
  }

  /* MAGNETIC */
  function initMagnetic() {
    if (prefersReducedMotion) return;
    qsa('[data-magnetic]').forEach(el => {
      el.addEventListener('mousemove', e => {
        const rect = el.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        el.style.transform = `translate(${dx * 0.25}px, ${dy * 0.25}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* PROJECTS DRAG */
  function initProjectsDrag() {
    const wrapper = qs('#projectsTrack')?.parentElement;
    if (!wrapper) return;
    let isDragging = false, startX, scrollLeft;
    wrapper.addEventListener('mousedown', e => {
      isDragging = true;
      startX = e.pageX - wrapper.offsetLeft;
      scrollLeft = wrapper.scrollLeft;
      wrapper.style.cursor = 'grabbing';
    });
    window.addEventListener('mouseup', () => {
      isDragging = false;
      if (wrapper) wrapper.style.cursor = 'grab';
    });
    wrapper.addEventListener('mousemove', e => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - wrapper.offsetLeft;
      wrapper.scrollLeft = scrollLeft - (x - startX) * 1.5;
    });
  }

  /* TILT */
  function initTilt() {
    if (prefersReducedMotion) return;
    qsa('[data-tilt]').forEach(el => {
      el.addEventListener('mousemove', e => {
        const rect = el.getBoundingClientRect();
        const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
        const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
        el.style.transform = `perspective(800px) rotateY(${dx * 6}deg) rotateX(${-dy * 6}deg) translateY(-6px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* LENIS */
  function initLenis() {
    if (prefersReducedMotion || typeof Lenis === 'undefined') return;
    const lenis = new Lenis({ duration: 1.2, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smooth: true });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }

  /* GSAP */
  function initGSAP() {
    if (prefersReducedMotion || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray('.mq-word').forEach((el, i) => {
      gsap.fromTo(el, { x: i % 2 === 0 ? -60 : 60, opacity: 0 }, {
        x: 0, opacity: 1, duration: 1, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 85%' },
      });
    });
    gsap.utils.toArray('.mq-qualifier').forEach((el, i) => {
      gsap.fromTo(el, { x: i % 2 === 0 ? 60 : -60, opacity: 0 }, {
        x: 0, opacity: 1, duration: 1, delay: 0.15, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 85%' },
      });
    });
    const aboutCards = qsa('.about-card');
    if (aboutCards.length) {
      gsap.fromTo(aboutCards, { y: 40, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.9, stagger: 0.1, ease: 'expo.out',
        scrollTrigger: { trigger: '.about-card-stack', start: 'top 75%' },
      });
    }
  }

  /* TERMINAL FOCUS */
  function initTerminalFocus() {
    const wrapper = qs('#terminalWrapper');
    const inp = qs('#terminalInput');
    if (wrapper && inp) wrapper.addEventListener('click', () => inp.focus());
  }

  /* TAGLINE ROTATION */
  function initTaglineRotation() {
    if (prefersReducedMotion) return;
    const el = qs('#taglineText');
    if (!el) return;
    const words = ['Linux-First Developer', 'System Thinker', 'Arch Linux Enthusiast', 'Game Dev Explorer', 'Builder', 'Philosophy Nerd'];
    let idx = 0;
    setInterval(() => {
      idx = (idx + 1) % words.length;
      el.style.opacity = '0';
      el.style.transform = 'translateY(8px)';
      el.style.transition = 'opacity 0.3s, transform 0.3s';
      setTimeout(() => {
        el.textContent = words[idx];
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 320);
    }, 3000);
  }

  /* ANCHOR SCROLL */
  function initAnchorScroll() {
    qsa('a[href^="#"]').forEach(link => {
      link.addEventListener('click', e => {
        const id = link.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  /* KEYBOARD SHORTCUT */
  function initKeyboardShortcuts() {
    document.addEventListener('keydown', e => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if (e.key === 't' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const terminal = document.getElementById('terminal');
        if (terminal) {
          terminal.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setTimeout(() => { const inp = document.getElementById('terminalInput'); if (inp) inp.focus(); }, 600);
        }
      }
    });
  }

  /* THEME TOGGLE */
  function initThemeToggle() {
    const toggle = qs('#themeToggle');
    if (!toggle) return;
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    toggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });
  }

  /* FETCH GITHUB PROJECTS */
  function initGitHubProjects() {
    const track = qs('#projectsTrack');
    if (!track) return;

    fetch('https://api.github.com/users/raphael2517/repos?sort=updated&per_page=8')
      .then(r => r.json())
      .then(repos => {
        if (!Array.isArray(repos)) return;
        const hueLookup = [330, 190, 280, 40, 100, 160, 220, 260];
        track.innerHTML = repos.map((repo, i) => {
          const desc = repo.description || 'A project by Raphael';
          const hue = hueLookup[i % hueLookup.length];
          return `
            <article class="project-card" data-tilt>
              <div class="project-card-inner">
                <div class="project-visual" style="--proj-hue: ${hue}">
                  <div class="project-visual-bg" aria-hidden="true"></div>
                  <div class="project-visual-icon" aria-hidden="true">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                  </div>
                </div>
                <div class="project-info">
                  <div class="project-number" aria-hidden="true">${String(i+1).padStart(2, '0')}</div>
                  <h3 class="project-title">${escapeHtml(repo.name)}</h3>
                  <p class="project-desc">${escapeHtml(desc)}</p>
                  <div class="project-tags">
                    ${repo.language ? `<span>${repo.language}</span>` : ''}
                    ${repo.topics && repo.topics.length ? repo.topics.slice(0, 2).map(t => `<span>${escapeHtml(t)}</span>`).join('') : ''}
                  </div>
                  <div class="project-links">
                    <a href="${repo.html_url}" target="_blank" rel="noopener" class="project-link">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                      Source
                    </a>
                  </div>
                </div>
              </div>
            </article>
          `;
        }).join('');
        // Re-initialize tilt for new cards
        initTilt();
        initProjectsDrag();
      })
      .catch(err => console.error('Failed to fetch GitHub repos:', err));

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  }

  /* HERO NAME ROTATION — Suyash / Raphael */
  function initHeroNameRotation() {
    if (prefersReducedMotion) return;
    const line1 = qs('#heroNameLine1');
    const line2 = qs('#heroNameLine2');
    if (!line1 || !line2) return;
    const identities = [
      ['SUYASH', 'NAMDEO'],
      ['RAPHAEL', 'REGENESIS'],
    ];
    let idx = 0;

    function swap() {
      idx = (idx + 1) % identities.length;
      const [a, b] = identities[idx];
      line1.classList.add('hero-name-glitch');
      line2.classList.add('hero-name-glitch');
      setTimeout(() => {
        line1.textContent = a; line1.dataset.text = a;
        line2.textContent = b; line2.dataset.text = b;
      }, 110);
      setTimeout(() => {
        line1.classList.remove('hero-name-glitch');
        line2.classList.remove('hero-name-glitch');
      }, 280);
    }
    setInterval(swap, 4200);
  }

  /* CRT GLITCH TRIGGER */
  function initCRTGlitch() {
    if (prefersReducedMotion) return;
    const overlay = qs('#crtOverlay');
    const barsContainer = qs('#glitchBars');
    if (!overlay || !barsContainer) return;

    function triggerGlitch() {
      overlay.classList.remove('is-glitching');
      void overlay.offsetWidth; // restart animation
      barsContainer.innerHTML = '';
      const barCount = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < barCount; i++) {
        const bar = document.createElement('div');
        bar.className = 'glitch-bar';
        bar.style.top = Math.random() * 100 + '%';
        bar.style.animationDelay = (Math.random() * 0.06) + 's';
        barsContainer.appendChild(bar);
      }
      overlay.classList.add('is-glitching');
      setTimeout(() => overlay.classList.remove('is-glitching'), 260);
      scheduleNext();
    }
    function scheduleNext() {
      setTimeout(triggerGlitch, 3500 + Math.random() * 5500);
    }
    scheduleNext();
  }

  function init() {
    initScrollProgress();
    initNav();
    initMouseGlow();
    initParticles();
    initReveal();
    initCounters();
    initSkillBars();
    initMagnetic();
    initProjectsDrag();
    initTilt();
    initLenis();
    initGSAP();
    initTerminalFocus();
    initTaglineRotation();
    initHeroNameRotation();
    initCRTGlitch();
    initAnchorScroll();
    initKeyboardShortcuts();
    initThemeToggle();
    initGitHubProjects();
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
