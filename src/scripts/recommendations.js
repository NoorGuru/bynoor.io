// Recommendations — expand/collapse toggle
export function initRecommendations() {
  const toggles = document.querySelectorAll('.recommendations__toggle');

  toggles.forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.recommendations__card');
      if (!card) return;

      const isExpanded = card.classList.contains('is-expanded');
      const textEl = btn.querySelector('.recommendations__toggle-text');

      if (isExpanded) {
        card.classList.remove('is-expanded');
        btn.setAttribute('aria-expanded', 'false');
        if (textEl) textEl.textContent = 'Read more';
      } else {
        card.classList.add('is-expanded');
        btn.setAttribute('aria-expanded', 'true');
        if (textEl) textEl.textContent = 'Read less';
      }
    });
  });
}
