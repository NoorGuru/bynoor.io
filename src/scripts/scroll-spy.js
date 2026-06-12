/**
 * Scroll-spy module
 * Uses Intersection Observer to highlight the active navigation link
 * based on which section is currently visible in the viewport.
 * Also applies section-specific accent colors to the active link.
 */

// Map section IDs to their accent hue colors
const SECTION_ACCENTS = {
  highlights: 'hsl(265, 90%, 72%)',
  journey: 'hsl(145, 75%, 55%)',
  skills: 'hsl(195, 85%, 60%)',
  recommendations: 'hsl(330, 80%, 65%)',
  links: 'hsl(45, 90%, 65%)',
  projects: 'hsl(20, 90%, 62%)',
};

export function initScrollSpy() {
  // Graceful degradation: if IntersectionObserver is unsupported, nav still works without active states
  if (!('IntersectionObserver' in window)) return;

  const sections = document.querySelectorAll('main > section[id]');
  const navLinks = document.querySelectorAll('.nav__link');
  const logoLink = document.querySelector('.nav__logo');

  if (!sections.length || !navLinks.length) return;

  // Track which sections are currently intersecting
  const visibleSections = new Map();

  /**
   * Sets the active nav link based on a section ID.
   * Removes active class from all links, then adds it to the matching one.
   * Also applies section-specific accent color via CSS custom property.
   */
  function setActiveLink(sectionId) {
    // Remove active class from all nav links and logo
    navLinks.forEach((link) => {
      link.classList.remove('nav__link--active');
      link.style.removeProperty('--nav-active-color');
    });
    if (logoLink) logoLink.classList.remove('nav__link--active');

    if (sectionId === 'hero') {
      // When hero is active, highlight the logo
      if (logoLink) logoLink.classList.add('nav__link--active');
      return;
    }

    // Find the nav link whose href matches the section ID
    const activeLink = document.querySelector(`.nav__link[href="#${sectionId}"]`);
    if (activeLink) {
      activeLink.classList.add('nav__link--active');
      // Apply section-specific accent color
      const accentColor = SECTION_ACCENTS[sectionId];
      if (accentColor) {
        activeLink.style.setProperty('--nav-active-color', accentColor);
      }
    }
  }

  /**
   * Determines which section should be active based on current state.
   */
  function updateActiveSection() {
    // Edge case: scrolled to very top — highlight logo/home
    if (window.scrollY < 100) {
      setActiveLink('hero');
      return;
    }

    // Edge case: scrolled to bottom — highlight "Projects"
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 50) {
      setActiveLink('projects');
      return;
    }

    // Find the topmost visible section (smallest top offset among visible ones)
    let topmostSection = null;
    let topmostTop = Infinity;

    visibleSections.forEach((entry, id) => {
      if (entry.isIntersecting) {
        const rect = entry.target.getBoundingClientRect();
        if (rect.top < topmostTop) {
          topmostTop = rect.top;
          topmostSection = id;
        }
      }
    });

    if (topmostSection) {
      setActiveLink(topmostSection);
    }
  }

  // Create observer with threshold and rootMargin to account for sticky header
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        visibleSections.set(entry.target.id, entry);
      });
      updateActiveSection();
    },
    {
      threshold: 0.2,
      rootMargin: '-64px 0px 0px 0px',
    }
  );

  // Observe all sections
  sections.forEach((section) => observer.observe(section));

  // Also update on scroll for edge cases (top/bottom detection)
  window.addEventListener('scroll', updateActiveSection, { passive: true });
}
