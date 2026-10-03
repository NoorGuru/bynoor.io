/**
 * Lens switch — Engineer / Builder / Teacher re-lenses section order.
 *
 * No-JS safe: the default DOM order IS the Engineer order, so the page is
 * fully sensible with JS disabled. JS only reorders on explicit selection
 * (or a shared ?lens= URL) and persists the choice in localStorage.
 *
 * The reorder is instant (no motion), so prefers-reduced-motion needs no
 * special path. Section <hr> dividers travel with their section.
 */

export const LENSES = ['engineer', 'builder', 'teacher'];

// Section IDs in display order per lens. 'hero' always stays first.
export const LENS_ORDERS = {
  engineer: [
    'hero',
    'eg-case',
    'highlights',
    'projects',
    'teach',
    'journey',
    'skills',
    'recommendations',
    'links',
    'prep-kit',
  ],
  builder: [
    'hero',
    'eg-case',
    'projects',
    'highlights',
    'skills',
    'journey',
    'teach',
    'recommendations',
    'links',
    'prep-kit',
  ],
  teacher: [
    'hero',
    'teach',
    'prep-kit',
    'eg-case',
    'highlights',
    'projects',
    'journey',
    'skills',
    'recommendations',
    'links',
  ],
};

/**
 * Returns the lens name when valid, otherwise the Engineer default.
 * @param {string|null} raw
 * @returns {string}
 */
export function resolveLens(raw) {
  return LENSES.includes(raw) ? raw : 'engineer';
}

function readStoredLens() {
  try {
    return window.localStorage.getItem('bynoor-lens');
  } catch {
    return null;
  }
}

function storeLens(lens) {
  try {
    window.localStorage.setItem('bynoor-lens', lens);
  } catch {
    // Private mode: persistence is best-effort, selection still applies.
  }
}

export function initLens() {
  const switchEl = document.querySelector('.lens-switch');
  const main = document.querySelector('main');
  if (!switchEl || !main) return;

  const buttons = Array.from(switchEl.querySelectorAll('[data-lens]'));
  if (!buttons.length) return;

  const sections = new Map();
  main.querySelectorAll(':scope > section[id]').forEach((s) => sections.set(s.id, s));

  function applyLens(lens, { persist = true } = {}) {
    const order = LENS_ORDERS[lens];
    if (!order) return;
    order.forEach((id) => {
      const el = sections.get(id);
      if (!el) return;
      const divider = el.nextElementSibling;
      main.appendChild(el);
      if (divider && divider.matches('hr.section-divider')) {
        main.appendChild(divider);
      }
    });
    buttons.forEach((btn) => {
      btn.setAttribute('aria-pressed', btn.dataset.lens === lens ? 'true' : 'false');
    });
    if (persist) {
      storeLens(lens);
      const url = new URL(window.location.href);
      url.searchParams.set('lens', lens);
      window.history.replaceState(null, '', url);
    }
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => applyLens(btn.dataset.lens));
  });

  // Initial: ?lens= wins, then stored choice, else Engineer (DOM order untouched).
  const params = new URLSearchParams(window.location.search);
  applyLens(resolveLens(params.get('lens') || readStoredLens()), { persist: false });
}
