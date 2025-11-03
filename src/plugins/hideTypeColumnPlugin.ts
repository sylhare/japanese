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
      const typeColumnIndex = headerCells.findIndex((th) => {
        return th.textContent.trim().toLowerCase() === 'type';
      });
      if (typeColumnIndex !== -1) {
        table.dataset.typeColumnHidden = 'true';
        if (headerCells[typeColumnIndex]) {
          headerCells[typeColumnIndex].style.display = 'none';
        }
        const allRows = Array.from(table.querySelectorAll('tr'));
        allRows.forEach((row) => {
          const cells = Array.from(row.querySelectorAll('td, th'));
          if (cells[typeColumnIndex]) {
            cells[typeColumnIndex].style.display = 'none';
          }
        });
      }
    });
  }
  
  function runWithRetry(maxAttempts = 10, delay = 50) {
    let attempts = 0;
    const tryHide = () => {
      attempts++;
      const tables = document.querySelectorAll('.theme-doc-markdown.markdown table');
      if (tables.length > 0) {
        hideTypeColumns();
        if (attempts < maxAttempts) {
          requestAnimationFrame(() => {
            setTimeout(tryHide, delay);
          });
        }
      } else if (attempts < maxAttempts) {
        requestAnimationFrame(() => {
          setTimeout(tryHide, delay);
        });
      }
    };
    requestAnimationFrame(tryHide);
  }
  
  function initialize() {
    hideTypeColumns();
    runWithRetry();
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
  
  const observer = new MutationObserver(() => {
    requestAnimationFrame(() => {
      hideTypeColumns();
    });
  });
  
  function setupObserver() {
    const mainWrapper = document.querySelector('.main-wrapper');
    if (mainWrapper) {
      observer.observe(mainWrapper, { childList: true, subtree: true });
    } else {
      setTimeout(setupObserver, 100);
    }
  }
  
  setupObserver();
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupObserver);
  } else {
    setupObserver();
  }
  
  window.addEventListener('popstate', () => {
    requestAnimationFrame(() => {
      setTimeout(hideTypeColumns, 100);
      runWithRetry();
    });
  });
  
  window.addEventListener('hashchange', () => {
    requestAnimationFrame(() => {
      setTimeout(hideTypeColumns, 100);
      runWithRetry();
    });
  });
  
  if (window.history && window.history.pushState) {
    const originalPushState = window.history.pushState;
    window.history.pushState = function() {
      originalPushState.apply(window.history, arguments);
      requestAnimationFrame(() => {
        setTimeout(hideTypeColumns, 100);
        runWithRetry();
      });
    };
  }
})();
            `,
          },
        ],
      };
    },
  };
}

