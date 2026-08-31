/**
 * HTML Sanitization and Validation Utilities for Rich Text Content in Student Portal
 */

export const decodeHtmlIfNeeded = (text: string): string => {
  if (!text || typeof text !== 'string') return '';
  const trimmed = text.trim();
  if (trimmed.startsWith('&lt;') && trimmed.endsWith('&gt;')) {
    try {
      const doc = new DOMParser().parseFromString(trimmed, 'text/html');
      return doc.documentElement.textContent || trimmed;
    } catch (_) {
      return trimmed;
    }
  }
  return text;
};

export const sanitizeHtml = (rawHtml: string): string => {
  if (!rawHtml || typeof rawHtml !== 'string') return '';

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, 'text/html');

    // Remove script, style, object, embed, and form tags
    const dangerousTags = ['script', 'style', 'object', 'embed', 'form', 'input', 'button', 'iframe'];
    dangerousTags.forEach((tag) => {
      const elements = doc.body.querySelectorAll(tag);
      elements.forEach((el) => el.remove());
    });

    // Remove event handlers and inline javascript URLs
    const allElements = doc.body.querySelectorAll('*');
    allElements.forEach((el) => {
      const attributes = Array.from(el.attributes);
      attributes.forEach((attr) => {
        if (attr.name.toLowerCase().startsWith('on')) {
          el.removeAttribute(attr.name);
        }
      });

      if (el.tagName === 'A') {
        const href = el.getAttribute('href');
        if (href && href.trim().toLowerCase().startsWith('javascript:')) {
          el.removeAttribute('href');
        }
      }
    });

    return doc.body.innerHTML;
  } catch (_e) {
    return rawHtml
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/on\w+='[^']*'/gi, '');
  }
};
