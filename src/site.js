const menuButton = document.querySelector('[data-menu-button]');
const menu = document.querySelector('[data-menu]');

if (menuButton && menu) {
  const main = document.querySelector('main');
  const footer = document.querySelector('footer');
  const desktopNavigation = window.matchMedia('(min-width: 60.0625rem)');

  const setMenuState = (isOpen) => {
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    menu.dataset.open = String(isOpen);
    document.body.classList.toggle('menu-open', isOpen);
    main?.toggleAttribute('inert', isOpen);
    footer?.toggleAttribute('inert', isOpen);
  };

  const closeMenu = () => setMenuState(false);

  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    setMenuState(!isOpen);
  });

  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menuButton.focus();
    }
  });

  desktopNavigation.addEventListener('change', (event) => {
    if (event.matches) closeMenu();
  });
}

const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const motionAllowed = !motionQuery.matches;
const liveAnimations = new Set();

document.querySelectorAll('[data-year]').forEach((item) => {
  item.textContent = String(new Date().getFullYear());
});

document.addEventListener('visibilitychange', () => {
  document.body.classList.toggle('page-hidden', document.hidden);
  for (const animation of liveAnimations) {
    if (document.hidden) animation.pause();
    else if (animation.playState === 'paused') animation.play();
  }
});

function whenVisible(element, onVisible) {
  if (!('IntersectionObserver' in window)) {
    onVisible();
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      onVisible();
      observer.disconnect();
    }
  }, { threshold: 0.35 });
  observer.observe(element);
}

if (motionAllowed) {
  document.querySelectorAll('[data-draw]').forEach((path) => {
    let length = 0;
    try {
      length = path.getTotalLength();
    } catch {
      length = 0;
    }
    if (!length) return;
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;
    whenVisible(path.closest('[data-draw-stage]') ?? path, () => {
      const animation = path.animate(
        [{ strokeDashoffset: length }, { strokeDashoffset: 0 }],
        { duration: 1400, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' },
      );
      liveAnimations.add(animation);
      animation.finished.then(() => liveAnimations.delete(animation)).catch(() => {});
    });
  });

  document.querySelectorAll('[data-assemble]').forEach((stage) => {
    stage.classList.add('is-pending');
    whenVisible(stage, () => {
      stage.classList.remove('is-pending');
      stage.classList.add('is-assembled');
    });
  });

  document.querySelectorAll('[data-scan]').forEach((stage) => {
    stage.classList.remove('is-settled');
    stage.classList.add('is-armed');
    whenVisible(stage, () => {
      stage.classList.add('is-scanning');
      window.setTimeout(() => {
        stage.classList.remove('is-scanning');
        stage.classList.add('is-settled');
      }, 1200);
    });
  });

  document.querySelectorAll('[data-flow]').forEach((flow) => {
    const steps = [...flow.querySelectorAll('[data-step]')];
    if (!steps.length) return;
    let timer = 0;
    const show = (index) => {
      steps.forEach((step, stepIndex) => {
        step.classList.toggle('is-current', stepIndex === index);
        step.classList.toggle('is-complete', stepIndex < index);
      });
      flow.style.setProperty('--flow-progress', String((index + 1) / steps.length));
    };
    whenVisible(flow, () => {
      let index = 0;
      show(0);
      const advance = () => {
        if (document.hidden) {
          timer = window.setTimeout(advance, 400);
          return;
        }
        if (index >= steps.length - 1) return;
        index += 1;
        show(index);
        timer = window.setTimeout(advance, 900);
      };
      timer = window.setTimeout(advance, 900);
    });
    motionQuery.addEventListener('change', () => {
      if (!motionQuery.matches) return;
      window.clearTimeout(timer);
      show(steps.length - 1);
    });
  });

  document.querySelectorAll('[data-parallax]').forEach((note) => {
    let frame = 0;
    const speed = Number(note.dataset.parallax) || 0.04;
    const update = () => {
      frame = 0;
      const shift = Math.max(-24, Math.min(24, window.scrollY * speed));
      note.style.transform = `translate3d(0, ${shift}px, 0)`;
    };
    window.addEventListener('scroll', () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    }, { passive: true });
  });
}

document.querySelectorAll('[data-spine]').forEach((nav) => {
  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);
  if (!sections.length || !('IntersectionObserver' in window)) return;
  const setCurrent = (id) => {
    for (const link of links) {
      if (link.getAttribute('href') === `#${id}`) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }
  };
  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible?.target.id) setCurrent(visible.target.id);
  }, { rootMargin: '-20% 0px -55% 0px', threshold: [0.2, 0.5] });
  sections.forEach((section) => observer.observe(section));
});

document.querySelectorAll('[data-switch]').forEach((group) => {
  const root = group.closest('[data-switch-root]');
  const buttons = [...group.querySelectorAll('[data-switch-value]')];
  const apply = (value) => {
    if (root) root.dataset.mode = value;
    buttons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.switchValue === value));
    });
  };
  buttons.forEach((button) => {
    button.addEventListener('click', () => apply(button.dataset.switchValue));
  });
  const initial = buttons.find((button) => button.getAttribute('aria-pressed') === 'true') ?? buttons[0];
  if (initial) apply(initial.dataset.switchValue);
});

document.querySelectorAll('[data-filter-group]').forEach((group) => {
  const buttons = [...group.querySelectorAll('[data-filter]')];
  const tiles = [...document.querySelectorAll('[data-kind]')];
  const apply = (filter) => {
    buttons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.filter === filter));
    });
    tiles.forEach((tile) => {
      const show = filter === 'all' || tile.dataset.kind === filter;
      tile.toggleAttribute('hidden', !show);
    });
  };
  buttons.forEach((button) => {
    button.addEventListener('click', () => apply(button.dataset.filter));
  });
});

const inquiryForm = document.querySelector('[data-inquiry-form]');

if (inquiryForm) {
  const status = inquiryForm.querySelector('[data-form-status]');
  const progress = inquiryForm.querySelector('[data-progress-bar]');
  const requiredTextFields = [...inquiryForm.querySelectorAll('input[required], textarea[required]')];
  const requiredSelect = inquiryForm.querySelector('select[required]');
  const trackedFields = [
    ...requiredTextFields,
    ...(requiredSelect ? [requiredSelect] : []),
  ];

  const setStatus = (message, isError = false) => {
    status.textContent = message;
    if (message) status.dataset.state = isError ? 'error' : 'ready';
    else delete status.dataset.state;
  };

  const updateProgress = () => {
    if (!progress || !trackedFields.length) return;
    const filled = trackedFields.filter((field) => field.value.trim().length > 0).length;
    const focusIndex = trackedFields.indexOf(document.activeElement);
    const reached = Math.max(filled, focusIndex + 1);
    progress.style.transform = `scaleX(${Math.min(1, reached / trackedFields.length)})`;
  };

  const validateMeaningfulText = () => {
    for (const field of requiredTextFields) {
      const isBlank = field.value.trim().length === 0;
      field.setCustomValidity(isBlank ? 'Please enter a value, not only spaces.' : '');
      field.setAttribute('aria-invalid', String(isBlank));
    }
    if (requiredSelect) {
      const selectInvalid = requiredSelect.value.trim().length === 0;
      requiredSelect.setAttribute('aria-invalid', String(selectInvalid));
    }
    const valid = inquiryForm.reportValidity();
    if (!valid) setStatus('Add the missing details. Name, email, service, and project details are required.', true);
    updateProgress();
    return valid;
  };

  const clearFieldState = (field) => {
    field.setCustomValidity('');
    field.setAttribute('aria-invalid', 'false');
    setStatus('');
    updateProgress();
  };

  requiredTextFields.forEach((field) => {
    field.addEventListener('input', () => clearFieldState(field));
    field.addEventListener('focus', updateProgress);
  });
  requiredSelect?.addEventListener('change', () => clearFieldState(requiredSelect));
  requiredSelect?.addEventListener('focus', updateProgress);

  inquiryForm.addEventListener('invalid', (event) => {
    if (event.target instanceof HTMLElement) event.target.setAttribute('aria-invalid', 'true');
    setStatus('Add the missing details. Name, email, service, and project details are required.', true);
  }, true);

  const buildMessage = () => {
    const data = new FormData(inquiryForm);
    return [
      `Name: ${String(data.get('name')).trim()}`,
      `Business: ${String(data.get('business')).trim() || 'Not provided'}`,
      `Email: ${String(data.get('email')).trim()}`,
      `Phone: ${String(data.get('phone')).trim() || 'Not provided'}`,
      `Service: ${data.get('service')}`,
      '',
      String(data.get('message')).trim(),
    ].join('\n');
  };

  const markComplete = (message) => {
    inquiryForm.dataset.complete = 'true';
    if (progress) progress.style.transform = 'scaleX(1)';
    setStatus(message);
  };

  inquiryForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validateMeaningfulText()) return;
    const subject = encodeURIComponent(`Project enquiry from ${new FormData(inquiryForm).get('name')}`);
    const body = encodeURIComponent(buildMessage());
    markComplete('Opening your email app…');
    window.location.href = `mailto:connect@bsocio.in?subject=${subject}&body=${body}`;
  });

  inquiryForm.querySelector('[data-whatsapp-submit]')?.addEventListener('click', () => {
    if (!validateMeaningfulText()) return;
    const whatsappNumber = inquiryForm.dataset.whatsapp;
    if (!whatsappNumber) return;
    const message = encodeURIComponent(`Hello B Socio, I'd like to discuss a project.\n\n${buildMessage()}`);
    markComplete('Opening WhatsApp…');
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank', 'noopener,noreferrer');
  });
}
