import React from 'react';
import { sanitizeHtml, decodeHtmlIfNeeded } from '../../features/learning/utils/sanitizeHtml.util';

interface RichTextRendererProps {
  html?: string | null;
  className?: string;
}

export const RichTextRenderer: React.FC<RichTextRendererProps> = ({ html, className = '' }) => {
  if (!html || !html.trim()) return null;

  const decoded = decodeHtmlIfNeeded(html);
  const isHtml = /<[a-z][\s\S]*>/i.test(decoded);

  if (!isHtml) {
    return (
      <div className={`whitespace-pre-line text-slate-700 dark:text-[#CBD5E1] text-xs sm:text-sm leading-relaxed ${className}`}>
        {decoded}
      </div>
    );
  }

  const cleanHtml = sanitizeHtml(decoded);

  return (
    <div
      className={`prose dark:prose-invert max-w-none break-words leading-relaxed text-xs sm:text-sm text-slate-700 dark:text-[#CBD5E1] [&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-slate-900 [&_h1]:dark:text-[#F8FAFC] [&_h1]:my-2 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:dark:text-[#F8FAFC] [&_h2]:my-2 [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:dark:text-[#F8FAFC] [&_h3]:my-1.5 [&_p]:my-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 [&_blockquote]:border-l-4 [&_blockquote]:border-[var(--brand-primary,#2563EB)] [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:bg-[var(--surface-secondary)] [&_blockquote]:my-2 [&_a]:text-[var(--brand-primary,#2563EB)] [&_a]:underline ${className}`}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
};
