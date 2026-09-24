import React, { useMemo } from 'react';
import katex from 'katex';

interface MathTextProps {
  text: string;
  className?: string;
  isArabic?: boolean;
}

export const isArabicText = (text: string): boolean => {
  // Arabic Unicode range \u0600-\u06FF, \u0750-\u077F, \u08A0-\u08FF, \uFB50-\uFDFF, \uFE70-\uFEFF
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicRegex.test(text);
};

export const MathText: React.FC<MathTextProps> = ({ text, className = '', isArabic }) => {
  const renderedContent = useMemo(() => {
    if (!text) return null;

    // Pattern to match $$...$$ (display mode) or $...$ (inline mode)
    const regex = /(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g;
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (!part) return null;

      if (part.startsWith('$$') && part.endsWith('$$') && part.length > 4) {
        const formula = part.slice(2, -2).trim();
        try {
          const html = katex.renderToString(formula, {
            displayMode: true,
            throwOnError: false,
          });
          return (
            <span
              key={index}
              className="my-2 block text-center overflow-x-auto py-1"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return <span key={index} className="font-mono text-red-600 bg-red-50 p-1 rounded">{part}</span>;
        }
      } else if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
        const formula = part.slice(1, -1).trim();
        try {
          const html = katex.renderToString(formula, {
            displayMode: false,
            throwOnError: false,
          });
          return (
            <span
              key={index}
              className="inline-block px-1 align-baseline"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return <span key={index} className="font-mono text-red-600 bg-red-50 p-0.5 rounded">{part}</span>;
        }
      }

      // Normal text: check if this specific segment contains Arabic
      const hasArabic = isArabic || isArabicText(part);
      return (
        <span
          key={index}
          className={hasArabic ? 'font-arabic text-lg inline-block' : ''}
          dir={hasArabic ? 'rtl' : 'ltr'}
        >
          {part}
        </span>
      );
    });
  }, [text, isArabic]);

  const autoRtl = isArabic || isArabicText(text);

  return (
    <div
      className={`${className} ${autoRtl ? 'font-arabic text-lg text-right' : ''}`}
      dir={autoRtl ? 'rtl' : 'ltr'}
    >
      {renderedContent}
    </div>
  );
};
