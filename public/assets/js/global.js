// Tailwind Config
tailwind.config = {
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        blue: {
          50: '#E0F2FE',
          100: '#DBEAFE',
          500: '#2563EB',
          600: '#1D4ED8'
        },
        green: {
          100: '#D1FAE5',
          500: '#059669'
        },
        red: {
          500: '#EF4444'
        },
        gray: {
          700: '#414243',
          900: '#000000'
        },
        'primary-blue': '#2563EB',
        'light-blue': '#E0F2FE',
        'pale-blue': '#DBEAFE',
        'light-pink': '#FADEEB',
        'gray-medium': '#414243',
        'gray-dark': '#111827',
        'success-green': '#059669',
        'light-green': '#D1FAE5'
      },
      fontFamily: {
        primary: ['Segoe UI', 'system-ui', 'sans-serif'],
        secondary: ['Source Sans Pro', 'system-ui', 'sans-serif']
      }
    }
  }
};

// Language Switching
let currentLanguage = 'en';
function toggleLanguage(lang) {
  currentLanguage = lang;
  const langEn = document.getElementById('lang-en');
  const langEs = document.getElementById('lang-es');

  if (langEn && langEs) {
    langEn.className = lang === 'en'
      ? 'px-3 py-1 text-sm font-medium text-primary-blue bg-white rounded-full shadow-sm'
      : 'px-3 py-1 text-sm font-medium text-gray-dark hover:text-primary-blue transition-colors';
    langEs.className = lang === 'es'
      ? 'px-3 py-1 text-sm font-medium text-primary-blue bg-white rounded-full shadow-sm'
      : 'px-3 py-1 text-sm font-medium text-gray-dark hover:text-primary-blue transition-colors';
  }

  document.querySelectorAll('[data-en][data-es]').forEach(el => {
    const translation = el.getAttribute('data-' + lang);
    if (translation !== null) {
      el.textContent = translation;
    }
  });
}

// Mobile Menu
function toggleMobileMenu(button) {
  const trigger = button instanceof HTMLElement ? button : document.querySelector('button[onclick*="toggleMobileMenu"]');
  const menuId = trigger?.getAttribute('aria-controls') || 'mobile-menu';
  const menu = document.getElementById(menuId);
  if (!menu) return;

  const isHidden = menu.classList.toggle('hidden');
  if (trigger) {
    trigger.setAttribute('aria-expanded', String(!isHidden));
    const srOnly = trigger.querySelector('.sr-only');
    if (srOnly) {
      srOnly.textContent = isHidden ? 'Open navigation' : 'Close navigation';
    }
  }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  toggleLanguage('en');
  initFormValidation();
  // Initialize CSS-driven background shapes (replacement for floating-shapes.js)
  try {
    initBackgroundShapes();
  } catch (e) {
    // non-fatal: shapes are decorative
    console.warn('initBackgroundShapes failed', e);
  }
  // Initialize lightweight particle background (canvas)
  try {
    // lazy-load particle module and initialize with per-page options
    loadAndInitParticles();
  } catch (e) {
    console.warn('initParticleBackground failed', e);
  }
});

// Lazy-load `assets/js/particles.js` and initialize it with options
function loadAndInitParticles() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const container = document.querySelector('[data-bg-shapes]');
  if (!container) return;
  const setting = (container.getAttribute('data-particles') || 'med').toLowerCase();
  if (setting === 'off') return;

  // color: per-container override, CSS var `--particle-color`, or site purple token
  const colorAttr = container.getAttribute('data-particle-color') || '';
  const cssColor = getComputedStyle(document.documentElement).getPropertyValue('--particle-color') || '';
  const rootPurple = getComputedStyle(document.documentElement).getPropertyValue('--purple') || '';
  const color = (colorAttr || cssColor || rootPurple || '#7C3AED').trim();

  const densityMap = { low: 0.6, med: 1, high: 1.6 };
  const densityScale = densityMap[setting] || (isFinite(parseFloat(setting)) ? parseFloat(setting) : 1);

  const options = {
    densityScale: densityScale,
    color: color,
    influence: parseFloat(container.getAttribute('data-particle-influence')) || 120,
    burstForce: parseFloat(container.getAttribute('data-particle-burst')) || undefined
  };

  if (window.initParticleBackground) {
    try { window.__particleHandle = window.initParticleBackground(options); } catch (e) { console.warn(e); }
    return;
  }

  const script = document.createElement('script');
  script.src = 'assets/js/particles.js';
  script.async = true;
  script.onload = () => {
    try { window.__particleHandle = window.initParticleBackground(options); } catch (e) { console.warn('particle init failed', e); }
  };
  script.onerror = (e) => { console.warn('Failed to load particles.js', e); };
  document.head.appendChild(script);
}

function initFormValidation() {
  const forms = document.querySelectorAll('[data-validate="contact"]');

  forms.forEach(form => {
    const fields = Array.from(form.querySelectorAll('[data-validate-field]'));

    const validateField = (field) => {
      const errorElement = document.getElementById(`${field.id}-error`);
      if (!errorElement) return true;

      let errorMessage = '';
      const value = field.value.trim();

      if (field.hasAttribute('required') && value === '') {
        errorMessage = field.dataset.errorRequired || 'This field is required.';
      } else if (value !== '') {
        if (field.type === 'email' && !/^\S+@\S+\.\S+$/.test(value)) {
          errorMessage = field.dataset.errorInvalid || 'Enter a valid email address.';
        }
        if (field.type === 'tel' && value !== '' && !/^\+?[0-9\s().-]{7,}$/.test(value)) {
          errorMessage = field.dataset.errorInvalid || 'Enter a valid phone number.';
        }
      }

      if (errorMessage) {
        errorElement.textContent = errorMessage;
        errorElement.classList.add('active');
        field.setAttribute('aria-invalid', 'true');
        return false;
      }

      errorElement.textContent = '';
      errorElement.classList.remove('active');
      field.setAttribute('aria-invalid', 'false');
      return true;
    };

    fields.forEach(field => {
      const events = ['blur'];
      if (field.tagName === 'SELECT') {
        events.push('change');
      } else {
        events.push('input');
      }

      events.forEach(eventName => {
        field.addEventListener(eventName, () => {
          if (eventName === 'input' && field.getAttribute('aria-invalid') !== 'true') {
            return;
          }
          validateField(field);
        });
      });
    });

    form.addEventListener('submit', (event) => {
      let formIsValid = true;
      fields.forEach(field => {
        const fieldIsValid = validateField(field);
        if (!fieldIsValid) {
          formIsValid = false;
        }
      });

      if (!formIsValid) {
        event.preventDefault();
        const firstInvalidField = fields.find(field => field.getAttribute('aria-invalid') === 'true');
        if (firstInvalidField) {
          firstInvalidField.focus();
        }
      }
    });
  });
}

// Initialize simple floating animation for `.floating-shape` elements.
// Uses `data-speed` to vary duration and `data-shape` for CSS-only visuals.
function initBackgroundShapes() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const containers = document.querySelectorAll('[data-bg-shapes], [data-floating-shapes]');
  containers.forEach(container => {
    const shapes = Array.from(container.querySelectorAll('.floating-shape'));
    shapes.forEach(shape => {
      const speed = Math.max(0.15, parseFloat(shape.dataset.speed) || 0.5);
      // Faster speed (higher number) -> shorter duration
      const duration = (6 / speed).toFixed(2) + 's';
      const delay = (Math.random() * 2).toFixed(2) + 's';
      shape.style.animation = `float ${duration} ease-in-out ${delay} infinite`;
      // Add class for CSS tweaks
      shape.classList.add('floating');
    });
  });
}

// Lightweight canvas particle background. Initializes only when a `[data-bg-shapes]`
// container exists on the page. Respects `prefers-reduced-motion`.
function initParticleBackground() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!document.querySelector('[data-bg-shapes]')) return;
  if (document.getElementById('particle-bg')) return; // already initialized

  // prefer a CSS override, otherwise use a darker purple (good contrast on light backgrounds)
  const colorVar = getComputedStyle(document.documentElement).getPropertyValue('--particle-color') || '';
  const defaultColor = colorVar.trim() || 'rgba(94,53,177,0.12)';

  const canvas = document.createElement('canvas');
  canvas.id = 'particle-bg';
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '-1';
  canvas.setAttribute('aria-hidden', 'true');

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  document.body.insertBefore(canvas, document.body.firstChild);

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const particles = [];
  // fewer particles by default to keep subtlety on light backgrounds
  const num = Math.max(10, Math.round((width * height) / 150000));

  function rand(min, max) { return Math.random() * (max - min) + min; }

  for (let i = 0; i < num; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      // slower base velocity for a calm feeling
      vx: rand(-0.18, 0.18),
      vy: rand(-0.12, 0.12),
      // slightly smaller sizes so they read well on light backgrounds
      r: rand(4, 20) * (Math.random() < 0.5 ? 0.7 : 1),
      // low opacity for subtle contrast
      alpha: rand(0.04, 0.12),
      hue: defaultColor
    });
  }

  let raf = null;

  // pointer interaction state
  const pointer = { x: null, y: null, active: false };

  function draw() {
    ctx.clearRect(0, 0, width, height);
    const time = Date.now();

    particles.forEach(p => {
      // gentle movement + subtle vertical bob
      p.x += p.vx;
      p.y += p.vy + Math.sin((time + p.x) / 600) * 0.1;

      // wrap edges
      if (p.x < -50) p.x = width + 50;
      if (p.x > width + 50) p.x = -50;
      if (p.y < -50) p.y = height + 50;
      if (p.y > height + 50) p.y = -50;

      // interaction: scale when pointer is near
      let drawR = p.r;
      if (pointer.active && pointer.x !== null && pointer.y !== null) {
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const influence = 120;
        if (dist < influence) {
          const factor = 1 + (1 - dist / influence) * 1.0; // up to ~2.0x
          drawR = p.r * factor;
          // subtle repulse effect
          const repulse = (1 - dist / influence) * 0.5;
          p.vx += (dx / dist) * repulse * 0.15 || 0;
          p.vy += (dy / dist) * repulse * 0.12 || 0;
        }
      }

      ctx.beginPath();
      ctx.fillStyle = typeof p.hue === 'string' ? p.hue : defaultColor;
      ctx.globalAlpha = p.alpha;
      ctx.arc(p.x, p.y, drawR, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(draw);
  }

  // pointer handlers: scale on hover, burst on click/tap
  function onPointerMove(e) {
    pointer.active = true;
    const rect = canvas.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
  }

  function onPointerLeave() {
    pointer.active = false;
    pointer.x = pointer.y = null;
  }

  function onPointerDown(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const burstRadius = 100;
    particles.forEach(p => {
      const dx = p.x - x;
      const dy = p.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < burstRadius) {
        // gentler outward impulse to avoid harsh motion
        const force = (1 - dist / burstRadius) * 2.2;
        p.vx += (dx / (dist || 1)) * force;
        p.vy += (dy / (dist || 1)) * force;
        // temporarily increase alpha and size (subtle)
        p.alpha = Math.min(0.45, p.alpha + 0.12);
        p.r = p.r * 1.12;
        // schedule gentle decay back to baseline
        setTimeout(() => { p.r = Math.max(3, p.r * 0.88); p.alpha = Math.max(0.03, p.alpha - 0.08); }, 380 + Math.random() * 260);
      }
    });
  }

  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerleave', onPointerLeave);
  canvas.addEventListener('pointerdown', onPointerDown);

  function onResize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function onVisibility() {
    if (document.hidden) {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
    } else if (!raf) {
      raf = requestAnimationFrame(draw);
    }
  }

  window.addEventListener('resize', onResize);
  document.addEventListener('visibilitychange', onVisibility);

  // start
  raf = requestAnimationFrame(draw);

  // expose a simple cleanup handle in case other scripts need to remove it
  window.__initParticleBackground = window.__initParticleBackground || {};
  window.__initParticleBackground.destroy = () => {
    if (raf) cancelAnimationFrame(raf);
    window.removeEventListener('resize', onResize);
    document.removeEventListener('visibilitychange', onVisibility);
    try {
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      canvas.removeEventListener('pointerdown', onPointerDown);
    } catch (e) {}
    const el = document.getElementById('particle-bg');
    if (el && el.parentNode) el.parentNode.removeChild(el);
    raf = null;
  };
}
