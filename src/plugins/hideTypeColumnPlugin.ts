import type {Plugin} from '@docusaurus/types';

/**
 * Plugin to inject the hideTypeColumn script into all pages
 */
export default function hideTypeColumnPlugin(): Plugin<void> {
  return {
    name: 'hide-type-column-plugin',
    injectHtmlTags() {
      return {
        postBodyTags: [
          {
            tagName: 'script',
            innerHTML: `
(function() {
  function hideTypeColumns() {
    const tables = document.querySelectorAll('.theme-doc-markdown.markdown table');
    tables.forEach((table) => {
      if (table.dataset.typeColumnHidden) return;
      const headerRow = table.querySelector('thead tr') || table.querySelector('tr');
      if (!headerRow) return;
      const headerCells = Array.from(headerRow.querySelectorAll('th'));
      if (headerCells.length === 0) return;
      table.dataset.typeColumnHidden = 'true';
      headerCells.forEach((th, colIndex) => {
        const name = th.textContent.trim().toLowerCase();
        const cls = name === 'type' ? 'hide-column' : name === 'kanji' ? 'hide-on-mobile' : null;
        if (!cls) return;
        Array.from(table.querySelectorAll('tr')).forEach((row) => {
          const cell = row.querySelectorAll('td, th')[colIndex];
          if (cell) cell.classList.add(cls);
        });
      });
    });
  }

  function run() { requestAnimationFrame(hideTypeColumns); }

  function start() {
    run();
    const target = document.querySelector('.main-wrapper') || document.body;
    new MutationObserver(run).observe(target, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
            `,
          },
        ],
      };
    },
  };
}

