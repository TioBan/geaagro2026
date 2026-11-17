import React from 'react';

interface FormattedChatMessageProps {
  content: string;
  className?: string;
}

export const FormattedChatMessage: React.FC<FormattedChatMessageProps> = ({
  content,
  className = '',
}) => {
  const renderFormattedLine = (line: string) => {
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
          <strong key={match.index} className="font-semibold text-slate-900 dark:text-white">
            {matchedStr.slice(2, -2)}
          </strong>
        );
      } else if (matchedStr.startsWith('*') && matchedStr.endsWith('*')) {
        parts.push(
          <em key={match.index} className="italic text-slate-700 dark:text-zinc-200">
            {matchedStr.slice(1, -1)}
          </em>
        );
      } else if (matchedStr.startsWith('`') && matchedStr.endsWith('`')) {
        parts.push(
          <code
            key={match.index}
            className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-mono text-[11px]"
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
  let tableRows: string[][] = [];

  const flushList = () => {
    if (currentListItems.length > 0) {
      if (listType === 'ol') {
        renderedBlocks.push(
          <ol
            key={`ol-${renderedBlocks.length}`}
            className="list-decimal list-outside ml-5 my-2 space-y-1.5 text-[13px] leading-relaxed text-slate-700 dark:text-zinc-300"
          >
            {currentListItems}
          </ol>
        );
      } else {
        renderedBlocks.push(
          <ul
            key={`ul-${renderedBlocks.length}`}
            className="list-disc list-outside ml-5 my-2 space-y-1.5 text-[13px] leading-relaxed text-slate-700 dark:text-zinc-300"
          >
            {currentListItems}
          </ul>
        );
      }
      currentListItems = [];
      listType = null;
    }
  };

  const flushTable = () => {
    if (tableRows.length === 0) return;
    const header = tableRows[0];
    const bodyStart =
      tableRows.length > 1 && tableRows[1].every((c) => /^:?-{2,}:?$/.test(c.trim())) ? 2 : 1;
    const body = tableRows.slice(bodyStart);

    renderedBlocks.push(
      <div
        key={`tbl-${renderedBlocks.length}`}
        className="my-3 overflow-x-auto rounded-xl border border-slate-200 dark:border-zinc-800"
      >
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 dark:bg-zinc-950/60 border-b border-slate-200 dark:border-zinc-800">
            <tr>
              {header.map((cell, ci) => (
                <th
                  key={ci}
                  className="px-3 py-2 font-semibold text-slate-900 dark:text-zinc-100 whitespace-nowrap"
                >
                  {renderFormattedLine(cell.trim())}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
            {body.map((row, ri) => (
              <tr key={ri} className="hover:bg-slate-50/70 dark:hover:bg-zinc-900/50">
                {row.map((cell, ci) => (
                  <td key={ci} className="px-3 py-2 text-slate-700 dark:text-zinc-300">
                    {renderFormattedLine(cell.trim())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableRows = [];
  };

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();

    if (line.startsWith('|') && line.endsWith('|')) {
      flushList();
      const cells = line
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());
      tableRows.push(cells);
      return;
    } else {
      flushTable();
    }

    if (!line) {
      flushList();
      renderedBlocks.push(<div key={`spacer-${idx}`} className="h-1.5" />);
      return;
    }

    if (line.startsWith('> ')) {
      flushList();
      renderedBlocks.push(
        <blockquote
          key={`bq-${idx}`}
          className="my-2 pl-3 border-l-2 border-emerald-500 text-xs text-slate-600 dark:text-zinc-400 italic"
        >
          {renderFormattedLine(line.slice(2))}
        </blockquote>
      );
      return;
    }

    if (line.startsWith('### ')) {
      flushList();
      renderedBlocks.push(
        <h4
          key={`h3-${idx}`}
          className="font-semibold text-[13px] text-slate-900 dark:text-white mt-3.5 mb-1 flex items-center gap-2"
        >
          <span className="w-1 h-3.5 bg-emerald-600 dark:bg-emerald-500 rounded-full inline-block" />
          {renderFormattedLine(line.replace('### ', ''))}
        </h4>
      );
      return;
    }

    if (line.startsWith('## ')) {
      flushList();
      renderedBlocks.push(
        <h3
          key={`h2-${idx}`}
          className="font-bold text-sm text-slate-950 dark:text-emerald-400 mt-4 mb-1.5 pb-1 border-b border-slate-200/80 dark:border-zinc-800"
        >
          {renderFormattedLine(line.replace('## ', ''))}
        </h3>
      );
      return;
    }

    if (line.startsWith('# ')) {
      flushList();
      renderedBlocks.push(
        <h2 key={`h1-${idx}`} className="font-bold text-base text-slate-950 dark:text-white mt-4 mb-1.5">
          {renderFormattedLine(line.replace('# ', ''))}
        </h2>
      );
      return;
    }

    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
      }
      const itemText = line.replace(/^[-*]\s+/, '');
      currentListItems.push(
        <li key={`li-${idx}`} className="pl-0.5">
          {renderFormattedLine(itemText)}
        </li>
      );
      return;
    }

    const numberedMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (numberedMatch) {
      if (listType !== 'ol') {
        flushList();
        listType = 'ol';
      }
      currentListItems.push(
        <li key={`oli-${idx}`} className="pl-0.5">
          {renderFormattedLine(numberedMatch[2])}
        </li>
      );
      return;
    }

    flushList();
    renderedBlocks.push(
      <p key={`p-${idx}`} className="text-[13px] leading-relaxed text-slate-700 dark:text-zinc-200 my-1">
        {renderFormattedLine(line)}
      </p>
    );
  });

  flushTable();
  flushList();

  return <div className={`space-y-0.5 ${className}`}>{renderedBlocks}</div>;
};
