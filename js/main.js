/* ==========================================================================
   FUMI — main.js
   Vanilla JavaScript, no dependencies. Every module is null-safe, so the
   same file can be shared by index.html and 404.html.
   ========================================================================== */
(() => {
  'use strict';

  window.__fumi = true; // tells the inline fail-safe in <head> that JS loaded

  const root = document.documentElement;
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = () => motionQuery.matches;
  const finePointer = () => pointerQuery.matches;

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const isModifiedClick = (e) => e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;

  /** Run `fn` at most once per animation frame. */
  const rafThrottle = (fn) => {
    let queued = false;
    return (...args) => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        fn(...args);
      });
    };
  };

  // Shared hooks filled in by the modules below
  let closeMenu = () => {};

  /* ------------------------------------------------------------------------
     1. Intro loader
     ------------------------------------------------------------------------ */
  function initLoader() {
    let seenIntro = false;
    try {
      seenIntro = sessionStorage.getItem('fumi:intro') === '1';
      sessionStorage.setItem('fumi:intro', '1');
    } catch (_) { /* storage blocked — show the full intro */ }

    const minDuration = reducedMotion() ? 0 : seenIntro ? 350 : 1300;
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();

    Promise.all([Promise.race([fontsReady, wait(2500)]), wait(minDuration)]).then(() => {
      requestAnimationFrame(() => root.classList.add('is-loaded'));
    });
  }

  /* ------------------------------------------------------------------------
     2. Page transitions — curtain animation when leaving for another page
     ------------------------------------------------------------------------ */
  function initPageTransitions() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link || e.defaultPrevented || isModifiedClick(e)) return;
      if (link.target === '_blank' || link.hasAttribute('download')) return;

      const url = new URL(link.href, location.href);
      if (!['http:', 'https:', 'file:'].includes(url.protocol)) return; // mailto:, tel:, …
      if (url.origin !== location.origin) return; // external sites
      if (url.pathname === location.pathname && url.search === location.search) return; // same page (anchors)
      if (reducedMotion()) return;

      e.preventDefault();
      root.classList.add('is-leaving');
      setTimeout(() => { location.href = url.href; }, 650);
    });

    // Restore the page if it comes back from the back/forward cache
    window.addEventListener('pageshow', (e) => {
      if (e.persisted) root.classList.remove('is-leaving');
    });
  }

  /* ------------------------------------------------------------------------
     3. Header — glass background, hide on scroll down, scroll progress bar
     ------------------------------------------------------------------------ */
  function initHeader() {
    const header = $('.header');
    const progress = $('.scroll-progress');
    if (!header) return;

    let lastY = window.scrollY;

    const update = () => {
      const y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 24);

      const delta = y - lastY;
      if (Math.abs(delta) > 6) {
        const hide = delta > 0 && y > 480 && !root.classList.contains('menu-open');
        header.classList.toggle('is-hidden', hide);
        lastY = y;
      }

      if (progress) {
        const max = root.scrollHeight - window.innerHeight;
        progress.style.transform = `scaleX(${max > 0 ? clamp(y / max, 0, 1) : 0})`;
      }
    };

    window.addEventListener('scroll', rafThrottle(update), { passive: true });
    window.addEventListener('resize', rafThrottle(update));
    header.addEventListener('focusin', () => header.classList.remove('is-hidden'));
    update();
  }

  /* ------------------------------------------------------------------------
     4. Mobile menu
     ------------------------------------------------------------------------ */
  function initMenu() {
    const burger = $('.burger');
    const panel = $('#mobile-menu');
    if (!burger || !panel) return;

    const background = [$('main'), $('.footer')].filter(Boolean);
    panel.inert = true;

    const setOpen = (open) => {
      root.classList.toggle('menu-open', open);
      root.classList.toggle('is-locked', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      panel.setAttribute('aria-hidden', String(!open));
      panel.inert = !open;
      background.forEach((el) => { el.inert = open; });
      if (open) $('.header')?.classList.remove('is-hidden');
    };

    closeMenu = () => {
      if (root.classList.contains('menu-open')) setOpen(false);
    };

    burger.addEventListener('click', () => setOpen(!root.classList.contains('menu-open')));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && root.classList.contains('menu-open')) {
        setOpen(false);
        burger.focus();
      }
    });

    // Close automatically when the viewport grows to desktop size
    window.matchMedia('(min-width: 961px)').addEventListener('change', (e) => {
      if (e.matches) closeMenu();
    });
  }

  /* ------------------------------------------------------------------------
     5. Smooth in-page navigation
     ------------------------------------------------------------------------ */
  function prefillService(value) {
    const box = $$('#contact-form input[name="services"]').find((input) => input.value === value);
    if (box) box.checked = true;
  }

  // Pricing buttons: start the message for the visitor, unless they've already written one
  function prefillPackage(name) {
    const message = $('#contact-form textarea[name="message"]');
    if (!message) return;
    const current = message.value.trim();
    if (current && !message.dataset.prefilled) return;
    message.value = `Hi FUMI! I'm interested in the ${name}. `;
    message.dataset.prefilled = '1';
    message.addEventListener('input', () => delete message.dataset.prefilled, { once: true });
  }

  function scrollToTarget(target) {
    const behavior = reducedMotion() ? 'auto' : 'smooth';
    if (target.id === 'home') {
      window.scrollTo({ top: 0, behavior });
    } else {
      target.scrollIntoView({ behavior, block: 'start' });
    }
    // Move keyboard focus to the section for screen-reader & keyboard users
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }

  function initAnchors() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href*="#"]');
      if (!link || e.defaultPrevented || isModifiedClick(e)) return;

      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;

      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;

      e.preventDefault();
      if (link.dataset.service) prefillService(link.dataset.service);
      if (link.dataset.package) prefillPackage(link.dataset.package);

      closeMenu();
      $$('dialog[open]').forEach((dialog) => dialog.close());

      scrollToTarget(target);
      if (location.hash !== url.hash) history.pushState(null, '', url.hash);
    });
  }

  /* ------------------------------------------------------------------------
     6. Scroll spy — highlights the current section in the navigation
     ------------------------------------------------------------------------ */
  function initScrollSpy() {
    const links = $$('.nav__link, .menu__link');
    if (!links.length || !('IntersectionObserver' in window)) return;

    const ids = [...new Set(links.map((link) => link.hash.slice(1)))];
    const sections = ['home', ...ids].map((id) => document.getElementById(id)).filter(Boolean);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => link.classList.toggle('is-active', link.hash === `#${entry.target.id}`));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach((section) => observer.observe(section));
  }

  /* ------------------------------------------------------------------------
     7. Scroll reveal animations
     ------------------------------------------------------------------------ */
  function initReveal() {
    // Stagger children of reveal groups
    $$('[data-reveal-group]').forEach((group) => {
      $$('[data-reveal]', group).forEach((el, i) => {
        el.style.setProperty('--delay', `${Math.min(i * 0.09, 0.45)}s`);
      });
    });

    const elements = $$('[data-reveal]');

    // Once revealed, remove the reveal styles so each element's own hover transitions take over
    const finish = (el) => {
      el.classList.add('revealed');
      el.classList.remove('is-visible');
      el.removeAttribute('data-reveal');
      el.style.removeProperty('--delay');
    };

    if (!('IntersectionObserver' in window) || reducedMotion()) {
      elements.forEach(finish);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        observer.unobserve(el);
        el.classList.add('is-visible', 'revealed');
        const delay = parseFloat(el.style.getPropertyValue('--delay')) || 0;
        setTimeout(() => finish(el), (delay + 1.2) * 1000);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    elements.forEach((el) => observer.observe(el));
  }

  /* ------------------------------------------------------------------------
     8. Hero — pointer parallax & scroll depth
     ------------------------------------------------------------------------ */
  function initHero() {
    const hero = $('.hero');
    if (!hero || reducedMotion()) return;

    if (finePointer()) {
      const move = rafThrottle((x, y) => {
        hero.style.setProperty('--px', x.toFixed(3));
        hero.style.setProperty('--py', y.toFixed(3));
      });
      hero.addEventListener('pointermove', (e) => {
        const rect = hero.getBoundingClientRect();
        move((e.clientX - rect.left) / rect.width - 0.5, (e.clientY - rect.top) / rect.height - 0.5);
      });
      hero.addEventListener('pointerleave', () => move(0, 0));
    }

    const onScroll = rafThrottle(() => {
      const progress = window.scrollY / window.innerHeight;
      if (progress <= 1.2) hero.style.setProperty('--hero-scroll', progress.toFixed(4));
    });
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ------------------------------------------------------------------------
     9. Hover effects — cursor spotlight & magnetic buttons
     ------------------------------------------------------------------------ */
  function initSpotlight() {
    if (!finePointer()) return;
    $$('[data-spotlight]').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
        card.style.setProperty('--my', `${e.clientY - rect.top}px`);
      });
    });
  }

  function initMagnetic() {
    if (!finePointer() || reducedMotion()) return;
    $$('[data-magnetic]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - (rect.left + rect.width / 2)) * 0.25;
        const y = (e.clientY - (rect.top + rect.height / 2)) * 0.35;
        el.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
      });
      el.addEventListener('pointerleave', () => { el.style.translate = ''; });
    });
  }

  /* ------------------------------------------------------------------------
     10. Portfolio filters
     ------------------------------------------------------------------------ */
  function initWorkFilter() {
    const grid = $('.work__grid');
    if (!grid) return;

    const projects = $$('.project', grid);
    const filters = $$('.filter');
    const status = $('#work-status');
    const matches = (project, filter) => filter === 'all' || project.dataset.category === filter;

    filters.forEach((btn) => {
      const count = $('.filter__count', btn);
      if (count) count.textContent = projects.filter((p) => matches(p, btn.dataset.filter)).length;
    });

    // Every second visible project is offset for a staggered, editorial layout
    const layout = () => {
      projects.filter((p) => !p.hidden).forEach((p, i) => p.classList.toggle('is-shifted', i % 2 === 1));
    };
    layout();

    let timer;
    filters.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('is-active')) return;
        const filter = btn.dataset.filter;

        filters.forEach((b) => {
          const active = b === btn;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-pressed', String(active));
        });

        const apply = () => {
          projects.forEach((p) => { p.hidden = !matches(p, filter); });
          layout();
          const visible = projects.filter((p) => !p.hidden).length;
          if (status) status.textContent = `Showing ${visible} project${visible === 1 ? '' : 's'}`;
        };

        clearTimeout(timer);
        if (reducedMotion()) { apply(); return; }

        grid.classList.add('is-filtering');
        timer = setTimeout(() => {
          apply();
          requestAnimationFrame(() => grid.classList.remove('is-filtering'));
        }, 350);
      });
    });
  }

  /* ------------------------------------------------------------------------
     11. Project pop-up (native <dialog>)
     ------------------------------------------------------------------------ */
  function initProjectModal() {
    const modal = $('#project-modal');
    if (!modal || typeof modal.showModal !== 'function') return;

    const inner = $('.modal__inner', modal);
    const media = $('[data-modal-media]', modal);
    const category = $('[data-modal-category]', modal);
    const title = $('[data-modal-title]', modal);
    const desc = $('[data-modal-desc]', modal);
    const details = $('[data-modal-details]', modal);
    const cta = $('[data-modal-cta]', modal);

    $$('.project__open').forEach((button) => {
      button.addEventListener('click', () => {
        const project = button.closest('.project');
        if (!project) return;

        const preview = $('.mock', project);
        media.replaceChildren(...(preview ? [preview.cloneNode(true)] : []));
        category.textContent = project.dataset.label || '';
        title.textContent = button.textContent.trim();
        desc.textContent = $('.project__desc', project)?.textContent.trim() || '';
        details.innerHTML = $('.project__details', project)?.innerHTML || '';
        if (project.dataset.service) cta.dataset.service = project.dataset.service;
        else delete cta.dataset.service;

        modal.showModal();
        root.classList.add('is-locked');
        inner.scrollTop = 0;
      });
    });

    // Close when clicking the backdrop or the close button
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.closest('[data-modal-close]')) modal.close();
    });
    modal.addEventListener('close', () => root.classList.remove('is-locked'));
  }

  /* ------------------------------------------------------------------------
     12. Process timeline progress
     ------------------------------------------------------------------------ */
  function initProcess() {
    const timeline = $('.process__timeline');
    if (!timeline) return;

    const steps = $$('.step', timeline);
    const vertical = window.matchMedia('(max-width: 960px)');

    const update = () => {
      const rect = timeline.getBoundingClientRect();
      const viewport = window.innerHeight;
      if (rect.top > viewport * 1.5 || rect.bottom < -viewport * 0.5) return; // off-screen

      const progress = clamp((viewport * 0.65 - rect.top) / rect.height, 0, 1);
      timeline.style.setProperty('--progress', progress.toFixed(4));

      steps.forEach((step) => {
        const position = vertical.matches ? step.offsetTop / rect.height : step.offsetLeft / rect.width;
        step.classList.toggle('is-active', progress > 0 && progress >= position);
      });
    };

    const onScroll = rafThrottle(update);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  /* ------------------------------------------------------------------------
     13. Animated counters
     ------------------------------------------------------------------------ */
  function initCounters() {
    const counters = $$('[data-count]');
    if (!counters.length || !('IntersectionObserver' in window) || reducedMotion()) return;

    const format = (el, value) => String(value).padStart(Number(el.dataset.pad || 0), '0');

    const run = (el) => {
      const target = Number(el.dataset.count);
      const duration = 1600;
      const start = performance.now();
      const tick = (now) => {
        const t = clamp((now - start) / duration, 0, 1);
        const eased = 1 - Math.pow(1 - t, 4);
        el.textContent = format(el, Math.round(target * eased));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        run(entry.target);
      });
    }, { threshold: 0.6 });

    counters.forEach((el) => {
      el.textContent = format(el, 0);
      observer.observe(el);
    });
  }

  /* ------------------------------------------------------------------------
     14. Contact form — validation + AJAX submission (FormSubmit)
     ------------------------------------------------------------------------ */
  function initContactForm() {
    const form = $('#contact-form');
    if (!form) return;

    const card = form.closest('.form-card');
    const success = card ? $('.form-success', card) : null;
    const status = $('.form__status', form);
    const submit = $('button[type="submit"]', form);
    const required = $$('[required]', form);
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const REQUIRED_MESSAGES = {
      name: 'Please tell us your name.',
      email: 'We need your email address to reply.',
      message: 'Please tell us a little about your project.',
    };

    form.noValidate = true; // we show our own, friendlier messages

    const setError = (field, message) => {
      const wrapper = field.closest('.field');
      const error = wrapper ? $('.field__error', wrapper) : null;
      wrapper?.classList.toggle('is-invalid', Boolean(message));
      if (message) field.setAttribute('aria-invalid', 'true');
      else field.removeAttribute('aria-invalid');
      if (error) error.textContent = message;
    };

    const validate = (field) => {
      const value = field.value.trim();
      let message = '';
      if (field.required && !value) message = REQUIRED_MESSAGES[field.name] || 'This field is required.';
      else if (field.type === 'email' && value && !EMAIL_RE.test(value)) message = 'Please enter a valid email address.';
      else if (field.minLength > 0 && value && value.length < field.minLength) message = `Please write at least ${field.minLength} characters.`;
      setError(field, message);
      return !message;
    };

    required.forEach((field) => {
      field.addEventListener('blur', () => { if (field.value.trim()) validate(field); });
      field.addEventListener('input', () => {
        if (field.closest('.field')?.classList.contains('is-invalid')) validate(field);
      });
    });

    const setStatus = (content, type = '') => {
      if (!status) return;
      status.className = `form__status${type ? ` is-${type}` : ''}`;
      status.replaceChildren(...(Array.isArray(content) ? content : content ? [content] : []));
    };

    const setLoading = (loading) => {
      submit.classList.toggle('is-loading', loading);
      submit.disabled = loading;
      $('.btn__label', submit).textContent = loading ? 'Sending…' : 'Send message';
    };

    const showSuccess = () => {
      form.reset();
      setStatus('');
      if (!success) { setStatus('Thank you! Your message has been sent.', 'success'); return; }
      form.hidden = true;
      success.hidden = false;
      success.focus();
    };

    // FormSubmit's AJAX endpoint lives at /ajax/<email>; other providers accept the action URL as-is
    const endpointFor = (action) => (
      /formsubmit\.co\/(?!ajax\/)/.test(action) ? action.replace('formsubmit.co/', 'formsubmit.co/ajax/') : action
    );

    // If sending fails, offer a pre-filled email as a fallback so no lead is ever lost
    const mailtoFallback = (payload) => {
      const link = document.createElement('a');
      const body = [
        `Name: ${payload.name}`,
        `Email: ${payload.email}`,
        payload.company ? `Company: ${payload.company}` : '',
        `Services: ${payload.services}`,
        payload.budget ? `Budget: ${payload.budget}` : '',
        '',
        payload.message,
      ].filter((line, i) => line !== '' || i === 5).join('\n');
      link.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent('Project enquiry')}&body=${encodeURIComponent(body)}`;
      link.textContent = `email us directly at ${form.dataset.email}`;
      return link;
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (submit.classList.contains('is-loading')) return;

      const results = required.map(validate);
      const firstInvalid = required[results.indexOf(false)];
      if (firstInvalid) {
        setStatus('Please check the highlighted fields.', 'error');
        firstInvalid.focus();
        return;
      }

      // Honeypot: bots fill hidden fields, humans don't
      if ($('[name="_honey"]', form)?.value) { showSuccess(); return; }

      const data = new FormData(form);
      const payload = {};
      data.forEach((value, key) => {
        if (key !== 'services') payload[key] = typeof value === 'string' ? value.trim() : value;
      });
      payload.services = data.getAll('services').join(', ') || 'Not specified';

      setStatus('');
      setLoading(true);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      try {
        const response = await fetch(endpointFor(form.action), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || result.success === false || result.success === 'false') {
          throw new Error(result.message || `Request failed with status ${response.status}`);
        }
        showSuccess();
      } catch (error) {
        console.warn('[FUMI] Contact form could not be sent:', error);
        setStatus(['Sorry, your message couldn’t be sent right now. Please try again or ', mailtoFallback(payload), '.'], 'error');
      } finally {
        clearTimeout(timeout);
        setLoading(false);
      }
    });

    // "Send another message"
    $('[data-form-reset]', card || document)?.addEventListener('click', () => {
      success.hidden = true;
      form.hidden = false;
      required.forEach((field) => setError(field, ''));
      $('input[name="name"]', form)?.focus();
    });
  }

  /* ------------------------------------------------------------------------
     15. Copy email to clipboard
     ------------------------------------------------------------------------ */
  function initCopy() {
    $$('[data-copy]').forEach((button) => {
      const label = button.getAttribute('aria-label');
      let timer;
      button.addEventListener('click', async () => {
        const text = button.dataset.copy;
        try {
          await navigator.clipboard.writeText(text);
        } catch (_) {
          const area = Object.assign(document.createElement('textarea'), { value: text });
          area.style.cssText = 'position:fixed;opacity:0;';
          document.body.append(area);
          area.select();
          document.execCommand('copy');
          area.remove();
        }
        button.classList.add('is-copied');
        button.setAttribute('aria-label', 'Email address copied');
        clearTimeout(timer);
        timer = setTimeout(() => {
          button.classList.remove('is-copied');
          button.setAttribute('aria-label', label);
        }, 2000);
      });
    });
  }

  /* ------------------------------------------------------------------------
     16. Misc
     ------------------------------------------------------------------------ */
  function initYear() {
    $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
  }

  /* ------------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------------ */
  const modules = [
    initLoader, initPageTransitions, initHeader, initMenu, initAnchors, initScrollSpy,
    initReveal, initHero, initSpotlight, initMagnetic, initWorkFilter, initProjectModal,
    initProcess, initCounters, initContactForm, initCopy, initYear,
  ];

  const boot = () => modules.forEach((init) => {
    try { init(); } catch (error) { console.error(`[FUMI] ${init.name} failed:`, error); }
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
