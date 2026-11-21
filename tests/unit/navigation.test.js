import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initNavigation } from '../../src/scripts/navigation.js';

let rafQueue;

function stubRaf() {
  rafQueue = [];
  vi.stubGlobal(
    'requestAnimationFrame',
    vi.fn((cb) => {
      rafQueue.push(cb);
      return rafQueue.length;
    })
  );
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
}

function flushRaf() {
  const pending = rafQueue.filter(Boolean);
  rafQueue = [];
  pending.forEach((cb) => cb());
}

function setScrollY(value) {
  Object.defineProperty(window, 'scrollY', {
    value,
    configurable: true,
    writable: true,
  });
}

beforeEach(() => {
  vi.restoreAllMocks();
  stubRaf();
  document.body.innerHTML = `
    <header class="header">
      <nav class="nav">
        <button class="nav__hamburger" aria-expanded="false"></button>
        <div id="nav-links">
          <ul class="nav__links">
            <li><a href="#highlights" class="nav__link">Proof</a></li>
            <li class="nav__item nav__item--dropdown">
              <button class="nav__dropdown-trigger" aria-expanded="false" id="nav-more-trigger">
                More
              </button>
              <div class="nav__dropdown-menu">
                <a href="/technical-interview-preparation-kit/" class="nav__dropdown-item">Technical Interview Prep Kit</a>
              </div>
            </li>
          </ul>
        </div>
      </nav>
    </header>
    <div id="mobile-menu" aria-hidden="true">
      <ul class="mobile-menu__links">
        <li class="mobile-menu__item"><a href="#highlights" class="mobile-menu__link">Proof</a></li>
        <li class="mobile-menu__item mobile-menu__item--accordion">
          <button class="mobile-menu__accordion-trigger" aria-expanded="false">
            <span class="mobile-menu__link-index">06</span>More
          </button>
          <div class="mobile-menu__drawer">
            <div class="mobile-menu__drawer-inner">
              <a href="/technical-interview-preparation-kit/" class="mobile-menu__sublink">Technical Interview Prep Kit</a>
            </div>
          </div>
        </li>
      </ul>
      <a href="https://cal.com/mohammad-noor" class="mobile-menu__cta">Book a conversation</a>
    </div>`;
  setScrollY(0);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('navigation scroll toggle', () => {
  it('adds the scrolled pill past the threshold and removes it near the top', () => {
    initNavigation();
    const header = document.querySelector('.header');

    setScrollY(200);
    window.dispatchEvent(new window.Event('scroll'));
    flushRaf();
    expect(header.classList.contains('nav--scrolled')).toBe(true);

    setScrollY(0);
    window.dispatchEvent(new window.Event('scroll'));
    flushRaf();
    expect(header.classList.contains('nav--scrolled')).toBe(false);
  });

  it('never retriggers a reveal animation while scrolling', () => {
    initNavigation();
    const header = document.querySelector('.header');

    setScrollY(500);
    window.dispatchEvent(new window.Event('scroll'));
    flushRaf();

    for (const y of [490, 480, 470, 460]) {
      setScrollY(y);
      window.dispatchEvent(new window.Event('scroll'));
      flushRaf();
    }

    expect(header.classList.contains('nav--reveal')).toBe(false);
  });
});

describe('desktop More dropdown interaction', () => {
  it('toggles dropdown on click and closes on click outside', () => {
    initNavigation();
    const trigger = document.querySelector('.nav__dropdown-trigger');
    const dropdownItem = document.querySelector('.nav__item--dropdown');

    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(dropdownItem.classList.contains('is-open')).toBe(false);

    // Click to open
    trigger.click();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(dropdownItem.classList.contains('is-open')).toBe(true);

    // Click outside to close
    document.body.click();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(dropdownItem.classList.contains('is-open')).toBe(false);
  });

  it('closes dropdown on Escape key and focuses trigger', () => {
    initNavigation();
    const trigger = document.querySelector('.nav__dropdown-trigger');
    const dropdownItem = document.querySelector('.nav__item--dropdown');

    trigger.click();
    expect(dropdownItem.classList.contains('is-open')).toBe(true);

    const escapeEvent = new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    document.dispatchEvent(escapeEvent);

    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(dropdownItem.classList.contains('is-open')).toBe(false);
  });
});

describe('mobile More accordion interaction', () => {
  it('toggles accordion on click without closing mobile menu', () => {
    initNavigation();
    const hamburger = document.querySelector('.nav__hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    const accordionTrigger = document.querySelector('.mobile-menu__accordion-trigger');
    const accordionItem = document.querySelector('.mobile-menu__item--accordion');

    // Open mobile menu
    hamburger.click();
    expect(mobileMenu.getAttribute('aria-hidden')).toBe('false');

    // Click accordion trigger
    accordionTrigger.click();
    expect(accordionTrigger.getAttribute('aria-expanded')).toBe('true');
    expect(accordionItem.classList.contains('is-open')).toBe(true);
    // Menu should still remain open!
    expect(mobileMenu.getAttribute('aria-hidden')).toBe('false');

    // Click accordion trigger again to close
    accordionTrigger.click();
    expect(accordionTrigger.getAttribute('aria-expanded')).toBe('false');
    expect(accordionItem.classList.contains('is-open')).toBe(false);
    expect(mobileMenu.getAttribute('aria-hidden')).toBe('false');
  });

  it('closes mobile menu when clicking sublink', () => {
    initNavigation();
    const hamburger = document.querySelector('.nav__hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    const sublink = document.querySelector('.mobile-menu__sublink');

    hamburger.click();
    expect(mobileMenu.getAttribute('aria-hidden')).toBe('false');

    sublink.click();
    expect(mobileMenu.getAttribute('aria-hidden')).toBe('true');
  });
});
