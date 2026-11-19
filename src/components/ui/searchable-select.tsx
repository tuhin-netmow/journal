"use client";

import React, { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchableSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  searchPlaceholder?: string;
  allowCustom?: boolean;
  disabled?: boolean;
  className?: string;
  required?: boolean;
}

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Select an option...",
  searchPlaceholder = "Type to search...",
  allowCustom = true,
  disabled = false,
  className,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setSearch("");
    }
  }, [isOpen]);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase().trim())
  );

  const exactMatchExists = options.some(
    (opt) => opt.toLowerCase() === search.toLowerCase().trim()
  );

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={cn(
          "w-full h-10 rounded-md border border-academic-border bg-white px-3 py-2 text-sm text-left flex items-center justify-between transition-all",
          "focus:outline-none focus:ring-2 focus:ring-royal/30 focus:border-royal",
          disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : "hover:border-royal/50 cursor-pointer shadow-xs",
          isOpen && "ring-2 ring-royal/30 border-royal"
        )}
      >
        <span className={cn("truncate block", value ? "text-academic-text font-medium" : "text-academic-muted")}>
          {value || placeholder}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-academic-muted shrink-0 ml-2 transition-transform duration-200",
            isOpen && "rotate-180 text-royal"
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-academic-border rounded-lg shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100">
          {/* Search Input Bar */}
          <div className="p-2 border-b border-gray-100 bg-academic-bg/50">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-academic-muted absolute left-2.5 top-2.5 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (filteredOptions.length > 0) {
                      handleSelect(filteredOptions[0]);
                    } else if (allowCustom && search.trim()) {
                      handleSelect(search.trim());
                    }
                  } else if (e.key === "Escape") {
                    setIsOpen(false);
                  }
                }}
                placeholder={searchPlaceholder}
                className="w-full h-8.5 pl-8 pr-7 text-xs bg-white border border-academic-border rounded-md text-academic-text placeholder:text-academic-muted focus:outline-none focus:ring-1 focus:ring-royal focus:border-royal"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto py-1 divide-y divide-gray-50">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.toLowerCase() === value?.toLowerCase();
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={cn(
                      "w-full px-3 py-2 text-xs text-left flex items-center justify-between transition-colors cursor-pointer",
                      isSelected
                        ? "bg-royal/10 text-royal font-semibold"
                        : "text-academic-text hover:bg-academic-bg hover:text-navy"
                    )}
                  >
                    <span className="truncate pr-2">{opt}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-royal shrink-0" />}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-4 text-center">
                <p className="text-xs text-academic-muted">
                  No matching options found.
                </p>
                {allowCustom && search.trim() && !exactMatchExists && (
                  <button
                    type="button"
                    onClick={() => handleSelect(search.trim())}
                    className="mt-2 text-xs font-semibold text-royal hover:underline inline-flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Use &quot;{search.trim()}&quot; as custom value</span>
                  </button>
                )}
              </div>
            )}

            {/* Custom value option if query typed but not exact match */}
            {allowCustom && search.trim() && !exactMatchExists && filteredOptions.length > 0 && (
              <button
                type="button"
                onClick={() => handleSelect(search.trim())}
                className="w-full px-3 py-2 text-xs text-left text-teal hover:bg-teal/10 flex items-center justify-between border-t border-gray-100 font-medium cursor-pointer"
              >
                <span>+ Use custom: &quot;{search.trim()}&quot;</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
