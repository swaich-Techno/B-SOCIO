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

const motionAllowed = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealItems = document.querySelectorAll('[data-reveal]');

if (motionAllowed && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('reveal-ready');
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.dataset.visible = 'true';
        observer.unobserve(entry.target);
      }
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => { item.dataset.visible = 'true'; });
}

document.querySelectorAll('[data-year]').forEach((item) => {
  item.textContent = String(new Date().getFullYear());
});

const inquiryForm = document.querySelector('[data-inquiry-form]');

if (inquiryForm) {
  const status = inquiryForm.querySelector('[data-form-status]');
  const requiredTextFields = [...inquiryForm.querySelectorAll('input[required], textarea[required]')];
  const validateMeaningfulText = () => {
    for (const field of requiredTextFields) {
      const isBlank = field.value.trim().length === 0;
      field.setCustomValidity(isBlank ? 'Please enter a value, not only spaces.' : '');
    }
    return inquiryForm.reportValidity();
  };

  requiredTextFields.forEach((field) => {
    field.addEventListener('input', () => {
      field.setCustomValidity('');
      status.textContent = '';
    });
  });

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

  inquiryForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validateMeaningfulText()) return;
    const subject = encodeURIComponent(`Project enquiry from ${new FormData(inquiryForm).get('name')}`);
    const body = encodeURIComponent(buildMessage());
    status.textContent = 'Opening your email app…';
    window.location.href = `mailto:connect@bsocio.in?subject=${subject}&body=${body}`;
  });

  inquiryForm.querySelector('[data-whatsapp-submit]')?.addEventListener('click', () => {
    if (!validateMeaningfulText()) return;
    status.textContent = 'Opening WhatsApp…';
    const message = encodeURIComponent(`Hello B Socio, I'd like to discuss a project.\n\n${buildMessage()}`);
    window.open(`https://wa.me/919781580475?text=${message}`, '_blank', 'noopener,noreferrer');
  });
}
