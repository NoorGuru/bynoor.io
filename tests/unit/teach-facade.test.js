import { describe, it, expect, beforeEach } from 'vitest';
import { initTeachFacade, loadPlayer } from '../../src/scripts/teach-facade.js';

const FACADE_HTML = `
  <div class="teach-card__embed">
    <button type="button" class="teach-card__facade"
      data-facade="https://www.youtube-nocookie.com/embed/videoseries?list=ABC123"
      data-title="Demo playlist"
      aria-label="Play Demo playlist">
      <img src="/teach-demo.jpg" alt="" width="640" height="360" loading="lazy">
    </button>
  </div>
`;

describe('teach facade', () => {
  beforeEach(() => {
    document.body.innerHTML = FACADE_HTML;
  });

  it('does nothing when no facades exist', () => {
    document.body.innerHTML = '<div></div>';
    expect(() => initTeachFacade()).not.toThrow();
  });

  it('replaces the facade button with an autoplaying iframe on click', () => {
    initTeachFacade();
    document.querySelector('[data-facade]').click();

    const iframe = document.querySelector('.teach-card__embed iframe');
    expect(iframe).not.toBeNull();
    expect(iframe.src).toBe(
      'https://www.youtube-nocookie.com/embed/videoseries?list=ABC123&autoplay=1'
    );
    expect(iframe.title).toBe('Demo playlist');
    expect(document.querySelector('[data-facade]')).toBeNull();
  });

  it('loads only once per facade', () => {
    initTeachFacade();
    const btn = document.querySelector('[data-facade]');
    btn.click();
    // Second click targets the replaced iframe, not a new player.
    expect(document.querySelectorAll('.teach-card__embed iframe').length).toBe(1);
  });

  it('ignores facades without a source', () => {
    document.querySelector('[data-facade]').removeAttribute('data-facade');
    const btn = document.querySelector('button');
    loadPlayer(btn);
    expect(document.querySelector('iframe')).toBeNull();
  });
});
