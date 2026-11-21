/**
 * Navigation module
 * Handles full-screen mobile menu with staggered animations,
 * hamburger toggle, Escape key close, link click close,
 * desktop "More" dropdown, mobile "More" accordion drawer,
 * and glassmorphism scroll toggle.
 */

export function initNavigation() {
  const hamburger = document.querySelector('.nav__hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const header = document.querySelector('.header');

  // Desktop "More" dropdown
  const desktopDropdownItem = document.querySelector('.nav__item--dropdown');
  const desktopDropdownTrigger = document.querySelector('.nav__dropdown-trigger');

  if (desktopDropdownTrigger && desktopDropdownItem) {
    function toggleDesktopDropdown(force) {
      const isOpen = force !== undefined ? force : !desktopDropdownItem.classList.contains('is-open');
      desktopDropdownItem.classList.toggle('is-open', isOpen);
      desktopDropdownTrigger.setAttribute('aria-expanded', String(isOpen));
    }

    desktopDropdownTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDesktopDropdown();
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!desktopDropdownItem.contains(e.target)) {
        toggleDesktopDropdown(false);
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && desktopDropdownItem.classList.contains('is-open')) {
        toggleDesktopDropdown(false);
        desktopDropdownTrigger.focus();
      }
    });
  }

  // Mobile "More" accordion
  const mobileAccordionTrigger = document.querySelector('.mobile-menu__accordion-trigger');
  const mobileAccordionItem = document.querySelector('.mobile-menu__item--accordion');

  if (mobileAccordionTrigger && mobileAccordionItem) {
    function toggleMobileAccordion(force) {
      const isOpen = force !== undefined ? force : !mobileAccordionItem.classList.contains('is-open');
      mobileAccordionItem.classList.toggle('is-open', isOpen);
      mobileAccordionTrigger.setAttribute('aria-expanded', String(isOpen));
    }

    mobileAccordionTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleMobileAccordion();
    });
  }

  if (!hamburger) return;

  function openMenu() {
    hamburger.setAttribute('aria-expanded', 'true');
    if (mobileMenu) {
      mobileMenu.setAttribute('aria-hidden', 'false');
      document.body.classList.add('menu-open');
      // Trap focus: move focus to first link after animation (without visible outline)
      setTimeout(() => {
        const firstLink = mobileMenu.querySelector('.mobile-menu__link, .mobile-menu__accordion-trigger');
        if (firstLink) firstLink.focus({ preventScroll: true, focusVisible: false });
      }, 300);
    }
  }

  function closeMenu() {
    hamburger.setAttribute('aria-expanded', 'false');
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

  // Close when a mobile menu link is clicked (excluding accordion toggle)
  if (mobileMenu) {
    mobileMenu.addEventListener('click', (e) => {
      if (e.target.closest('.mobile-menu__accordion-trigger')) {
        return;
      }
      if (
        e.target.closest('.mobile-menu__link') ||
        e.target.closest('.mobile-menu__sublink') ||
        e.target.closest('.mobile-menu__cta')
      ) {
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

  // Glassmorphism scroll toggle. Class flips are hysteresis-gated (80/40)
  // so the pill never flaps near the threshold; no per-scroll animation —
  // retriggering one on every upward scroll kept the header animating
  // (and compositing) for the whole gesture.
  if (header) {
    const SCROLL_DOWN_THRESHOLD = 80;
    const SCROLL_UP_THRESHOLD = 40;
    let ticking = false;
    let isScrolled = false;

    function updateScrollState() {
      const currentScrollY = window.scrollY;

      // Add scrolled state when past threshold (scrolling down)
      if (currentScrollY > SCROLL_DOWN_THRESHOLD && !isScrolled) {
        isScrolled = true;
        header.classList.add('nav--scrolled');
      }

      // Remove scrolled state when back near top (with tighter threshold for snappier feel)
      if (currentScrollY <= SCROLL_UP_THRESHOLD && isScrolled) {
        isScrolled = false;
        header.classList.remove('nav--scrolled');
      }

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
