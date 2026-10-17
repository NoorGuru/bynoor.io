/**
 * Clipboard & Toast Module
 * Provides 1-click clipboard copy for email addresses and snippets with
 * an editorial toast notification and graceful fallback.
 */

let activeToastTimeout = null;

function showToast(message = 'Copied to clipboard ✓') {
  let toast = document.getElementById('clipboard-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'clipboard-toast';
    toast.className = 'clipboard-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.remove('clipboard-toast--hidden');
  toast.classList.add('clipboard-toast--visible');

  if (activeToastTimeout) {
    clearTimeout(activeToastTimeout);
  }

  activeToastTimeout = setTimeout(() => {
    toast.classList.remove('clipboard-toast--visible');
    toast.classList.add('clipboard-toast--hidden');
  }, 2600);
}

export async function copyToClipboard(text, customMessage) {
  if (!text) return;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      showToast(customMessage || 'Email copied to clipboard ✓');
      return true;
    }
  } catch (err) {
    console.warn('Clipboard write failed, using textarea fallback', err);
  }

  // Fallback for older browsers or non-secure contexts
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    if (successful) {
      showToast(customMessage || 'Email copied to clipboard ✓');
      return true;
    }
  } catch (fallbackErr) {
    console.error('Fallback clipboard copy failed', fallbackErr);
  }

  return false;
}

export function initClipboard(root = document) {
  const copyElements = root.querySelectorAll('[data-copy-email], [data-copy-text]');

  copyElements.forEach((el) => {
    el.addEventListener('click', async (e) => {
      const email = el.getAttribute('data-copy-email');
      const text = email || el.getAttribute('data-copy-text');
      const msg = el.getAttribute('data-copy-msg') || (email ? 'Email copied: ' + email + ' ✓' : 'Copied to clipboard ✓');

      // Prevent navigating if it was a mailto link
      if (email && el.tagName.toLowerCase() === 'a') {
        // If meta key or ctrl key is pressed, allow default mailto
        if (!e.metaKey && !e.ctrlKey) {
          e.preventDefault();
        }
      }

      await copyToClipboard(text, msg);

      // Temporary button state change if it's a button
      const label = el.querySelector('.hero__btn-copy-label');
      if (label) {
        const originalText = label.textContent;
        label.textContent = 'Copied! ✓';
        setTimeout(() => {
          label.textContent = originalText;
        }, 2000);
      }
    });
  });
}
