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

  // Glassmorphism scroll toggle with directional awareness
  if (header) {
    const SCROLL_DOWN_THRESHOLD = 80;
    const SCROLL_UP_THRESHOLD = 40;
    let lastScrollY = window.scrollY;
    let ticking = false;
    let isScrolled = false;
    let revealTimeout = null;

    function updateScrollState() {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY;
      const isScrollingDown = scrollDelta > 0;

      // Add scrolled state when past threshold (scrolling down)
      if (currentScrollY > SCROLL_DOWN_THRESHOLD && !isScrolled) {
        isScrolled = true;
        header.classList.add('nav--scrolled');
      }

      // Remove scrolled state when back near top (with tighter threshold for snappier feel)
      if (currentScrollY <= SCROLL_UP_THRESHOLD && isScrolled) {
        isScrolled = false;
        header.classList.remove('nav--scrolled');
        header.classList.remove('nav--reveal');
      }

      // Reveal animation when scrolling up while in scrolled state
      if (!isScrollingDown && isScrolled && Math.abs(scrollDelta) > 4) {
        if (!header.classList.contains('nav--reveal')) {
          header.classList.add('nav--reveal');
          // Remove reveal class after animation completes to allow re-triggering
          clearTimeout(revealTimeout);
          revealTimeout = setTimeout(() => {
            header.classList.remove('nav--reveal');
          }, 400);
        }
      }

      lastScrollY = currentScrollY;
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollState);
        ticking = true;
      }
    }, { passive: true });

    // Set initial state in case page is already scrolled
    updateScrollState();
  }
}
