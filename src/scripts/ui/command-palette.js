/**
 * ui/command-palette.js — Cmd+K command palette overlay
 *
 * Provides a keyboard-driven command palette using the native <dialog> element
 * for proper focus trapping. Commands are registered with labels, actions,
 * categories, and searchable keywords.
 *
 * @module CommandPalette
 */

/**
 * @typedef {Object} CommandEntry
 * @property {string} id - Unique identifier
 * @property {string} label - Display name in palette
 * @property {() => void} action - Execution callback
 * @property {string} [shortcut] - Keyboard shortcut display
 * @property {string} category - Grouping: 'navigation' | 'action' | 'easter-egg'
 * @property {string[]} keywords - Search terms for filtering
 */

export class CommandPalette {
  /** @type {CommandEntry[]} */
  #commands = [];

  /** @type {CommandEntry[]} */
  #filtered = [];

  /** @type {number} */
  #activeIndex = 0;

  /** @type {HTMLDialogElement | null} */
  #dialog = null;

  /** @type {HTMLInputElement | null} */
  #input = null;

  /** @type {HTMLElement | null} */
  #list = null;

  /** @type {boolean} */
  #initialized = false;

  /** @type {AbortController | null} */
  #abortController = null;

  /**
   * Initialize the command palette — bind global keyboard shortcut and
   * wire up internal event listeners.
   */
  init() {
    this.#dialog = document.querySelector('[data-command-palette]');
    if (!this.#dialog) return;

    this.#input = this.#dialog.querySelector('[data-command-input]');
    this.#list = this.#dialog.querySelector('[data-command-list]');

    if (!this.#input || !this.#list) return;

    this.#abortController = new AbortController();
    const { signal } = this.#abortController;

    // Global Cmd+K / Ctrl+K to toggle palette
    document.addEventListener('keydown', this.#handleGlobalKeydown, { signal });

    // Input filtering
    this.#input.addEventListener('input', this.#handleInput, { signal });

    // Keyboard navigation within the palette
    this.#dialog.addEventListener('keydown', this.#handleDialogKeydown, { signal });

    // Click to select a command
    this.#list.addEventListener('click', this.#handleListClick, { signal });

    // Handle native dialog close (Escape key handled by dialog natively)
    this.#dialog.addEventListener('close', this.#handleClose, { signal });

    this.#initialized = true;
  }

  /**
   * Open the command palette overlay.
   */
  open() {
    if (!this.#dialog || !this.#initialized) return;
    if (this.#dialog.open) return;

    this.#filtered = [...this.#commands];
    this.#activeIndex = 0;
    this.#render();

    this.#dialog.showModal();

    // Clear and focus input
    if (this.#input) {
      this.#input.value = '';
      this.#input.focus();
    }

    document.dispatchEvent(new CustomEvent('command-palette:open'));
  }

  /**
   * Close the command palette overlay.
   */
  close() {
    if (!this.#dialog || !this.#initialized) return;
    if (!this.#dialog.open) return;

    this.#dialog.close();
  }

  /**
   * Register a command in the palette.
   * @param {CommandEntry} cmd - Command to register
   */
  registerCommand(cmd) {
    if (!cmd || !cmd.id || !cmd.label || !cmd.action) return;

    // Prevent duplicate IDs
    const existing = this.#commands.findIndex((c) => c.id === cmd.id);
    if (existing !== -1) {
      this.#commands[existing] = cmd;
    } else {
      this.#commands.push(cmd);
    }
  }

  /**
   * Tear down all listeners and reset state.
   */
  destroy() {
    if (this.#abortController) {
      this.#abortController.abort();
      this.#abortController = null;
    }

    this.#commands = [];
    this.#filtered = [];
    this.#activeIndex = 0;
    this.#dialog = null;
    this.#input = null;
    this.#list = null;
    this.#initialized = false;
  }

  // ─── Private Methods ─────────────────────────────────────────────

  /**
   * Global keydown handler for Cmd+K / Ctrl+K.
   * @param {KeyboardEvent} e
   */
  #handleGlobalKeydown = (e) => {
    const isMac = navigator.platform.toUpperCase().includes('MAC');
    const modifier = isMac ? e.metaKey : e.ctrlKey;

    if (modifier && e.key === 'k') {
      e.preventDefault();
      if (this.#dialog?.open) {
        this.close();
      } else {
        this.open();
      }
    }
  };

  /**
   * Filter commands as user types.
   * @param {Event} e
   */
  #handleInput = (e) => {
    const query = /** @type {HTMLInputElement} */ (e.target).value.toLowerCase().trim();

    if (!query) {
      this.#filtered = [...this.#commands];
    } else {
      this.#filtered = this.#commands.filter((cmd) => {
        const labelMatch = cmd.label.toLowerCase().includes(query);
        const keywordMatch = cmd.keywords?.some((kw) =>
          kw.toLowerCase().includes(query)
        );
        return labelMatch || keywordMatch;
      });
    }

    this.#activeIndex = 0;
    this.#render();
  };

  /**
   * Keyboard navigation inside the dialog.
   * @param {KeyboardEvent} e
   */
  #handleDialogKeydown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.#activeIndex = Math.min(
          this.#activeIndex + 1,
          this.#filtered.length - 1
        );
        this.#updateHighlight();
        break;

      case 'ArrowUp':
        e.preventDefault();
        this.#activeIndex = Math.max(this.#activeIndex - 1, 0);
        this.#updateHighlight();
        break;

      case 'Enter':
        e.preventDefault();
        this.#executeActive();
        break;

      // Escape is handled natively by <dialog>, which fires the 'close' event
    }
  };

  /**
   * Click handler for command list items.
   * @param {MouseEvent} e
   */
  #handleListClick = (e) => {
    const item = /** @type {HTMLElement} */ (e.target).closest(
      '[data-command-id]'
    );
    if (!item) return;

    const id = item.getAttribute('data-command-id');
    const cmd = this.#filtered.find((c) => c.id === id);
    if (cmd) {
      this.close();
      cmd.action();
      document.dispatchEvent(
        new CustomEvent('command-palette:execute', { detail: { command: cmd } })
      );
    }
  };

  /**
   * Handles the dialog close event (fires on Escape or programmatic close).
   */
  #handleClose = () => {
    document.dispatchEvent(new CustomEvent('command-palette:close'));
  };

  /**
   * Execute the currently highlighted command.
   */
  #executeActive() {
    const cmd = this.#filtered[this.#activeIndex];
    if (!cmd) return;

    this.close();
    cmd.action();
    document.dispatchEvent(
      new CustomEvent('command-palette:execute', { detail: { command: cmd } })
    );
  }

  /**
   * Render the filtered command list into the DOM.
   */
  #render() {
    if (!this.#list) return;

    if (this.#filtered.length === 0) {
      this.#list.innerHTML =
        '<li class="command-palette__empty" role="option">No commands found</li>';
      return;
    }

    this.#list.innerHTML = this.#filtered
      .map(
        (cmd, i) => `
        <li class="command-palette__item${i === this.#activeIndex ? ' is-active' : ''}"
            role="option"
            aria-selected="${i === this.#activeIndex}"
            data-command-id="${cmd.id}">
          <span class="command-palette__label">${cmd.label}</span>
          ${cmd.shortcut ? `<kbd class="command-palette__shortcut">${cmd.shortcut}</kbd>` : ''}
        </li>`
      )
      .join('');
  }

  /**
   * Update the highlight state without full re-render.
   */
  #updateHighlight() {
    if (!this.#list) return;

    const items = this.#list.querySelectorAll('[data-command-id]');
    items.forEach((item, i) => {
      const isActive = i === this.#activeIndex;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-selected', String(isActive));

      // Scroll into view if needed
      if (isActive) {
        item.scrollIntoView({ block: 'nearest' });
      }
    });
  }
}
