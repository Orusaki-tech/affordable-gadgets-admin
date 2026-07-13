import { marked } from 'marked';
import TurndownService from 'turndown';

marked.setOptions({
  gfm: true,
  breaks: false,
});

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
  emDelimiter: '*',
  strongDelimiter: '**',
});

turndown.addRule('images', {
  filter: 'img',
  replacement: (_content, node) => {
    const el = node as HTMLImageElement;
    const alt = el.getAttribute('alt') || '';
    const src = el.getAttribute('src') || '';
    if (!src) return '';
    return `\n\n![${alt}](${src})\n\n`;
  },
});

/** True when the string looks like HTML TipTap would already understand. */
export function looksLikeHtml(input: string): boolean {
  return /<[a-z][\s\S]*>/i.test(input.trim());
}

/** Convert markdown (or passthrough HTML) into HTML for TipTap. */
export function markdownToHtml(input: string): string {
  const text = (input || '').trim();
  if (!text) return '';
  if (looksLikeHtml(text)) return text;
  return marked.parse(text, { async: false }) as string;
}

/** Convert TipTap HTML back to markdown for API / storefront storage. */
export function htmlToMarkdown(input: string): string {
  const text = (input || '').trim();
  if (!text) return '';
  if (!looksLikeHtml(text)) return text;
  return turndown
    .turndown(text)
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
