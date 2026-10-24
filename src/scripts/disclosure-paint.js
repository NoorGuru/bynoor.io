// iOS Safari can leave the newly revealed rows unpainted when a details element opens.
export function initDisclosurePaintFix(root = document) {
  const disclosures = root.querySelectorAll('details[data-disclosure]');
  disclosures.forEach((details) => {
    details.addEventListener('toggle', () => {
      if (!details.open) return;
      const list = details.querySelector('.ledger__secondary-list');
      if (!list) return;
      list.style.display = 'none';
      void list.offsetHeight;
      list.style.display = '';
    });
  });
}
