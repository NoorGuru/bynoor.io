/**
 * YouTube click-to-load facade.
 * Playlist embeds pull ~4MB of player code each on sight; the facade shows a
 * self-hosted thumbnail and only creates the iframe after an explicit click.
 */
const AUTOPLAY_PARAM = 'autoplay=1';

export function loadPlayer(facade) {
  const src = facade.getAttribute('data-facade');
  const title = facade.getAttribute('data-title') || 'YouTube playlist';
  if (!src) return;

  const iframe = document.createElement('iframe');
  iframe.src = src + (src.includes('?') ? '&' : '?') + AUTOPLAY_PARAM;
  iframe.title = title;
  iframe.allow =
    'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
  iframe.allowFullscreen = true;
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  facade.replaceWith(iframe);
}

export function initTeachFacade(root = document) {
  const facades = Array.from(root.querySelectorAll('[data-facade]'));
  if (!facades.length) return;

  facades.forEach((facade) => {
    facade.addEventListener('click', () => loadPlayer(facade), { once: true });
  });
}
