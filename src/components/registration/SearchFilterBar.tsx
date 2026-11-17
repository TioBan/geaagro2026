import React from 'react';
import { Search, X as CloseIcon } from 'lucide-react';

export interface SearchFilterOption {
  value: string;
  label: string;
}

interface SearchFilterBarProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  searchPlaceholder: string;
  filterId: string;
  onFilterIdChange: (value: string) => void;
  filterAriaLabel: string;
  allOptionLabel: string;
  options: SearchFilterOption[];
  filteredCount: number;
  totalCount: number;
  entityPluralLabel: string;
  onClearFilters: () => void;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchTerm,
  onSearchTermChange,
  searchPlaceholder,
  filterId,
  onFilterIdChange,
  filterAriaLabel,
  allOptionLabel,
  options,
  filteredCount,
  totalCount,
  entityPluralLabel,
  onClearFilters,
}) => {
  if (totalCount === 0) return null;

  return (
    <div className="space-y-2.5 mb-4 p-3 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 rounded-lg text-xs">
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
        <div className="sm:col-span-7 relative">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-8 pr-7 py-1.5 bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 rounded-md text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchTermChange('')}
              className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
              title="Limpar busca"
            >
              <CloseIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="sm:col-span-5 relative">
          <select
            aria-label={filterAriaLabel}
            value={filterId}
            onChange={(e) => onFilterIdChange(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white dark:bg-black border border-slate-300 dark:border-zinc-700 rounded-md text-xs text-slate-900 dark:text-zinc-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 truncate"
          >
            <option value="ALL">{allOptionLabel}</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {(searchTerm || filterId !== 'ALL') && (
        <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 dark:text-zinc-400">
          <span>
            Exibindo <strong className="text-slate-800 dark:text-zinc-200">{filteredCount}</strong> de {totalCount}{' '}
            {entityPluralLabel}
          </span>
          <button
            type="button"
            onClick={onClearFilters}
            className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold cursor-pointer"
          >
            Limpar filtros
          </button>
        </div>
      )}
    </div>
  );
};
