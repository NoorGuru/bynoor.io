/**
 * Navigation module
 * Handles full-screen mobile menu with staggered animations,
 * hamburger toggle, Escape key close, link click close,
 * and glassmorphism scroll toggle.
 */

export function initNavigation() {
  const hamburger = document.querySelector('.nav__hamburger');
  const navLinks = document.getElementById('nav-links');
  const mobileMenu = document.getElementById('mobile-menu');
  const header = document.querySelector('.header');

  if (!hamburger) return;

  function openMenu() {
    hamburger.setAttribute('aria-expanded', 'true');
    if (navLinks) navLinks.setAttribute('data-visible', 'true');
    if (mobileMenu) {
      mobileMenu.setAttribute('aria-hidden', 'false');
      document.body.classList.add('menu-open');
      // Trap focus: move focus to first link after animation (without visible outline)
      setTimeout(() => {
        const firstLink = mobileMenu.querySelector('.mobile-menu__link');
        if (firstLink) firstLink.focus({ preventScroll: true, focusVisible: false });
      }, 300);
    }
  }

  function closeMenu() {
    hamburger.setAttribute('aria-expanded', 'false');
    if (navLinks) navLinks.removeAttribute('data-visible');
    if (mobileMenu) {
      mobileMenu.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('menu-open');
    }
  }

  function toggleMenu() {
    const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  // Toggle on hamburger click
  hamburger.addEventListener('click', toggleMenu);

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && hamburger.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      hamburger.focus();
    }
  });

  // Close when a nav link is clicked (desktop)
  if (navLinks) {
    navLinks.addEventListener('click', (e) => {
      if (e.target.closest('.nav__link')) {
        closeMenu();
      }
    });
  }

  // Close when a mobile menu link is clicked
  if (mobileMenu) {
    mobileMenu.addEventListener('click', (e) => {
      if (e.target.closest('.mobile-menu__link') || e.target.closest('.mobile-menu__cta')) {
        closeMenu();
      }
    });

    // Focus trap within mobile menu
    mobileMenu.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;

      const focusableEls = mobileMenu.querySelectorAll(
        'a[href], button:not([disabled])'
      );
      if (focusableEls.length === 0) return;

      const firstEl = focusableEls[0];
      const lastEl = focusableEls[focusableEls.length - 1];

      // Include the hamburger button in the trap
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        hamburger.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        hamburger.focus();
      }
    });
  }

  // Glassmorphism scroll toggle
  if (header) {
    const SCROLL_THRESHOLD = 100;
    let ticking = false;

    function updateScrollClass() {
      if (window.scrollY > SCROLL_THRESHOLD) {
        header.classList.add('nav--scrolled');
      } else {
        header.classList.remove('nav--scrolled');
      }
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollClass);
        ticking = true;
      }
    }, { passive: true });

    // Set initial state in case page is already scrolled
    updateScrollClass();
  }
}
