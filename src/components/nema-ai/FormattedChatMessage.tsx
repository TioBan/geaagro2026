import React from 'react';

interface FormattedChatMessageProps {
  content: string;
  className?: string;
}

export const FormattedChatMessage: React.FC<FormattedChatMessageProps> = ({
  content,
  className = '',
}) => {
  // Parse paragraphs and basic markdown constructs safely
  const renderFormattedLine = (line: string) => {
    // Bold: **text**
    const parts: (string | React.ReactNode)[] = [];
    const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.substring(lastIndex, match.index));
      }
      const matchedStr = match[0];
      if (matchedStr.startsWith('**') && matchedStr.endsWith('**')) {
        parts.push(
          <strong key={match.index} className="font-bold text-slate-900 dark:text-amber-300">
            {matchedStr.slice(2, -2)}
          </strong>
        );
      } else if (matchedStr.startsWith('*') && matchedStr.endsWith('*')) {
        parts.push(
          <em key={match.index} className="italic text-slate-800 dark:text-zinc-200">
            {matchedStr.slice(1, -1)}
          </em>
        );
      } else if (matchedStr.startsWith('`') && matchedStr.endsWith('`')) {
        parts.push(
          <code
            key={match.index}
            className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 font-mono text-[11px]"
          >
            {matchedStr.slice(1, -1)}
          </code>
        );
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < line.length) {
      parts.push(line.substring(lastIndex));
    }

    return parts.length > 0 ? parts : line;
  };

  const lines = content.split('\n');
  const renderedBlocks: React.ReactNode[] = [];
  let currentListItems: React.ReactNode[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const flushList = () => {
    if (currentListItems.length > 0) {
      if (listType === 'ol') {
        renderedBlocks.push(
          <ol key={`ol-${renderedBlocks.length}`} className="list-decimal list-outside ml-5 my-2 space-y-1 text-xs leading-relaxed text-slate-700 dark:text-zinc-300 font-medium">
            {currentListItems}
          </ol>
        );
      } else {
        renderedBlocks.push(
          <ul key={`ul-${renderedBlocks.length}`} className="list-disc list-outside ml-5 my-2 space-y-1 text-xs leading-relaxed text-slate-700 dark:text-zinc-300 font-medium">
            {currentListItems}
          </ul>
        );
      }
      currentListItems = [];
      listType = null;
    }
  };

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();

    if (!line) {
      flushList();
      renderedBlocks.push(<div key={`spacer-${idx}`} className="h-2" />);
      return;
    }

    // Heading 3: ### Title
    if (line.startsWith('### ')) {
      flushList();
      renderedBlocks.push(
        <h4 key={`h3-${idx}`} className="font-extrabold text-sm text-slate-900 dark:text-white mt-3 mb-1.5 flex items-center gap-1.5">
          <span className="w-1.5 h-3.5 bg-amber-500 rounded-full inline-block" />
          {renderFormattedLine(line.replace('### ', ''))}
        </h4>
      );
      return;
    }

    // Heading 2: ## Title
    if (line.startsWith('## ')) {
      flushList();
      renderedBlocks.push(
        <h3 key={`h2-${idx}`} className="font-black text-base text-slate-950 dark:text-amber-400 mt-4 mb-2 pb-1 border-b border-slate-200 dark:border-zinc-800">
          {renderFormattedLine(line.replace('## ', ''))}
        </h3>
      );
      return;
    }

    // Heading 1: # Title
    if (line.startsWith('# ')) {
      flushList();
      renderedBlocks.push(
        <h2 key={`h1-${idx}`} className="font-black text-lg text-slate-950 dark:text-white mt-4 mb-2">
          {renderFormattedLine(line.replace('# ', ''))}
        </h2>
      );
      return;
    }

    // Bullet List: - item or * item
    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
      }
      const itemText = line.replace(/^[-*]\s+/, '');
      currentListItems.push(
        <li key={`li-${idx}`} className="pl-1">
          {renderFormattedLine(itemText)}
        </li>
      );
      return;
    }

    // Numbered List: 1. item
    const numberedMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (numberedMatch) {
      if (listType !== 'ol') {
        flushList();
        listType = 'ol';
      }
      currentListItems.push(
        <li key={`oli-${idx}`} className="pl-1">
          {renderFormattedLine(numberedMatch[2])}
        </li>
      );
      return;
    }

    // Normal paragraph line
    flushList();
    renderedBlocks.push(
      <p key={`p-${idx}`} className="text-xs leading-relaxed text-slate-800 dark:text-zinc-200 font-medium my-1">
        {renderFormattedLine(line)}
      </p>
    );
  });

  flushList();

  return <div className={`space-y-1 ${className}`}>{renderedBlocks}</div>;
};
