import {describe, it, expect} from 'vitest';
import hideTypeColumnPlugin from '../../src/plugins/hideTypeColumnPlugin';

describe('hideTypeColumnPlugin', () => {
  it('should return a valid Docusaurus plugin', () => {
    const plugin = hideTypeColumnPlugin();

    expect(plugin).toBeDefined();
    expect(plugin.name).toBe('hide-type-column-plugin');
    expect(typeof plugin.injectHtmlTags).toBe('function');
  });

  it('should inject a script tag in postBodyTags', () => {
    const plugin = hideTypeColumnPlugin();
    const htmlTags = plugin.injectHtmlTags?.({} as any);

    expect(htmlTags).toBeDefined();
    expect(htmlTags?.postBodyTags).toBeDefined();
    expect(htmlTags?.postBodyTags).toHaveLength(1);
    expect(htmlTags?.postBodyTags?.[0]).toMatchObject({
      tagName: 'script',
    });
  });

  it('should include the hideTypeColumns function in the script', () => {
    const plugin = hideTypeColumnPlugin();
    const htmlTags = plugin.injectHtmlTags?.({} as any);
    const scriptContent = htmlTags?.postBodyTags?.[0]?.innerHTML;

    expect(scriptContent).toBeDefined();
    expect(scriptContent).toContain('function hideTypeColumns()');
    expect(scriptContent).toContain('.theme-doc-markdown.markdown table');
    expect(scriptContent).toContain('typeColumnHidden');
    expect(scriptContent).toContain("textContent.trim().toLowerCase() === 'type'");
  });

  it('should include initialization logic in the script', () => {
    const plugin = hideTypeColumnPlugin();
    const htmlTags = plugin.injectHtmlTags?.({} as any);
    const scriptContent = htmlTags?.postBodyTags?.[0]?.innerHTML;

    expect(scriptContent).toContain('function initialize()');
    expect(scriptContent).toContain('DOMContentLoaded');
    expect(scriptContent).toContain('MutationObserver');
    expect(scriptContent).toContain('.main-wrapper');
    expect(scriptContent).toContain('addEventListener');
  });

  it('should wrap the code in an IIFE', () => {
    const plugin = hideTypeColumnPlugin();
    const htmlTags = plugin.injectHtmlTags?.({} as any);
    const scriptContent = htmlTags?.postBodyTags?.[0]?.innerHTML;

    expect(scriptContent).toContain('(function() {');
    expect(scriptContent?.trim()).toMatch(/\}\)\(\);$/);
  });

  it('should handle navigation events', () => {
    const plugin = hideTypeColumnPlugin();
    const htmlTags = plugin.injectHtmlTags?.({} as any);
    const scriptContent = htmlTags?.postBodyTags?.[0]?.innerHTML;

    expect(scriptContent).toContain('popstate');
    expect(scriptContent).toContain('hashchange');
  });
});

