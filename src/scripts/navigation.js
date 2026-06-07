/**
 * Navigation module
 * Handles hamburger menu toggle, Escape key close, link click close,
 * and glassmorphism scroll toggle.
 */

export function initNavigation() {
  const hamburger = document.querySelector('.nav__hamburger');
  const navLinks = document.getElementById('nav-links');
  const header = document.querySelector('.header');

  if (!hamburger || !navLinks) return;

  function openMenu() {
    hamburger.setAttribute('aria-expanded', 'true');
    navLinks.setAttribute('data-visible', 'true');
  }

  function closeMenu() {
    hamburger.setAttribute('aria-expanded', 'false');
    navLinks.removeAttribute('data-visible');
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

  // Close when a nav link is clicked
  navLinks.addEventListener('click', (e) => {
    if (e.target.closest('.nav__link')) {
      closeMenu();
    }
  });

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
