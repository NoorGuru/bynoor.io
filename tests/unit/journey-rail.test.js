import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initJourneyRail } from '../../src/scripts/animation-engine.js';

function stubMatchMedia(matches = false) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  );
}

function stubIntersectionObserver() {
  const instances = [];
  const ObserverMock = vi.fn(function (callback, options) {
    const instance = {
      callback,
      options,
      observed: [],
      unobserved: [],
      observe(el) {
        this.observed.push(el);
      },
      unobserve: vi.fn(function (el) {
        this.unobserved.push(el);
        this.observed = this.observed.filter((o) => o !== el);
      }),
      disconnect: vi.fn(),
    };
    instances.push(instance);
    return instance;
  });
  vi.stubGlobal('IntersectionObserver', ObserverMock);
  return { instances, ObserverMock };
}

beforeEach(() => {
  vi.restoreAllMocks();
  stubMatchMedia(false);
  document.body.innerHTML = '';
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('initJourneyRail', () => {
  it('is a no-op when no journey entries exist', () => {
    document.body.innerHTML = '<div><p>No journey here</p></div>';
    const { ObserverMock } = stubIntersectionObserver();

    initJourneyRail();

    expect(ObserverMock).not.toHaveBeenCalled();
  });

  it('marks all entries lit and sets progress to 1 under reduced motion', () => {
    stubMatchMedia(true);
    document.body.innerHTML = `
      <section class="journey__act">
        <ol class="journey__entries">
          <li class="journey__entry"><span class="journey__node"></span>Role 1</li>
          <li class="journey__entry"><span class="journey__node"></span>Role 2</li>
          <li class="journey__entry"><span class="journey__node"></span>Role 3</li>
        </ol>
      </section>
    `;
    const { ObserverMock } = stubIntersectionObserver();

    initJourneyRail();

    const entries = document.querySelectorAll('.journey__entry');
    expect(entries.length).toBe(3);
    entries.forEach((entry) => {
      expect(entry.classList.contains('journey__entry--lit')).toBe(true);
    });

    const rail = document.querySelector('.journey__entries');
    expect(rail.style.getPropertyValue('--journey-progress')).toBe('1');
    expect(ObserverMock).not.toHaveBeenCalled();
  });

  it('adds journey__entry--lit on intersect and unobserves', () => {
    document.body.innerHTML = `
      <section class="journey__act">
        <ol class="journey__entries">
          <li class="journey__entry"><span class="journey__node"></span>Role 1</li>
          <li class="journey__entry"><span class="journey__node"></span>Role 2</li>
        </ol>
      </section>
    `;
    const { instances } = stubIntersectionObserver();

    initJourneyRail();

    expect(instances.length).toBe(1);
    const observerInstance = instances[0];
    const firstEntry = document.querySelector('.journey__entry');

    expect(firstEntry.classList.contains('journey__entry--lit')).toBe(false);

    // Fire intersection callback
    observerInstance.callback(
      [{ isIntersecting: true, target: firstEntry }],
      observerInstance
    );

    expect(firstEntry.classList.contains('journey__entry--lit')).toBe(true);
    expect(observerInstance.unobserve).toHaveBeenCalledWith(firstEntry);
  });

  it('sets --journey-progress per act from lit count', () => {
    document.body.innerHTML = `
      <section class="journey__act">
        <ol class="journey__entries">
          <li class="journey__entry" id="entry-1"><span class="journey__node"></span>Role 1</li>
          <li class="journey__entry" id="entry-2"><span class="journey__node"></span>Role 2</li>
          <li class="journey__entry" id="entry-3"><span class="journey__node"></span>Role 3</li>
        </ol>
      </section>
    `;
    const { instances } = stubIntersectionObserver();

    initJourneyRail();

    const observerInstance = instances[0];
    const rail = document.querySelector('.journey__entries');
    const entry1 = document.getElementById('entry-1');
    const entry2 = document.getElementById('entry-2');
    const entry3 = document.getElementById('entry-3');

    // 1 of 3 lit -> progress = 0.3333333333333333
    observerInstance.callback(
      [{ isIntersecting: true, target: entry1 }],
      observerInstance
    );
    expect(rail.style.getPropertyValue('--journey-progress')).toBe(
      String(1 / 3)
    );

    // 2 of 3 lit -> progress = 0.6666666666666666
    observerInstance.callback(
      [{ isIntersecting: true, target: entry2 }],
      observerInstance
    );
    expect(rail.style.getPropertyValue('--journey-progress')).toBe(
      String(2 / 3)
    );

    // 3 of 3 lit -> progress = 1
    observerInstance.callback(
      [{ isIntersecting: true, target: entry3 }],
      observerInstance
    );
    expect(rail.style.getPropertyValue('--journey-progress')).toBe('1');
  });
});
