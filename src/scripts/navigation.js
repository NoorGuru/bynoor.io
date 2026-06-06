/**
 * Navigation module
 * Handles hamburger menu toggle, Escape key close, and link click close.
 */

export function initNavigation() {
  const hamburger = document.querySelector('.nav__hamburger');
  const navLinks = document.getElementById('nav-links');

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
}
